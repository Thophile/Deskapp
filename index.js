/**
 * Author : Thophile
 * Project : Deskapp
 */

const electron = require('electron')
const { app, BrowserWindow } = electron
const fs = require('fs')
const path = require('path')




app.on('ready', () => {
    global.Start()
})

var config;
global.Start = function(){
    //Read config file
    fs.readFile(path.resolve(__dirname, './config.json'), (err, data) => {
        if (err){
            if (err.code === 'ENOENT') {

                //Setting default if the file does not exists
                log('File not found , setting defaults');
                config = {
                    width : 800,
                    height : 600,
                    devTools : false
                }
                
                
                fs.writeFile(path.resolve(__dirname, './config.json'), JSON.stringify(config), function (err) {
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
            }
        })
        win.loadURL(`file://${__dirname}/views/index.html`)

        if(config.devTools) win.webContents.openDevTools();
    })
}

