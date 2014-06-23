/*Operation with modal window*/
var CONTEXT = {
    tasks : {},
    intervalIds:{},
    auth_token: ''
};
function showHideModal(){
    var modal_window = document.getElementById("modal");
    modal_window.classList.toggle("md-show");
}

function showHideCat(checkboxId, categoryId){
    var checkbox = document.getElementById(checkboxId);
    var category = document.getElementById(categoryId);
    if(checkbox.checked){
        category.style.display = "block";
    } else{
        category.style.display = "none";
    }
}

function addCheckOption(){
    var ul_checkbox = document.getElementById("ulCheckbox");
    var li_checkbox = document.createElement("li");
    var check_option= document.getElementById("task_checkbox").value;
    if(check_option == ""){
        alert("You should enter your option");
        return;
    } else {
        var input_option = document.createElement("input");
        input_option.setAttribute("type","checkbox");
        input_option.setAttribute("id",check_option);
        input_option.setAttribute("name",check_option);
        var checkbox_label = document.createElement('label');
        ul_checkbox.appendChild(li_checkbox);
        li_checkbox.appendChild(input_option);
        li_checkbox.appendChild(checkbox_label);
        checkbox_label.innerHTML = check_option;
        checkbox_label.setAttribute("for",check_option);
        document.getElementById("task_checkbox").value = "";
    }
}

function delCheckOption(){
    var ul_checkbox = document.getElementById("ulCheckbox");
    var input_options = ul_checkbox.getElementsByTagName("input");
    input_options = Array.prototype.slice.call(input_options);//converts array to allow forEach method
    input_options.forEach(function(input_option){
        if(input_option.checked == true){
            var parent_li = input_option.parentElement;
            parent_li.parentNode.removeChild(parent_li);
        }
    });

}

/*Add,save in db and repaint new issue*/
function addTask(){
    var task_name = document.getElementById("task_name").value;
    var task_desc = document.getElementById("task_desc").value;
    var task = {name: task_name,description: task_desc, status: "planned" };
    var t_deadline = document.getElementById("t_deadline");
    var t_time = document.getElementById("t_time");
    var t_checkbox = document.getElementById("t_checkbox");
    task.last_change = new Date().getTime(); // change format date to milliseconds
    if(t_deadline.checked){
        var task_deadline = document.getElementById("task_deadline").value;
        task.deadline = task_deadline;
    }
    if(t_time.checked){
        var task_time = document.getElementById("task_time").value;
        task.time = task_time;
    }
    if  (t_checkbox.checked){
        var ul_checkbox = document.getElementById("ulCheckbox");
        var label = ul_checkbox.getElementsByTagName("label");
        var check_array=[];
        for (var i =0; i <label.length;i++){
            var checkbox = {name:label[i].innerHTML, done:false}
            check_array.push(checkbox);
        }
        task.checkbox = check_array;
    }
    showHideModal();
    task = Couch.createTask(task);
    displayTask(task);
}

function displayTasks() {
    var data_array = Couch.getTasks();
    data_array.forEach(function (task) {
        displayTask(task);
    })
}
function displayTask(task){
    var ul_target = document.getElementById(task.status);
    var li_issue = document.createElement("li");
    var div_issue = document.createElement("div");
    li_issue.setAttribute("draggable","true");
    li_issue.addEventListener("dragstart",drag,false);
    li_issue.setAttribute("id", task._id);
    ul_target.appendChild(li_issue);
    li_issue.appendChild(div_issue);
    div_issue.innerHTML =task.time;
   /* countdown(task);*/
    countdownSpecial(task);
}
function observeTime(task_id) {
    var half_time=[];
    var li_time = document.getElementById(task_id);
    var element_time = li_time.childNodes[0];
    var new_time;
    var time_array = element_time.innerHTML.split(":");
    var minutes = time_array[1];
    var hours = time_array[0];
    var certain_time = Math.floor((parseInt(minutes) + parseInt(hours)*60)/2);
    console.log(certain_time);
    if(certain_time > 60){
        half_time[0] = Math.floor(certain_time/60);
        half_time[1]= certain_time%60;
        console.log(half_time);
    }
    if(certain_time < 60){
        half_time[0] = 0;
        half_time[1] =certain_time;
        console.log(half_time);
    }
    var intervalId = setInterval(function () {

        if(half_time[0] == parseInt(hours) && half_time[1] == parseInt(minutes)){
            element_time.style.backgroundColor = "red";
        }
        if (minutes == 0 && hours != 0 ){
            hours = hours - 1;
            minutes = 59;
        } else {
            minutes = minutes - 1;
        }
        if(minutes < 10){
            minutes = "0" +minutes;
        }
        new_time = [hours, minutes].join(':');
        element_time.innerHTML = new_time;
        if(hours == 0 && minutes == 0){
            stopCountdown(task_id);
        }
    }, 1000);
    CONTEXT.intervalIds[task_id] = intervalId;
}

Couch.getTasks();
displayTasks();


function allowDrop(ev)
{
    ev.preventDefault();
}

function drag(ev)
{
    ev.dataTransfer.setData("task_id",ev.target.id);
}

function drop(ev)
{
    var ul_target = ev.target; // write element where we try to push our li
    var li_element;
    if (ul_target.tagName != 'UL'){ // if we didn't get exactly in ul
        li_element = ul_target;
        while (li_element.tagName != 'LI') {
            li_element = li_element.parentElement; // every time go up to find ul element
        }
        ul_target = li_element.parentElement;
    }
    ev.preventDefault();
    var task_id=ev.dataTransfer.getData("task_id");
    if (li_element == undefined){
        ul_target.appendChild(document.getElementById(task_id));
    } else {
        ul_target.insertBefore(document.getElementById(task_id), li_element)
    }
    var task = Couch.getTask(task_id);
    task.status = ul_target.id;

    Couch.updateTask(task);
    countdown(task)
};



function countdown(task){
    if(task.status == "started"){
        observeTime(task._id)
    } else{
        stopCountdown(task._id)
    }
}
function stopCountdown(task_id){
    if (CONTEXT.intervalIds[task_id] != undefined){
        clearInterval(CONTEXT.intervalIds[task_id]);
        delete CONTEXT.intervalIds[task_id];
    }
}
function countdownSpecial(task){
    var li_time = document.getElementById(task._id);
    var element_time = li_time.childNodes[0];
    if(task.status == "started"){
        var new_minutes;
        var new_hours;
        var time_in_DB = task.time;
        var time_array = time_in_DB.split(":");
        var minutes_DB = time_array[1];
        var hours_DB = time_array[0];
        var new_time = new Date().getTime();
        var diff =(new_time - task.last_change)/1000;
        var difference = Math.floor(diff);
        var hour = difference/60;
        var hours = Math.floor(hour);
        var minutes = difference%60;
        if (minutes < minutes_DB){
            new_minutes =  minutes_DB - minutes;
            new_hours = hours_DB - hours;
        }
        if(minutes > minutes_DB){
            var raznica = minutes_DB - minutes
            var minutes_dif = Math.abs(raznica);
            new_minutes = 60 - minutes_dif;
            hours = hours +1;
            new_hours = hours_DB -hours;
            if(new_hours < 0){
                document.write("You lost your time");
            }
        }
        new_time1 = [new_hours, new_minutes].join(':');
        element_time.innerHTML = new_time1;
        observeTimeSpecial(new_time1);
    } else{
        stopCountdown(task._id)
    }
}

function observeTimeSpecial(new_time1) {
    var half_time=[];
    var time_array = new_time1.split(":");
    var minutes = time_array[1];
    var hours = time_array[0];
    var intervalId = setInterval(function () {

        if (minutes == 0 && hours != 0 ){
            hours = hours - 1;
            minutes = 59;
        } else {
            minutes = minutes - 1;
        }
        if(minutes < 10){
            minutes = "0" +minutes;
        }
        new_time = [hours, minutes].join(':');
        new_time1 = new_time;
        if(hours == 0 && minutes == 0){
            stopCountdown(new_time1);
        }
    }, 1000);
    CONTEXT.intervalIds[new_time1] = intervalId;
}