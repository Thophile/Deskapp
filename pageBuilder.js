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

//On Start
$(document).ready(function () {
    //Load navbar
    $("#header").load("_navbar.html", () => {
        addAction()
    });
    //Load home
    $('#main').load("home.html")

    //Load json local data
    loadData()
});


//Load a page in the main section
function loadPage(filename) {
    $("#main").load(filename);
    log(filename + " loaded")
    saveData()
    loadData()
}

//Window Action Init
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

//Toogle the side navbar
var navToggled = false;

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

//Output message with date in a custom console
function log(content) {
    date = new Date()
    document.getElementById("console").innerHTML = " <i class=\"fas fa-caret-right\"></i> " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "  " + content;
}

function getDayName(locale) {
    return new Date().toLocaleDateString(locale, { weekday: 'long' });
}



//** Data Storage **/


var data;

function saveData() {
    if (data === undefined) {
        data = {
            watchList: [],
            tasks: []
        }
    }
    fs.writeFile(path.resolve(__dirname, '../data.json'), JSON.stringify(data), function (err) {
        if (err) throw err
    });
    console.log(data)
}

function loadData() {
    fs.readFile(path.resolve(__dirname, '../data.json'), (err, raw_data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                saveData()
            } else {
                //throwing other error
                throw err;
            }
        } else {
            //Saving data object with the configuration
            data = JSON.parse(raw_data);
            console.log("data successfully readed")
        }
    })
}


/** Watchlist **/

//Dispend the form
function formDispend() {
    $("#form_row").load('./watchList_form.html');
}

//Dispend the button
function buttonDispend() {
    $("#form_row").load('./watchList_button_new.html');
}

//Display the watchlist
function loadWatchList() {
    if (data.watchList !== []) {

        //Creating table
        var tbody = document.getElementById('tbody')
        tbody.innerHTML = ""
        tbody.className = ''
        for (let i = 0; i < data.watchList.length; i++) {

            //Reminder
            if (data.watchList[i].day != getDayName('en-GB')) {
                data.watchList[i].remindMe = true
            }

            var row = document.createElement('tr')
            var td = document.createElement('td')
            td.innerHTML = data.watchList[i].name
            td.className = 'truncate w-75 align-middle'
            row.appendChild(td)

            var td = document.createElement('td')
            td.innerHTML = data.watchList[i].lastSeen
            td.className = 'text-center align-middle'
            row.appendChild(td)


            var td = document.createElement('td')
            td.className = 'btn-group'
            //Action button
            var button = document.createElement('button')
            button.className = 'btn btn-dark colored'
            button.title = 'I\'ve seen one less !'
            button.addEventListener('click', () => {
                minusEpisode(i)
            })
            button.innerHTML = '<i class="fas fa-minus-square"></i>'
            td.appendChild(button)

            var button = document.createElement('button')
            button.className = 'btn btn-dark colored'
            button.title = 'I\'ve seen one more !'
            button.addEventListener('click', () => {
                plusEpisode(i)
            })
            button.innerHTML = '<i class="fas fa-plus-square"></i>'
            td.appendChild(button)

            var button = document.createElement('button')
            button.className = 'btn btn-dark colored'
            button.title = 'Follow link'
            button.addEventListener('click', () => {
                shell.openExternal(data.watchList[i].watchLink)
                data.watchList[i].remindMe = false
            })
            button.innerHTML = '<i class="fas fa-external-link-alt"></i>'
            td.appendChild(button)

            var button = document.createElement('button')
            button.className = 'btn btn-dark colored'
            button.title = 'Edit'
            button.addEventListener('click', () => {
                editElement(i)
            })
            button.innerHTML = '<i class="fas fa-edit"></i>'
            td.appendChild(button)

            var button = document.createElement('button')
            button.className = 'btn btn-dark colored'
            button.title = 'Remove'
            button.addEventListener('click', () => {
                removeElement(i)
            })
            button.innerHTML = '<i class="fas fa-trash"></i>'
            td.appendChild(button)

            row.appendChild(td)
            if (data.watchList[i].remindMe == true && data.watchList[i].day == getDayName('en-GB')) {
                row.className = 'remind'

            } else {
                row.className = ''
            }

            tbody.appendChild(row)
        }
    }
    saveData()
}

//Remove and refresh the watchList
function removeElement(index) {

    data.watchList.splice(index, 1)
    loadWatchList()
}

//Add and refresh the watchList
function addElement() {
    var element = {
        name: document.getElementById('_name').value,
        lastSeen: document.getElementById('_lastSeen').value,
        watchLink: document.getElementById('_watchLink').value,
        day: document.getElementById('_day').value,
        remindMe: true,
    }
    data.watchList.splice(0, 0, element)
    buttonDispend()
    loadWatchList()
}

//Load in the form for editing
function editElement(index) {
    $("#form_row").load('./watchList_form.html', function () {
        var element = data.watchList[index]
        document.getElementById('_name').setAttribute('value', element.name)
        document.getElementById('_lastSeen').setAttribute('value', element.lastSeen)
        document.getElementById('_watchLink').setAttribute('value', element.watchLink)
        for (let i = 0; i < document.getElementById('_day').options.length; i++) {

            if (document.getElementById('_day').options[i].value === element.day) {
                document.getElementById('_day').options.selectedIndex = i
            }
        }
        removeElement(index)
    })
    saveData()
}


function plusEpisode(index) {
    data.watchList[index].lastSeen++
    data.watchList[index].remindMe = false
    loadWatchList()
}

function minusEpisode(index) {
    data.watchList[index].lastSeen--
    data.watchList[index].remindMe = false
    loadWatchList()
}


/** Tasks **/

