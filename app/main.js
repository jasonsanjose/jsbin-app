/* global __dirname */
/* global process */
var app = require('app'),
  BrowserWindow = require('browser-window'),
  Menu = require('menu'),
  dialog = require('dialog'),
  shell = require('shell'),
  path = require('path'),
  proc = require('child_process');
  
app.commandLine.appendSwitch('remote-debugging-port', '9235');

// Fork jsbin server as a separate process
var jsbinProc = proc.fork(__dirname + '/main/jsbin.js'),
  jsbinConfig,
  jsbinStoragePath;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null,
  jsbinConnected = false;
  
function loadUrl() {
  if (mainWindow && jsbinConnected) {
    mainWindow.loadUrl('file://' + __dirname + '/render/index.html');
  }
}

function getWindow() {
  return BrowserWindow.getFocusedWindow() || mainWindow;
}

function menuCallback(command) {
  return function () {
    getWindow().webContents.send('command', { command: command });
  };
}

function initMenu() {
  var template = [
    {
      label: 'JSBin',
      submenu: [
        {
          label: 'About JSBin',
          selector: 'orderFrontStandardAboutPanel:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide JSBin',
          accelerator: 'Command+H',
          selector: 'hide:'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:'
        },
        {
          label: 'Show All',
          selector: 'unhideAllApplications:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: function() { app.quit(); }
        },
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'Command+N',
          selector: 'newfile:',
          click: menuCallback("file:new")
        },
        {
          label: 'New Window',
          accelerator: 'Shift+Command+N',
          selector: 'newwindow:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Open...',
          accelerator: 'Command+O',
          selector: 'open:',
          click: function () {
            var win = getWindow();
            
            dialog.showOpenDialog(win, {
              defaultPath: jsbinStoragePath,
              properties: ['openDirectory']
            }, function (filenames) {
              var filepath = filenames && filenames[0],
                isValid = filepath && filepath.indexOf(jsbinStoragePath) === 0;
              
              // Dialog cancelled
              if (!filepath) {
                return;
              }
              
              win.webContents.send('command', {
                command: 'file:open',
                name: path.basename(filepath),
                path: filepath,
                isValid: isValid
              });
            });
          }
        },
//        {
//          label: 'Open Recent',
//          selector: 'openrecent:'
//        },
        {
          label: 'Save',
          accelerator: 'Command+S',
          selector: 'save:',
          click: function () {
            var win = getWindow();
            
            dialog.showSaveDialog(win, {
              defaultPath: jsbinStoragePath
            }, function (filenames) {
              var filepath = filenames && filenames[0],
                isValid = filepath && filepath.indexOf(jsbinStoragePath) === 0;
              
              // Dialog cancelled
              if (!filepath) {
                return;
              }
              
              win.webContents.send('command', {
                command: 'file:save',
                name: path.basename(filepath),
                path: filepath,
                isValid: isValid
              });
            });
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'TODO Show in Finder',
          click: menuCallback("file:showinfinder")
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'Command+Z',
          selector: 'undo:'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+Command+Z',
          selector: 'redo:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'Command+X',
          selector: 'cut:'
        },
        {
          label: 'Copy',
          accelerator: 'Command+C',
          selector: 'copy:'
        },
        {
          label: 'Paste',
          accelerator: 'Command+V',
          selector: 'paste:'
        },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:'
        },
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Output in Default Browser',
          accelerator: 'Shift+Command+O',
          click: menuCallback("view:browser:default")
        },
        {
          type: 'separator'
        },
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: function() {
            getWindow().reloadIgnoringCache();
          }
        },
        {
          label: 'Toggle Render Process DevTools',
          accelerator: 'Alt+Command+I',
          click: function() { getWindow().openDevTools({ detach: true }); }
        },
        {
          label: 'Toggle WebView Process DevTools',
          click: menuCallback("view:devtools")
        },
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:'
        },
        {
          label: 'Close',
          accelerator: 'Command+W',
          selector: 'performClose:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Bring All to Front',
          selector: 'arrangeInFront:'
        },
      ]
    },
    {
      label: 'Help',
      submenu: []
    },
  ];
  
  var menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

jsbinProc.on('message', function (m) {
  jsbinConnected = true;
  jsbinConfig = m.config;
  jsbinStoragePath = path.join(jsbinConfig.store.file.location, 'bins');
  loadUrl();
});

// Report crashes to our server.
require('crash-reporter').start();

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    'width': 800,
    'height': 600
  });
  
  loadUrl();
  initMenu();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});

app.on('window-all-closed', function() {
  app.quit();
});

app.on('quit', function () {
  jsbinProc.kill();
  process.exit();
})