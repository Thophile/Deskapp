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

var navToggled = false;

//default case
$(document).ready(function () {
    //load navbar
    $("#header").load("_navbar.html", () => {
        addAction()
    });
    //load home
    $('#main').load("home.html")

    //make the existing link open externaly
    /*document.querySelector('.external-link').addEventListener('click', (e) => {
        e.preventDefault()
        shell.openExternal("https://twitter.com/TheophileMNT")
    })*/
});


//load a page in main
function loadPage(filename) {
    $("#main").load(filename);
    log(filename + " loaded")
}


function addAction() {

    log("Activating buttons ...")


    document.getElementById('minimize').addEventListener('click', (e) => {
        e.preventDefault()
        var window = remote.getCurrentWindow();
        window.minimize();
    })
    log("Minimize : OK")


    document.getElementById('maximize').addEventListener('click', (e) => {
        e.preventDefault()
        var window = remote.getCurrentWindow();
        if (!window.isMaximized()) {
            window.maximize();
        } else {
            window.unmaximize();
        }
    })
    log("Maximize : OK")

    document.getElementById('close').addEventListener('click', (e) => {
        e.preventDefault()
        var window = remote.getCurrentWindow();
        window.close();
    })
    log("Close : OK")
    log("Application successfully started !")
}

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
    log("Navbar Toggled !")
}

function log(content) {
    date = new Date()
    document.getElementById("console").innerHTML = " <i class=\"fas fa-caret-right\"></i> " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "  " + content;
}