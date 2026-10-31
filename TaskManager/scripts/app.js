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
}

function init()
{
  console.log("hello fro ch72");
}