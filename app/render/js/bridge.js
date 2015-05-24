(function () {
	"use strict";
	
	var ipc = require('ipc');

	var webview,
		commandMap = {};
	
	function cmdOpenDevTools() {
		webview.openDevTools();
	}
	
	function cmdFileOpen(message) {
		if (message.isValid) {
			webview.src = 'http://localhost:3000/' + message.name + '/edit';
		} else {
			window.alert('Directory not valid:\n' + message.path)
		}
	}
	
	window.onload = function () {
		webview = window.document.getElementById('jsbinView');
		
		commandMap = {
			'file:open': cmdFileOpen,
			'file:new': cmdFileOpen,
			'view:devtools': cmdOpenDevTools
		};
	};
	
	ipc.on('command', function (message) {
		console.log(message);
		
		var fn = commandMap && commandMap[message.command];
		
		if (fn) {
			fn.call(null, message);
		}
	});
}());