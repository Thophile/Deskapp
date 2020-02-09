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
    //Load json local data
    loadData(function () {
        //Load navbar
        $("#header").load("_navbar.html", () => {
            addAction()
        });
        //Load home
        $('#main').load("home.html")

    })
    console.log(data)
});


//Load a page in the main section
function loadPage(filename) {
    $("#main").load(filename);
    log(filename + " loaded")
    saveData(loadData())

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

function saveData(callback) {
    if (data === undefined) {
        data = {
            watchList: [],
            tasks: [],
            widgets: []
        }
    }
    fs.writeFile(path.resolve(__dirname, '../data.json'), JSON.stringify(data), function (err) {
        if (err) throw err
        if (typeof callback === 'function' && callback()) callback();

    });
}

function loadData(callback) {
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
            log("Data successfully read")
        }
        if (typeof callback === 'function' && callback()) callback();
    })
}


/** Home **/

//Execute external .exe from path
function execute(executablePath) {

    var child = require('child_process').execFile;

    child(executablePath, function (err, data) {
        if (err) {
            log(err);
            return;
        }

        log(data.toString());
    });
}

//Load the widget stored in data
function loadWidget() {
    var deck = document.getElementById('widgetDeck')
    deck.innerHTML = ""
    if (data.widgets !== []) {
        for (let i = 0; i < data.widgets.length; i++) {
            var div = document.createElement('div')
            div.className = 'widget'
            var img = document.createElement('img')
            img.alt = data.widgets[i].name
            img.className = 'card-img-top'
            img.src = data.widgets[i].src
            img.addEventListener('click', () => {
                execute(data.widgets[i].app)
            })
            div.appendChild(img)
            var ic = document.createElement('div')
            ic.className = "overlay"
            ic.innerHTML = '<i class="fas fa-trash-alt">'
            ic.addEventListener('click', () => {
                removeWidget(i)
            })
            div.appendChild(ic)
            deck.appendChild(div)

        }
    }
    var div = document.createElement('div')
    div.className = 'widget'
    div.innerHTML = '<img class="card-img-top" src="../assets/add.png" alt="Add" onclick="displayHomeForm()">'
    deck.appendChild(div)

}

//Display the form
function displayHomeForm() {
    $('#widgetDeck').load('./home_form.html')
}

//Add a new widget
function addWidget() {
    try {
        //Full path acces only works because of electron
        var widget = {
            name: document.getElementById("_name").value,
            src: document.getElementById("_src").files[0].path,
            app: document.getElementById("_app").files[0].path
        }
        data.widgets.splice(0, 0, widget)
        loadWidget()
    } catch (error) {
        log(error)
    }
}
function removeWidget(index) {
    data.widgets.splice(index, 1)
    loadWidget()
}

/** Watchlist **/

//Display the form
function displayWatchListForm() {
    $("#form_row").load('./watchList_form.html');
}

//Display the button
function displayWatchListButton() {
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
    displayWatchListButton()
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


/** Settings **/

//Reload the window
var config

function refresh() {
    fs.writeFile(path.resolve(__dirname, '../config.json'), JSON.stringify(config), function (err) {
        if (err) throw err;
        remote.getGlobal("Start")()

        remote.getCurrentWindow().close();

    });

}
function loadConfig() {
    fs.readFile(path.resolve(__dirname, '../config.json'), (err, data) => {
        if (err) throw err;
        //Saving config object with the configuration
        config = JSON.parse(data);
        document.getElementById('_devTools').checked = config.devTools
        document.getElementById('_width').setAttribute('value', config.width)
        document.getElementById('_height').setAttribute('value', config.height)
    })

}

function saveConfig() {
    config.devTools = document.getElementById('_devTools').checked
    config.width = document.getElementById('_width').value
    config.height = document.getElementById('_height').value

}
