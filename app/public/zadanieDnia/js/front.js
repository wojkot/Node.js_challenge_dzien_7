const taskList = $('#taskList');
const addButton = $('#addButton');
const allTasks = $('#allTasks');
const activeTasks = $('#activeTasks');
const completedTasks = $('#completedTasks');
const clearCompleted = $('.clear-completed');
const toggleAll = $('#toggle-all');
const leftItems = document.getElementById("todo-left");
let todoNumber = 0;

window.onload = loadContent();



$(function () {

    addButton.on('click', () => {
        const newTask = $('#newTaskID').val();

        if (newTask !== "") {


            $.ajax({
                url: '/add',
                data: JSON.stringify({
                    newTask, 
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
                type: 'POST',
                dataType: 'json',
            }).then(() => {
                taskList.append('<li><div class="view"><input class="toggle" type="checkbox"><label>' + newTask + '</label><button class="destroy"></button></div></li>');
            });
            leftTaskCounterChange(1);
        }
    }

    );

    allTasks.on('click', () => {
        $.ajax({
            url: '../db.json',
            dataType: 'json',
            success: function (data) {
                $('ul.todo-list li').remove();
                $.each(data, function (key, val) {
                    let checked = (val.done == 0) ? "" : "checked";
                    taskList.append('<li><div class="view"><input class="toggle" type="checkbox"' + checked + '><label>' + val.task + '</label><button class="destroy"></button></div></li>');

                });
            }
        });


    });

    completedTasks.on('click', () => {
        $.ajax({
            url: '../db.json',
            dataType: 'json',
            success: function (data) {
                $('ul.todo-list li').remove();
                $.each(data, function (key, val) {
                    if (val.done != 0) {
                        taskList.append('<li><div class="view"><input class="toggle" type="checkbox" checked><label>' + val.task + '</label><button class="destroy"></button></div></li>');
                    }
                });
            }
        });

    });


    activeTasks.on('click', () => {
        $.ajax({
            url: '../db.json',
            dataType: 'json',
            success: function (data) {
                $('ul.todo-list li').remove();
                $.each(data, function (key, val) {
                    if (val.done == 0) {
                        taskList.append('<li><div class="view"><input class="toggle" type="checkbox"><label>' + val.task + '</label><button class="destroy"></button></div></li>');
                    }
                });
            }
        });
    });

    clearCompleted.on('click', () => {
        const tasks = document.querySelectorAll('#taskList li');
        let items = [];
        tasks.forEach((task, index) => {
            let targetTask = task.firstChild.children[1].innerText;
            let checked = task.firstChild.children[0].checked;
            if (checked == true) {
                items.push({ task: targetTask });
                task.firstChild.children[0].checked = false;
            }

        });
        const datatest = JSON.stringify(items);
        $.ajax({
            url: '../db.json',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                $.each(data,(key,item) => {
                    if (item.done == 1) {
                        $.post("/clear", item);
                    }
                });

            }
        });
        leftTaskCounterChange(-1, true, tasks.length);
    });

    toggleAll.on('click', () => {

        const tasks = document.querySelectorAll('#taskList li');
        let items = [];
        tasks.forEach((task, index) => {
            let targetTask = task.firstChild.children[1].innerText;
            let checked = task.firstChild.children[0].checked;
            if (checked == false) {
                items.push({ task: targetTask });
                task.firstChild.children[0].checked = true;
                $.post("/all", { 'task': targetTask, 'done':1});
            }

        });
        const datatest = JSON.stringify(items);
        $.ajax({
            url: '../db.json',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function () {
                items.forEach(item => {
                    $.post("/toggleall", item);
                });
            }
        });
        leftTaskCounterChange(-1, true, 0);

    });


});


function loadContent() {
    $.ajax({
        url: '../db.json',
        dataType: 'json',
        success: function (data) {
            let initialLeftTasks = 0;
            $('ul.todo-list li').remove();
            $.each(data, function (key, val) {
                let checked = (val.done == 0) ? "" : "checked";
                initialLeftTasks += (val.done == 0) ? 1 : 0;
                taskList.append('<li><div class="view"><input class="toggle" type="checkbox"' + checked + '><label>' + val.task + '</label><button class="destroy"></button></div></li>');

            });
            eventAdder();
            leftTaskCounterChange(-1, true, initialLeftTasks);
        }
    });

};

function leftTaskCounterChange(change, all = false, set = null) {

    if (set === null) {
        if (!all) {
            todoNumber += change;
        }
        else if (all) {
            if (change > 0) {
                todoNumber = 0;
            }
            else {
                todoNumber = document.querySelectorAll('#taskList li').length;
            }
        }
    }
    else {
        todoNumber = set;
    }

    leftItems.textContent = todoNumber + ((todoNumber !== 1) ? ' items ' : ' item ') + 'left';
}



function eventAdder() {
    $(document).on('click', '#taskList li .toggle', function () {
        let target = event.target;
        let targetTask = event.target.parentNode.children[1].innerText;
        let checked = (event.target.parentNode.children[0].checked == true) ? 1 : 0;
        let change = (event.target.parentNode.children[0].checked == true) ? -1 : 1;

        $.ajax({
            url: '../db.json',
            dataType: 'json',
            success: function (data) {
                let item = { task: "", done: 0 };
                $.each(data, function (key, val) {
                    if (val.task === targetTask) {
                        val.done = checked;
                        item = { 'task': targetTask, 'done': checked };
                    }
                });
                $.post("/all", item);
                leftTaskCounterChange(change);
            }
        });
    });

    $(document).on('click', '#taskList li .destroy', function () {
        let target = event.target;
        let targetTask = event.target.parentNode.children[1].innerText;
        let targetElement = event.target.parentNode.parentNode;
        let change = (event.target.parentNode.children[0].checked == true) ? 0 : -1;

        targetElement.remove();
        $.ajax({
            url: '../db.json',
            dataType: 'json',
            success: function (data) {
                let item = { task: "" };
                $.each(data, function (key, val) {
                    if (val.task === targetTask) {
                        item = { 'task': targetTask};
                    }
                });
                $.post("/destroy", item);
                leftTaskCounterChange(change);
            }
        });
    });
}
