/*Operation with modal window*/
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

        var task = {name: task_name,description: task_desc };
        var t_deadline = document.getElementById("t_deadline");
        var t_time = document.getElementById("t_time");
        var t_checkbox = document.getElementById("t_checkbox");
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
        createTasks(task);

}
function createTasks(task){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:5984/myproject/", false, "couch", "couch");
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return; //return if not complete

        if (xhr.status != 201) { //check request status
            alert('Error ' + xhr.status + ': ' + xhr.statusText);
            return;
        }
        var dataJson = xhr.responseText;
       /* var data = JSON.parse(dataJson);
        var dataId = data.id;
        var liIssue =document.createElement("li");

        liIssue.innerHTML = task.name;

        var planned =document.getElementById("planned");
        planned.appendChild(liIssue);*/
    }
    xhr.send(JSON.stringify(task));
}

function getTasks() {
    var xhr = new XMLHttpRequest();
    var plannedUl = document.getElementById("planned");
    var data_array = [];
    xhr.open('GET', 'http://localhost:5984/myproject/_all_docs?include_docs=true', false);

    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return; //return if not complete

        if (xhr.status != 200) { //check request status
            alert('Error ' + xhr.status + ': ' + xhr.statusText);
            return;
        }
        var dataJson = xhr.responseText;
        var data = JSON.parse(dataJson);
        for (var i = 0; i < data.rows.length; i++) {
            data_array.push(data.rows[i].doc);
        }
        console.log(data_array);
    }
    xhr.send();
    return data_array;
}

function displayTasks() {
    var data_array = getTasks();
    var ul_planned = document.getElementById("planned");
    data_array.forEach(function (data_array) {
        var li_issue = document.createElement("li");
        var div_issue = document.createElement("div");
        var p_issue = document.createElement("p");

        li_issue.setAttribute("id", data_array._id);
        ul_planned.appendChild(li_issue);
        li_issue.appendChild(div_issue);
        div_issue.appendChild(p_issue);
        div_issue.setAttribute("id", "alena");
        div_issue.innerHTML =data_array.time;
    })
}

function observeTime() {
    var half_time=[];
    var element_time = document.getElementById("alena");
    var new_time;
    var time_array = element_time.innerHTML.split(":");
    var certain_time = Math.floor((parseInt(time_array[1]) + parseInt(time_array[0])*60)/2);
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

        if(half_time[0] == parseInt(time_array[0]) && half_time[1] == parseInt(time_array[1])){
            element_time.style.backgroundColor = "red";
        }
        time_array[1] = time_array[1] - 1;
        new_time = time_array.join(':');
        element_time.innerHTML = new_time;
        if(time_array[1] < 10){
            time_array[1] ="0" +time_array[1];
            new_time = time_array.join(':');
            element_time.innerHTML = new_time;
        }
        if (time_array[1] == 0 && time_array[0] != 0 ){
            time_array[0] = time_array[0] - 1;
            time_array[1] = 59;
            new_time = time_array.join(':');
            element_time.innerHTML = new_time;
        }
        if(time_array[0] == 0 && time_array[1] == 0){
            clearInterval(intervalId);
        }
    }, 1000)
}
getTasks();
displayTasks();
observeTime();




