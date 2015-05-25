/* global __dirname */
/* global process */
var path = require('path'),
	fs = require('fs-extra');

var configFile = path.join(__dirname, 'jsbin.config.json'),
	homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];;

var config = {
	'store': {
		'adapter': 'app',
		'app': {
			'location': path.join(homePath, 'jsbin-file')
		}
	}
};

// init environment var before loading jsbin
process.env.JSBIN_CONFIG = configFile;

// write config file
fs.writeJsonSync(configFile, config);

// init jsbin server
var jsbin = require('../../lib/jsbin');
var jsbinApp = jsbin.app;
jsbinApp.connect();

jsbinApp.on('connected', function () {
	process.send({
		type: 'connected',
		config: config
	});
});