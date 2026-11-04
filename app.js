function saveTask() {
  //1. Get values from the DOM
  const title = $("#txtTitle").val();
  const desc = $("#txtDescription").val();
  const color = $("#selColor").val();
  const date = $("#selDate").val();
  const status = $("#selStatus").val();
  const budget = $("#numBudget").val();
  //2. Create an Object using our class
  const taskToSave = new Task(title,desc,color,date,status,budget);
  //3. Send to Server
  $.ajax(
    {
      type:"post", //HTTP verb: CREATE
      url: serverName,
      data: JSON.stringify(taskToSave),
      contentType: "application/json",
      success:function(response)
      {
        console.log(response);
      },
      error:function(fail)
      {
        console.log(fail);
      }
    }
  )
}


//this URL it is the server
const serverName="https://106api-b0bnggbsgnezbzcz.westus3-01.azurewebsites.net/api/tasks"

function loadTask(){
  $.ajax(
    {
      type:"get", //HTTP verb: READ
      url: serverName,
      success:function(data)
      {
        console.log(response);
      },
      error:function(fail)
      {
        console.log(fail);
      }
    }
  )
}

function displayTask(task) {
  // Template literal using backticks
  let html = `
    <div class="task" style="border-color:${task.color}">
      <div class="info">
        <h4>${task.title}</h4>
        <p>${task.desc}</p>
      </div>
      <label class="status">${task.status}</label>
      <div class="date-budget">
        <label>Due: ${task.date}</label>
        <label>Budget: $${task.budget}</label>
      </div>
    </div>`;

  // Add to DOM
  $(".list").append(html);
}

function init()
{
  console.log("hello fro ch72");
  //hook he save button
  $("#btnSave").click(saveTask);
  
  //load data from server
  loadTask();
}