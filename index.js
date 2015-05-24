/*jslint node:true, nomen:true*/
'use strict';

var electron = require('electron-prebuilt'),
  proc = require('child_process');

var child = proc.spawn(electron, ['--debug-brk=5858', 'app/']);