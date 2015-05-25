'use strict';
var fdb = require('file-db'),
    fs = require('fs-extra'),
    path = require('path'),
    utils = require('../utils'),
    _ = require('underscore');

//DB adapter missing method: updateUserDropboxData
//DB adapter missing method: updateUserSettings
//DB adapter missing method: getOne
//DB adapter missing method: setCustomer
//DB adapter missing method: setCustomerActive
//DB adapter missing method: getCustomerByStripeId
//DB adapter missing method: getCustomerByUser
//DB adapter missing method: setBinVisibility
//DB adapter missing method: updateOwnershipData
//DB adapter missing method: getAssetsForUser
//DB adapter missing method: saveAsset
//DB adapter missing method: deleteAsset

module.exports = utils.inherit(Object, {
  defaults: null,

  constructor: function AppDB(options) {
    this.options    = options;
    this.defaults   = {html: '', css: '', javascript: ''};
    if (!this.options.location) { throw new Error('No database location set.'); }
    this.connection = null;
  },

  connect: function (cb) {
    // Open up a database in a temporary directory and save the connection
    fdb.open(this.options.location, function (err, connection) {
      if (err) { throw err; }
      this.connection = connection;
      cb();
    }.bind(this));
    
    // non-bin related storage
    this.appSettingsLocation = path.join(this.options.location, 'app.json');
    this.appSettings = fs.readJsonSync(this.appSettingsLocation, { throws: false }) || {};
    
    // TODO defaults?
    this.appSettings = _.defaults(this.appSettings, {
      bookmark: []
    });
  },
  
  writeAppSettings: function (data, cb) {
    this.appSettings = _.extend(this.appSettings, data);
    fs.outputJson(this.appSettingsLocation, this.appSettings, cb);
  },

  disconnect: function (cb) {},

  getBin: function (params, cb) {
    var _this = this;
    this.connection
      .use('bins')
      .findById(params.id)
      .exec(function (err, bin) {
        if (err) { return cb(err); }
        // Get the requested revision
        var revision = bin[params.revision];
        // Apply bin defaults
        revision = _.defaults(revision, {
          url: params.id,
          revision: params.revision,
          id: params.id + params.revision,
          html: '',
          css: '',
          javascript: '',
          active: 'y',
          settings: {}
        });
        if (revision.active === 'false') { revision.active = 'n'; }
        else { revision.active = 'y'; }
        // Bookmark most recent bin
        _this.saveBookmark({ url: params.id, revision: revision.revision });
        cb(null, revision);
      });
  },

  setBin: function (params, cb) {
    var data = {
      _id: params.url
    };
    data[params.revision] = {
      javascript: params.javascript || '',
      css: params.css || '',
      html: params.html || '',
      active: 'y',
      settings: {}
    };
    this.connection
      .use('bins')
      .save(data)
      .exec(function (err, bin) {
        if (err) { return cb(err); }
        cb(null, params.revision);
      });
  },

  setBinOwner: function (params, cb) {
    cb(null, null);
  },
  setBinPanel: function (panel, params, cb) {
    cb(null, null);
  },
  getLatestBin: function (params, cb) {
    this.connection
      .use('bins')
      .findById(params.id)
      .exec(function (err, bin) {
        if (err) { return cb(err); }
        // Get the latest revision
        var revisions = Object.keys(bin).map(function (revision) {
          return parseInt(revision, 10);
        }).filter(function (val) { return !!val; });

        var revision = bin[''+Math.max.apply(Math, revisions)];

        // Apply bin defaults
        revision = _.defaults(revision, {
          url: params.id,
          revision: params.revision,
          id: params.id + params.revision,
          html: '',
          css: '',
          javascript: '',
          active: true,
          settings: {}
        });
        if (revision.active === 'false') { revision.active = 'n'; }
        else { revision.active = 'y'; }
        cb(null, revision);
      });
  },
  getLatestBinForUser: function (id, n, cb) {
    var bookmark = this.appSettings.bookmark[0],
      query = bookmark && {
        id: bookmark.url,
        revision: bookmark.revision
      };
    
    if (!query) {
      cb(null, null);
    } else {
      this.getBin(query, cb)
    }
  },
  getBinsByUser: function (id, cb) {
    var _this = this;
    this.connection
      .use('bins')
      .find()
      .exec(function (err, results) {
        if (err) {
          return cb(err);
        }
  
        var collected = [];
  
        // i.e. if they've never saved anything before
        results.forEach(function (result) {
          collected.push(_this.applyBinDefaults(result));
        });
        cb(null, collected);
      });
  },
  getAllOwners: function (cb) {
    cb(null, null);
  },
  getOwnersBlock: function (start, size, cb) {
    cb(null, null);
  },
  generateBinId: function (length, attempts, cb) {
    var id = utils.shortcode(length);
    cb(null, id);
  },
  archiveBin: function (bin, cb) {
    cb(null, null);
  },
  getUser: function (id, cb) {
    cb(null, { name: 'local' });
  },
  getUserByApiKey: function (email, cb) {
    cb(null, { name: 'local' });
  },
  getUserByEmail: function (email, cb) {
    cb(null, { name: 'local' });
  },
  setUser: function (params, cb) {
    cb(null, null);
  },
  touchOwners: function (params, cb) {
    cb(null, null);
  },
  updateOwners: function (params, cb) {
    cb(null, null);
  },
  populateOwners: function (params, cb) {
    cb(null, null);
  },
  touchLogin: function (id, cb) {
    cb(null, null);
  },
  updateUserEmail: function (id, email, cb) {
    cb(null, null);
  },
  updateUserGithubData: function (id, token, cb) {
    cb(null, null);
  },
  updateUserKey: function (id, key, cb) {
    cb(null, null);
  },
  // Different to updateUserKey() in that it also sets the created timestamp
  // which is required to differentiate between a JSBin 2 user and a new
  // one.
  upgradeUserKey: function (id, key, cb) {
    cb(null, null);
  },
  getUserByForgotToken: function (token, cb) {
    cb(null, null);
  },
  setForgotToken: function (user, token, cb) {
    cb(null, null);
  },
  expireForgotToken: function (token, cb) {
    cb(null, null);
  },
  expireForgotTokenByUser: function (user, cb) {
    cb(null, null);
  },
  expireDate: function () {

  },
  applyBinDefaults: function (bin) {
    bin.url = bin._id;
    bin.revision = Math.max.apply(null, Object.keys(bin).filter(function (val) {
      try {
        return !Number.isNaN(Number.parseInt(val));
      } catch (err) {
        // do nothing
      }
      return false;
    }));
    
    for (var prop in this.defaults) {
      if (bin[prop] === null) { // Using == to catch null and undefined.
        bin[prop] = this.defaults[prop];
      }
    }

    if (!bin.last_updated || bin.last_updated === '0000-00-00 00:00:00' || isNaN(bin.last_updated.getTime())) { // jshint ignore:line
      bin.last_updated = new Date('2012-07-23 00:00:00'); // jshint ignore:line
    }

    if (bin.latest === undefined) {
      bin.latest = true;
    }

    try {
      bin.settings = JSON.parse(bin.settings || '{}');
    } catch (e) {
      // this is likely because the settings were screwed in a beta build
      bin.settings = {};
    }

    return bin;
  },
  reportBin: function (params, cb) {
    cb(null, null);
  },
  isOwnerOf: function (params, cb) {
    cb(null, {
      isowner: true
    });
  },
  getUserListing: function (user, fn) {
    fn(null, null);
  },
  getUserBinCount: function (id, cb) {
    this.connection
      .use('bins')
      .find()
      .exec(function (err, bins) {
        cb(null, { total: bins.length });
      });
  },
  setProAccount: function(id, pro, fn) {
    fn(null, null);
  },
  updateBinData: function (bin, params, fn) {
    fn(null, null);
  },
  updateOwnersData: function (bin, params, fn) {
    fn(null, null);
  },
  setCustomer: noop,
  setCustomerActive: noop,
  getCustomerByStripeId: noop,
  getCustomerByUser: noop,
  getBinMetadata: function(bin, fn) {
    this.connection
      .use('bins')
      .findById(bin.url)
      .exec(function (err, bin) {
        if (err) {
          return fn(err);
        }
        // TODO
        fn(null, {
          visibility: 'public',
          name: 'local'
        });
      });
  },
  saveBookmark: function (params, cb) {
    this.writeAppSettings({ bookmark: [params] }, cb);
  },
  getBookmark: function (params, cb) {
    cb(null, this.appSettings.bookmark);
  },
});

var noop = function () {};
