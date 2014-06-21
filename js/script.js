function AddIssue(){

    var issue = document.getElementById("planned_issues").value;
    var task = {name: issue};
    createTasks(task);
    var issueTextarea = document.getElementById("planned_issues");
    issueTextarea.value = " ";

}


function allowDrop(ev)
{
    ev.preventDefault();
}

function drag(ev)
{
    ev.dataTransfer.setData("Text",ev.target.id);
}

function drop(ev)
{
    ev.preventDefault();
    var data=ev.dataTransfer.getData("Text");
    ev.target.appendChild(document.getElementById(data));
};

var task1 = {
    "name" : "firstTask",
    "time" : "2h:30m",
    "status" : "planned",
    "user_id" : "lena",
    "priority" : "low",
    "deadline" : "tomorrow"
};
var task2 = {
    name : "secondTask",
    time : "0h:45m",
    status : "open",
    user_id : "lena",
    priority : "middle",
    deadline : "tomorrow"
};

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
        var data = JSON.parse(dataJson);
        var dataId = data.id;
        var liIssue =document.createElement("li");

        liIssue.innerHTML = task.name;
        liIssue.setAttribute("draggable","true");
        liIssue.setAttribute("id",dataId);
        liIssue.addEventListener("dragstart",drag,false);

        var planned =document.getElementById("planned");
        planned.appendChild(liIssue);
    }
    xhr.send(JSON.stringify(task));
}

function getTasks() {
    var xhr = new XMLHttpRequest();
    var plannedUl = document.getElementById("planned");

    xhr.open('GET', 'http://localhost:5984/myproject/_all_docs?include_docs=true', true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return; //return if not complete

        if (xhr.status != 200) { //check request status
            alert('Error ' + xhr.status + ': ' + xhr.statusText);
            return;
        }
        var dataJson = xhr.responseText;
        var data = JSON.parse(dataJson);
        for(var i=0; i< data.rows.length; i++){
         
            var liIssue =document.createElement("li");
            var dataLi = data.rows[i].doc.name;
            liIssue.innerHTML = dataLi;
            liIssue.setAttribute("draggable","true");
            liIssue.setAttribute("id",data.rows[i].doc._id);
            liIssue.addEventListener("dragstart",drag,false);

            var planned =document.getElementById("planned");
            planned.appendChild(liIssue);
        }
    }
    xhr.send();
}

getTasks();
