/**
 * Author : Thophile
 * Project : Deskapp
 */

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
    if (details !== undefined) {
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
    if(details.watchList.length === 1) details.watchList = [];
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