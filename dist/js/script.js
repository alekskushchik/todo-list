let TODOS = [];
document.addEventListener("DOMContentLoaded", function (event) {
//======= Define selectors =======
    const createTaskBtn = document.querySelector('.buttons__create');
    const searchTaskBtn = document.querySelector('.buttons__search');
    const searchTodo = document.querySelector('.search-task');
    const taskInput = document.querySelector("#todo");
    const taskDescription = document.querySelector('#task-description');
    const addTask = document.querySelector('#add-task');
    const closeOverlay = document.querySelector('#close-button');
    const pendingTasks = document.querySelector('#pending-tasks');
    const bulkActions = document.querySelector('.bulk-actions');
    const filterTodos = document.querySelector('.filter-todos');

    const TODO_STATUS = {
        pending: 'Pending',
        done: 'Done',
        hold: 'Hold'
    }

    if (localStorage.getItem('todos') !== null) {
        TODOS = JSON.parse(localStorage.getItem('todos'));
    }

// ======= Event listeners =======
    createTaskBtn.addEventListener('click', function (){
        setTimeout(() => popUpOn(), 500);
    })

    closeOverlay.addEventListener('click', function () {
        document.getElementById("overlay").style.display = "none";
    });

    taskInput.addEventListener('keydown', function (e) {
        if ((e.code === 'Enter' || e.code === 'NumpadEnter') && taskInput.value !== '') {
            setTimeout(() => addTodo(), 500);
        }
    });
    addTask.addEventListener('click', function () {
        if (taskInput.value !== '') {
            setTimeout(() => addTodo(), 500);
        }
    })
    searchTaskBtn.addEventListener('click', function () {
        searchTodo.classList.toggle('hidden');
        const searchInput = document.querySelector('#searchInput');
        searchInput.focus();
        searchInput.addEventListener('keyup', searchTodoByTitle);
        searchInput.value = '';
    })

    bulkActions.addEventListener('change', (event) => {
        if (event.target.value === 'mark-as-done') {
            setTimeout(() => doneAllTodos(), 500);
        } else if (event.target.value === 'hold/unhold') {
            setTimeout(() => holdAllTodos(), 500);
        } else if (event.target.value === 'remove-all') {
            setTimeout(() => removeAllTodos(), 500);
        }
    });

    filterTodos.addEventListener('change', (event) => {
        if (event.target.value === 'by-title') {
            setTimeout(() => sortByTitle(), 500);
        } else if (event.target.value === 'by-status') {
            setTimeout(() => sortByStatus(), 500);
        }
    });


//======= Functions =======
    function popUpOn() {
        taskInput.value = '';
        taskDescription.value = '';
        document.getElementById("overlay").style.display = "block";
        taskInput.focus();
    }

    function addTodo() {
        let todo = {
            id: Date.now(),
            title: taskInput.value,
            description: taskDescription.value,
            status: TODO_STATUS.pending
        }

        TODOS.push(todo);
        localStorage.setItem('todos', JSON.stringify(TODOS));
        renderTodos(TODOS);
        document.getElementById("overlay").style.display = "none";
    }

    function renderTodos(TODOS) {
        pendingTasks.innerHTML = '';

        for (let i = 0; i < TODOS.length; i++) {
            let template = `<li class="todo-item" data-key="${TODOS[i].id}">
                    <span class="status" data-status="${TODOS[i].status}">${TODOS[i].status}</span>
                    <label data-status="${TODOS[i].status}">${TODOS[i].title}</label><input type="text">
                    <p style="font-style: italic; font-size: 12px">${TODOS[i].description}</p>
                    <div class="buttons-container">
                        <button class="edit" data-id="${TODOS[i].id}" data-action="edit"><i class="fas fa-pencil-alt"></i> Edit</button>
                        <button class="delete" data-action="delete"><i class="fas fa-trash"></i> Delete</button>
                        <button class="hold" data-action="hold"><i class="fas fa-lock"></i> Hold</button>
                        <button class="done" data-action="done"><i class="fas fa-check-double"></i> Done</button>
                    </div>
                    <div class="edit-mode">
                        <button class="save" data-action="save"><i class="fas fa-save"></i> Save</button>
                        <button class="cancel" data-action="cancel"><i class="fas fa-times"></i> Cancel</button>
                    </div>
            </li>`;
            pendingTasks.innerHTML += template;
        }
        setTimeout(() => getControlsButtons(), 500);
    }

    function getControlsButtons() {
        const editBtn = document.querySelectorAll('.edit');
        const delBtn = document.querySelectorAll('.delete');
        const holdBtn = document.querySelectorAll('.hold');
        const doneBtn = document.querySelectorAll('.done');
        const saveBtn = document.querySelectorAll('.save');
        const cancelBtn = document.querySelectorAll('.cancel');

        editBtn.forEach(el => el.addEventListener('click', editTodo));
        delBtn.forEach(el => el.addEventListener('click', deleteTodo));
        holdBtn.forEach(el => el.addEventListener('click', holdTodo));
        doneBtn.forEach(el => el.addEventListener('click', doneTodo));

        saveBtn.forEach(el => el.addEventListener('click', saveEditState));
        cancelBtn.forEach(el => el.addEventListener('click', closeEditMode));
    }

    function searchTodoByTitle(e) {
        const searchValue = e.target.value.toLowerCase();
        const listItems = document.querySelectorAll(".todo-item");
        listItems.forEach(listItem => {
            if (listItem.querySelector('label').textContent.toLowerCase().indexOf(searchValue) > -1) {
                listItem.style.display = "";
            } else {
                listItem.style.display = "none";
            }
        })
    }

    function editTodo(e) {
        let listItem = e.target.closest('li');
        let label = listItem.querySelector('label');
        let editInput = listItem.querySelector('input[type=text]');
        if (!listItem.classList.contains('editMode')) {
            editInput.value = label.innerText;
            listItem.querySelector('.buttons-container').style.display = 'none';
            listItem.querySelector('.edit-mode').style.display = 'flex';
        } else {
            label.innerText = editInput.value;
            listItem.querySelector('.buttons-container').style.display = 'block';
            listItem.querySelector('.edit-mode').style.display = 'none';
        }
        listItem.classList.toggle('editMode');
    }

    function saveEditState(e) {
        let listItem = e.target.closest('li');
        let label = listItem.querySelector('label');
        let editInput = listItem.querySelector('input[type=text]');
        for (let i = 0; i < TODOS.length; i++) {
            TODOS[i].title = label.innerText = editInput.value;
            listItem.querySelector('.buttons-container').style.display = 'flex';
            listItem.querySelector('.edit-mode').style.display = 'none';
        }
        listItem.classList.toggle('editMode');
    }

    function closeEditMode(e) {
        let listItem = e.target.closest('li');
        listItem.querySelector('.buttons-container').style.display = 'flex';
        listItem.querySelector('.edit-mode').style.display = 'none';
        listItem.classList.toggle('editMode');
    }

    function deleteTodo() {
        for (let i = 0; i < TODOS.length; i++) {
            if (+this.closest('.todo-item').getAttribute('data-key') === TODOS[i].id) {
                TODOS.splice(i, 1);
            }
        }
        localStorage.setItem('todos', JSON.stringify(TODOS));
        renderTodos(TODOS);
    }

    function holdTodo(e) {
        for (let i = 0; i < TODOS.length; i++) {
            if (+e.target.closest('li').getAttribute('data-key') === TODOS[i].id) {
                if (TODOS[i].status !== TODO_STATUS.hold) {
                    TODOS[i].status = TODO_STATUS.hold;
                    localStorage.setItem('todos', JSON.stringify(TODOS));

                    e.target.closest('li').querySelector('.status').innerHTML = TODOS[i].status
                    let buttons = e.target.closest('li').querySelectorAll('button');
                    buttons.forEach(button => {
                        button.classList.toggle('disabled');
                        button.disabled = !button.disabled;
                        if (button.getAttribute('data-action') === 'hold') {
                            button.disabled = false;
                            button.classList.remove('disabled');
                            if (button.innerText === ' Hold') {
                                button.innerHTML = '<i class="fas fa-unlock"></i> Unhold';
                            } else {
                                button.innerHTML = '<i class="fas fa-lock"></i> Hold'
                            }
                        }
                    })

                } else {
                    TODOS[i].status = TODO_STATUS.pending;
                    localStorage.setItem('todos', JSON.stringify(TODOS));
                    renderTodos(TODOS)
                    e.target.closest('li').querySelector('.status').innerHTML = TODOS[i].status
                }
            }
        }

    }

    function doneTodo(e) {
        for (let i = 0; i < TODOS.length; i++) {
            if (+e.target.closest('li').getAttribute('data-key') === TODOS[i].id) {
                (TODOS[i].status === TODO_STATUS.pending) ?
                    TODOS[i].status = TODO_STATUS.done :
                    TODOS[i].status = TODO_STATUS.pending;
                e.target.closest('li').querySelector('label').classList.toggle('checked');
            }
        }
        localStorage.setItem('todos', JSON.stringify(TODOS));
        renderTodos(TODOS);
    }

    function doneAllTodos() {
        TODOS.forEach(todo => {
            todo.status = TODO_STATUS.done;
        })
        localStorage.setItem('todos', JSON.stringify(TODOS));
        renderTodos(TODOS);
    }

    function holdAllTodos() {
        TODOS.forEach(todo => {
            todo.status = TODO_STATUS.hold;
            renderTodos(TODOS)

            const buttons = pendingTasks.querySelectorAll('button');
            buttons.forEach(button => {
                button.classList.toggle('disabled');
                button.disabled = !button.disabled;
                if (button.getAttribute('data-action') === 'hold') {
                    button.disabled = false;
                    button.classList.remove('disabled');
                    button.innerHTML = '<i class="fas fa-unlock"></i> Unhold';
                }
            })
        })
    }

    function removeAllTodos() {
        TODOS = [];
        localStorage.setItem('todos', JSON.stringify(TODOS));
        renderTodos(TODOS);
    }

    function sortByTitle() {

        TODOS.sort(function (todoPrev, todoNext) {
            if (todoPrev.title < todoNext.title) {
                return -1;
            } else if (todoPrev.title > todoNext.title) {
                return 1;
            }
            return 0;
        });

        localStorage.setItem('todos', JSON.stringify(TODOS));
        renderTodos(TODOS);
    }

    function sortByStatus() {

        TODOS.sort(function (todoPrev, todoNext) {
            if (todoPrev.status < todoNext.status) {
                return -1;
            } else if (todoPrev.status > todoNext.status) {
                return 1;
            }
            return 0;
        });

        localStorage.setItem('todos', JSON.stringify(TODOS));
        renderTodos(TODOS);
    }

    renderTodos(TODOS)
})
