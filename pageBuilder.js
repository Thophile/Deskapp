/**
 * Author : Thophile
 * Project : Deskapp
 */

const fs = require('fs')
const path = require('path')
const { shell } = require('electron')
const { remote } = require('electron')

const $ = require('jquery');
require('popper.js');
require('bootstrap');

const api_url = "https://theophile.alexandresauner.fr/api_deskapp/";
var navToggled = false;
var logToggled = false;
    
var config = require('electron').remote.getGlobal("config")
var details = require('electron').remote.getGlobal("details")

//On Start
$(document).ready(function () {

    //Load json local config
    loadConfig(function () {
        //Load navbar
        $("#header").load("_navbar.html", () => {
            addAction()
        });
        //Load home
        $('#main').load("home.html")


        //query the api for distant data
        loadData()
    })
});

//Load a page in the main section
function loadPage(str) {
    $("#main").load(str);
    log(str[0].toUpperCase() + "" + str.substring(1, str.length -5) + " loaded")
    loadConfig();
    try{
        saveData(loadData());
    }catch(e){
        if (e.name !== "TypeError") throw e
    }
    

}

//Window Action Init
function addAction() {

    document.getElementById('minimize').addEventListener('click', (e) => {
        e.preventDefault()
        var window = remote.getCurrentWindow();
        window.minimize();
    })

    document.getElementById('maximize').addEventListener('click', (e) => {
        e.preventDefault()
        var window = remote.getCurrentWindow();
        if (!window.isMaximized()) {
            window.maximize();
        } else {
            window.unmaximize();
        }
    })

    document.getElementById('close').addEventListener('click', (e) => {
        e.preventDefault()
        var window = remote.getCurrentWindow();
        window.close();


    })
    let str = config.jwt ? " back" : " ";
    log("Welcome" + str + "!" )
}

//Toogle the side navbar and log pop-up
function toggleNav() {
    if (navToggled) {
        document.getElementById("sidebar").style.width = "0";
        document.getElementById("main").style.marginLeft = "0";
        document.getElementById("console").style.marginLeft = "0";
        navToggled = false
    }
    else {
        document.getElementById("sidebar").style.width = "200px";
        document.getElementById("main").style.marginLeft = "200px";
        document.getElementById("console").style.marginLeft = "200px";
        navToggled = true
    }
}
function toggleLog(){
    if(logToggled){
        document.getElementById('log_form').style.display="none"
        logToggled=false
    }else{
        document.getElementById('log_form').style.display="block"
        logToggled=true
    }
    
}

//Output message with date in a custom console
function log(content) {
    date = new Date()
    document.getElementById("console").innerHTML = " <i class=\"fas fa-caret-right\"></i> " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "  " + content;
}

function getDayName(locale) {
    return new Date().toLocaleDateString(locale, { weekday: 'long' });
}


//** Data Storage **/

function createAccount(){

    credentials = JSON.stringify(
        {
            email: document.getElementById('_email').value,
            password: document.getElementById('_password').value,
            details: {
                watchList : [],
                tasks : []
            }
        }
    )
    //making the api query
    var params = {
        headers: {
            "content-type":"application/json; charset=UTF-8"
        },
        body: credentials,
        method: "POST" 
    }

    fetch(api_url + "create_user.php", params)
    .then(data=>{
        if(data.status == "400"){
            toggleLog()
        }
        return data.json()
        
        
    })
    .then(res=>{
            document.getElementById('log_error').innerHTML = res.message
    })
    .catch(error=>{console.log(error)})
}

function changeAccount(){
    config.jwt= ""
    saveConfig()
    toggleLog()
}

function logIn(){
    credentials = JSON.stringify({
        email : document.getElementById('_email').value,
        password: document.getElementById('_password').value
    })

    //making the api query
    var params = {
        headers: {
            "content-type":"application/json"
        },
        body: credentials,
        method: "POST" 
    }

    fetch(api_url + "login.php", params)
    .then(data=>{
        if(data.status == "401"){
            document.getElementById('log_error').innerHTML="Access denied"
        }
            return data.json()        
    })
    .then(res=>{
        console.log(res.message)
        config.jwt = res.jwt
        saveConfig()
        loadData()
    })
    .catch(error=>{console.log(error)})

    
}

function saveData(callback) {
    if(details !== undefined && (details.watchList.length !== 0 || details.tasks.length !== 0) ){
        
        credentials = JSON.stringify({
            details: details,
            jwt: config.jwt
        })
        //making the api query
        var params = {
            headers: {
                "content-type":"application/json; charset=UTF-8"
            },
            body: credentials,
            method: "POST" 
        }
    
        fetch(api_url + "update_user.php", params)
        .then(data=>{ 
            return data.json()  
        })
        .then(res=>{
            config.jwt = res.jwt
            saveConfig()
            if (typeof callback === 'function' && callback()) callback();
            
        })
        .catch(error=>{console.log(error)})
    } 
}

function loadData(callback) {

    credentials = JSON.stringify({
        jwt: config.jwt
    })

    var params = {
        headers: {
            "content-type":"application/json; charset=UTF-8"
        },
        body: credentials,
        method: "POST" 
    }

    fetch(api_url + "validate_token.php", params)
    .then(data=>{
        if(data.status == "401"){
            toggleLog()
        }
        return data.json()
    })
    .then(res=>{
        details = res.details;
        config.email = res.data.email;
        saveConfig()
    })
    .catch(error=>{console.log(error)})

    if (typeof callback === 'function') callback();
    
}

/** Settings **/

//Reload the window
function refresh() {

    remote.getGlobal("Start")()
    remote.getCurrentWindow().close();
}

function loadConfig(callback) {
    fs.readFile(path.join(remote.app.getPath('userData'), 'config.json'), (err, data) => {
        if (err) throw err;
        //Saving config object with the configuration
        config = JSON.parse(data);
        
        if (typeof callback === 'function' && callback()) callback();

    })

}

function saveConfig() {

    fs.writeFile(path.join(remote.app.getPath('userData'), 'config.json'), JSON.stringify(config), function (err) {
        if (err) throw err;
    });
}

function updateConfig(){
    config.devTools = document.getElementById('_devTools').checked
    config.openAtLogin = document.getElementById('_openAtLogin').checked
    saveConfig()
}

function displayConfig(){
    //toggle settings
    document.getElementById('_devTools').checked = config.devTools
    document.getElementById('_openAtLogin').checked = config.openAtLogin
    document.getElementById('_username').placeholder = (config.email == undefined ? "Unlogged" : config.email)


}


