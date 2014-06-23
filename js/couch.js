var db = "myproject";

var Couch = {
    createTask: function(task){
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/couch/"+ db +"/", false);
        var task_id;
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) return; //return if not complete

            if (xhr.status != 201 && xhr.status != 200) { //check request status
                alert('Error ' + xhr.status + ': ' + xhr.statusText);
                return;
            }
            var dataJson = xhr.responseText;
            var data = JSON.parse(dataJson);
            task._id = data.id;
        }
        xhr.send(JSON.stringify(task));
        return task;
    },
    getTask: function(task_id){
        var xhr = new XMLHttpRequest();
        var result;
        xhr.open('GET', '/couch/' + db +'/'+ task_id, false);
        xhr.onreadystatechange = function () {

            if (xhr.readyState != 4) return; //return if not complete
            if (xhr.status != 200) { //check request status
                alert('Error ' + xhr.status + ': ' + xhr.statusText);
                return;
            }
            var dataJson = xhr.responseText;
            result = JSON.parse(dataJson);
        }
        xhr.send();
        return  result;
    },
    getTasks: function() {
        var xhr = new XMLHttpRequest();
        var plannedUl = document.getElementById("planned");
        var data_array = [];
        xhr.open('GET', '/couch/' + db +'/_all_docs?include_docs=true', false);

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
    },
    updateTask: function(task){
        var last_change = new Date().getTime();
        var li_time = document.getElementById(task._id);
        var task_time = li_time.childNodes[0].innerHTML;
        var task_id = task._id;
        task.last_change = last_change;
        task.time = task_time;
        var xhr = new XMLHttpRequest();
        xhr.open('PUT', '/couch/' + db +'/'+ task_id, false);
        xhr.send(JSON.stringify(task));
    }
}

