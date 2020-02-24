/**
 * Author : Thophile
 * Project : Deskapp
 */

/** Tasks **/

function loadTasks() {
    if (details !== undefined) {

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