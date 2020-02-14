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
const api_url = "http://localhost/api_deskapp/";
var config = remote.getGlobal("config")
var details;

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

function createAccount(){
    credentials = JSON.stringify(
        {
            email: document.getElementById('_mail').value,
            password: document.getElementById('_password').value,
            details: details
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
    .then(data=>{return data.json()})
    .then(res=>{console.log("res="+res)})
    .catch(error=>{log(error)})
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
    .then(data=>{return data.json()})
    .then(res=>{
        log(res.message)
        config.jwt = res.jwt
        saveConfig()
        loadData()
    })
    .catch(error=>{log(error)})

    
}

function saveData(callback) {

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
    .then(data=>{return data.json()})
    .then(res=>{log(res.message)})
    .catch(error=>{log(error)})

    if (typeof callback === 'function' && callback()) callback();
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
    .then(data=>{return data.json()})
    .then(res=>{
        log(res.message)
        details= res.data.details
    })
    .catch(error=>{log(error)})

    
    log("Data successfully read")
    if (typeof callback === 'function' && callback()) callback();
    
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

//Load the widget stored in config
function loadWidget() {
    var deck = document.getElementById('widgetDeck')
    deck.innerHTML = ""
    if (config.widgets !== []) {
        for (let i = 0; i < config.widgets.length; i++) {
            var div = document.createElement('div')
            div.className = 'widget'
            var img = document.createElement('img')
            img.alt = config.widgets[i].name
            img.className = 'card-img-top'
            img.src = config.widgets[i].src
            img.addEventListener('click', () => {
                execute(config.widgets[i].app)
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
    saveConfig()
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
        config.widgets.splice(0, 0, widget)
        loadWidget()
    } catch (error) {
        log(error)
    }
}
function removeWidget(index) {
    config.widgets.splice(index, 1)
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
    if (details.watchList !== []) {

        //Creating table
        var tbody = document.getElementById('tbody')
        tbody.innerHTML = ""
        tbody.className = ''
        for (let i = 0; i < details.watchList.length; i++) {

            //Reminder
            if (details.watchList[i].day != getDayName('en-GB')) {
                details.watchList[i].remindMe = true
            }

            var row = document.createElement('tr')
            var td = document.createElement('td')
            td.innerHTML = details.watchList[i].name
            td.className = 'truncate w-75 align-middle'
            row.appendChild(td)

            var td = document.createElement('td')
            td.innerHTML = details.watchList[i].lastSeen
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
                shell.openExternal(details.watchList[i].watchLink)
                details.watchList[i].remindMe = false
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
            if (details.watchList[i].remindMe == true && details.watchList[i].day == getDayName('en-GB')) {
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

    details.watchList.splice(index, 1)
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
    details.watchList.splice(0, 0, element)
    displayWatchListButton()
    loadWatchList()
}

//Load in the form for editing
function editElement(index) {
    $("#form_row").load('./watchList_form.html', function () {
        var element = details.watchList[index]
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
    details.watchList[index].lastSeen++
    details.watchList[index].remindMe = false
    loadWatchList()
}

function minusEpisode(index) {
    details.watchList[index].lastSeen--
    details.watchList[index].remindMe = false
    loadWatchList()
}


/** Tasks **/

function loadTasks() {
    var tbody = document.getElementById('tasks')
    tbody.innerHTML = ''
    for (let index = 0; index < details.tasks.length; index++) {
        var tr = document.createElement('tr')

        var td = document.createElement('td')
        td.className = 'truncate w-100 align-middle'
        td.innerHTML = details.tasks[index].name
        tr.appendChild(td)
        var td = document.createElement('td')
        td.className = 'btn-group'

        var button = document.createElement('button')
        button.className = 'btn btn-dark colored'
        button.innerHTML = '<i class="far fa-sticky-note"></i>'
        button.addEventListener('click', () => {
            addNote(index)
        })
        td.appendChild(button)

        var button = document.createElement('button')
        button.className = 'btn btn-dark colored'
        button.innerHTML = '<i class="fas fa-edit"></i>'
        button.addEventListener('click', () => {
            editTask(index)
        })
        td.appendChild(button)

        var button = document.createElement('button')
        button.className = 'btn btn-dark colored'
        button.innerHTML = '<i class="fas fa-sort-up"></i>'
        button.addEventListener('click', () => {
            sortUp(index)
        })
        td.appendChild(button)

        var button = document.createElement('button')
        button.className = 'btn btn-dark colored'
        button.innerHTML = '<i class="fas fa-sort-down"></i>'
        button.addEventListener('click', () => {
            sortDown(index)
        })
        td.appendChild(button)

        var button = document.createElement('button')
        button.className = 'btn btn-dark colored'
        button.innerHTML = '<i class="fas fa-check-square"></i>'
        button.addEventListener('click', () => {
            removeTask(index)
        })
        td.appendChild(button)

        tr.appendChild(td)
        tbody.appendChild(tr)
    }
    saveData()
}

function addTask() {
    var task = {
        name: document.getElementById('_name').value
    }
    details.tasks.splice(0, 0, task)
    loadTasks()
    $('#form_row').load('./tasks_form.html')
    log("New task added")
}

function removeTask(index) {
    details.tasks.splice(index, 1)
    loadTasks()
}

function editTask(index) {
    $('#form_row').load('./tasks_form.html', () => {
        var task = details.tasks[index]
        document.getElementById('_name').setAttribute('value', task.name)
        removeTask(index)
        log("Editing \"" + task.name + "\"")
    })
}

function sortUp(index) {
    if (index > 0) {
        var task = details.tasks[index]
        removeTask(index)
        details.tasks.splice(index - 1, 0, task)
        loadTasks()
    }
}

function sortDown(index) {
    if (index < details.tasks.length) {
        var task = details.tasks[index]
        removeTask(index)
        details.tasks.splice(index + 1, 0, task)
        loadTasks()
    }
}

/** Settings **/


var config = remote.getGlobal("config")

//Reload the window
function refresh() {

    remote.getGlobal("Start")()
    remote.getCurrentWindow().close();
}

function loadConfig(callback) {
    fs.readFile(path.resolve(__dirname, '../config.json'), (err, data) => {
        if (err) throw err;
        //Saving config object with the configuration
        config = JSON.parse(data);
        if (typeof callback === 'function' && callback()) callback();

    })

}

function saveConfig() {

    fs.writeFile(path.resolve(__dirname, '../config.json'), JSON.stringify(config), function (err) {
        if (err) throw err;
    });
}

function updateConfig(){
    config.devTools = document.getElementById('_devTools').checked
}
function displayConfig(){
    document.getElementById('_devTools').checked = config.devTools
}


