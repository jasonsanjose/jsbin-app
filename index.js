/* global process */
/*jslint node:true, nomen:true*/
'use strict';

var electron = require('electron-prebuilt'),
  proc = require('child_process');

// open electron in a child process
var child = proc.spawn(electron, ['--debug-brk=5858', 'app/']);

// exit the main process when electron exits
child.on('exit', function () {
  process.exit();
});