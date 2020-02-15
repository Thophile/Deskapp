/**
 * Author : Thophile
 * Project : Deskapp
 */

/** Home **/

//Execute external .exe from path
function execute(executablePath) {

    var child = require('child_process').execFile;

    child(executablePath, function (err, data) {
        if (err) {
            console.log(err);
            return;
        }

        log(data.toString());
    });
}

//Load the widget stored in config
function loadWidget() {
    var deck = document.getElementById('widgetDeck')
    deck.innerHTML = ""
    if (config.widgets !== undefined) {
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
        console.log(error)
    }
}

function removeWidget(index) {
    config.widgets.splice(index, 1)
    loadWidget()
}