/**
 * Author : Thophile
 * Project : Deskapp
 */
/**
 * Build command :
 * electron-packager . --platform=win32 --arch=x64 --overwrite --icon=assets/icons/win/icon_512x512.ico DeskApp
 * node build_installer.js
*/

const electron = require('electron')
const { app, BrowserWindow } = electron
const fs = require('fs')
const path = require('path')
global.config = {
    widgets : [],
    devTools : false,
    openAtLogin : true,
    jwt: ""
}
global.details={
    watchList : [],
    tasks : []
}


app.setLoginItemSettings({
    openAtLogin: config.openAtLogin,
    path: app.getPath("exe")
});

app.on('ready', () => {
    global.Start()
})

app.on('window-all-closed', () => {
    app.quit()
  })
global.Start = function(){
    //Read config file
    fs.readFile(path.join(app.getPath('userData'), 'config.json'), (err, data) => {
        if (err){
            if (err.code === 'ENOENT') {
                //Setting default if the file does not exists
                console.log('File not found , setting defaults');
                fs.writeFile(path.join(app.getPath('userData'), 'config.json'), JSON.stringify(config), function (err) {
                    if (err) throw err;
                });
            } else {
                //throwing other error
                throw err;
            }
        }else{
            //Saving config object with the configuration
            config = JSON.parse(data);
        }
        
        //Creating windows from config 
        let win = new BrowserWindow({
            width: config.width,
            height: config.height,
            minWidth: 450,
            minHeight: 350,
            frame: false,
            icon: __dirname + '/assets/icons/png/icon_512x512.png',
            webPreferences: {
                nodeIntegration: true
            },
        })
        win.maximize()
        win.loadURL(`file://${__dirname}/views/index.html`)
        app.allowRendererProcessReuse = true;
        if(config.devTools) win.webContents.openDevTools();
    })
}

