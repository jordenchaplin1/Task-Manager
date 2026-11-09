const serverName =
  "https://106api-b0bnggbsgnezbzcz.westus3-01.azurewebsites.net/api/tasks";

function displayTask(task) {
  // Build elements with .text() so task text is displayed safely.
  const container = $("<div>").addClass("task");

  const color = /^#[0-9a-f]{6}$/i.test(task.color)
    ? task.color
    : "#ffcc00";

  container.css("border-left", `6px solid ${color}`);

  const info = $("<div>").addClass("info");

  info.append($("<h4>").text(task.title));
  info.append($("<p>").text(task.desc || ""));

  const status = $("<span>")
    .addClass("status")
    .text(task.status || "New");

  const details = $("<div>").addClass("date-budget");

  const budget = Number(task.budget);

  details.append(
    $("<span>").text(`Due: ${task.date || "No date selected"}`),
    $("<span>").text(
      `Budget: $${Number.isFinite(budget) ? budget.toFixed(2) : "0.00"}`
    )
  );

  container.append(info, status, details);
  $("#list").append(container);
}

function saveTask(event) {
  event.preventDefault();

  const title = $("#txtTitle").val().trim();
  const desc = $("#txtDescription").val().trim();
  const color = $("#selColor").val();
  const date = $("#selDate").val();
  const status = $("#selStatus").val();
  const budget = Number($("#numBudget").val() || 0);

  if (!title) {
    alert("Please enter a task title.");
    $("#txtTitle").focus();
    return;
  }

  if (!Number.isFinite(budget) || budget < 0) {
    alert("Please enter a valid budget of zero or more.");
    return;
  }

  // Create the task object using the Task class.
  const taskToSave = new Task(
    title,
    desc,
    color,
    date,
    status,
    budget
  );

  $("#btnSave").prop("disabled", true).text("Saving...");

  // Save the task on the server.
  $.ajax({
    type: "POST",
    url: serverName,
    data: JSON.stringify(taskToSave),
    contentType: "application/json",

    success: function () {
      // Display only after the server confirms the save.
      displayTask(taskToSave);

      $("#taskForm")[0].reset();
      $("#txtTitle").focus();
      $("#message").text("Task saved successfully.");
    },

    error: function (xhr) {
      console.error("Saving failed:", xhr.status, xhr.responseText);
      $("#message").text(
        "Could not save your task. Your entries are still in the form."
      );
    },

    complete: function () {
      $("#btnSave").prop("disabled", false).text("Save Task");
    }
  });
}

function loadTasks() {
  $("#message").text("Loading tasks...");
  $("#btnSave").prop("disabled", true);

  // Retrieve previously saved tasks.
  $.ajax({
    type: "GET",
    url: serverName,
    dataType: "json",

    success: function (response) {
      // Some APIs return JSON as an encoded string.
      let tasks = response;

      if (typeof tasks === "string") {
        try {
          tasks = JSON.parse(tasks);
        } catch (error) {
          $("#message").text("The server returned invalid task data.");
          return;
        }
      }

      if (!Array.isArray(tasks)) {
        console.error("Unexpected response:", tasks);
        $("#message").text("The server did not return a task list.");
        return;
      }

      $("#list").empty();

      tasks.forEach(function (task) {
        if (task && typeof task === "object") {
          displayTask(task);
        }
      });

      $("#message").text(
        tasks.length ? "" : "No tasks yet. Create your first task above."
      );
    },

    error: function (xhr) {
      console.error("Loading failed:", xhr.status, xhr.responseText);
      $("#message").text(
        "Could not load tasks. Check your connection and refresh to retry."
      );
    },

    complete: function () {
      $("#btnSave").prop("disabled", false);
    }
  });
}

function init() {
  // Add an accessible area for loading, success, and error messages.
  $("<p>", {
    id: "message",
    role: "status",
    "aria-live": "polite"
  }).insertBefore("#list");

  $("#taskForm").on("submit", saveTask);

  // Display all saved tasks when the page loads.
  loadTasks();
}

$(document).ready(init);