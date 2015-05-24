/* global __dirname */
/* global process */
var path = require('path'),
	fs = require('fs-extra');

var configFile = path.join(__dirname, 'jsbin.config.json');

var config = {
	'store': {
		'adapter': 'file',
		'file': {
			'location': path.join(__dirname, 'jsbin-file')
		}
	}
};

// init environment var before loading jsbin
process.env.JSBIN_CONFIG = configFile;

// write config file
fs.writeJsonSync(configFile, config);

// init jsbin server
var jsbin = require('../lib/jsbin');
var jsbinApp = jsbin.app;
jsbinApp.connect();

jsbinApp.on('connected', function () {
	process.send({ type: 'connected' });
});