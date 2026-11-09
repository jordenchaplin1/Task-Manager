const serverName =
  "https://106api-b0bnggbsgnezbzcz.westus3-01.azurewebsites.net/api/tasks";

// Keep this value the same so your saved tasks remain associated with you.
const currentUser = "jorden-chaplin";

let myTasks = [];
let busy = false;
let tasksLoaded = false;

function getTaskId(task) {
  return task.id ?? task._id;
}

function updateButtons() {
  $("#btnSave").prop("disabled", busy);

  const missingId = myTasks.some(function (task) {
    const id = getTaskId(task);
    return id === undefined || id === null || id === "";
  });

  $("#btnDeleteAll").prop(
    "disabled",
    busy || !tasksLoaded || myTasks.length === 0 || missingId
  );
}

function displayTask(task) {
  const container = $("<div>").addClass("task");

  const color = /^#[0-9a-f]{6}$/i.test(task.color)
    ? task.color
    : "#ffcc00";

  container.css("border-left", `6px solid ${color}`);

  const info = $("<div>").addClass("info");

  info.append(
    $("<h4>").text(task.title || "Untitled task"),
    $("<p>").text(task.desc || "")
  );

  const status = $("<span>")
    .addClass("status")
    .text(task.status || "New");

  const budget = Number(task.budget);

  const details = $("<div>").addClass("date-budget");

  details.append(
    $("<span>").text(`Due: ${task.date || "No date selected"}`),
    $("<span>").text(
      `Budget: $${Number.isFinite(budget) ? budget.toFixed(2) : "0.00"}`
    )
  );

  container.append(info, status, details);
  $("#list").append(container);
}

function renderTasks() {
  $("#list").empty();
  myTasks.forEach(displayTask);
}

async function loadTasks() {
  busy = true;
  tasksLoaded = false;
  updateButtons();
  $("#message").text("Loading your tasks...");

  try {
    let response = await $.ajax({
      type: "GET",
      url: serverName,
      dataType: "json",
      timeout: 20000
    });

    if (typeof response === "string") {
      response = JSON.parse(response);
    }

    if (!Array.isArray(response)) {
      throw new Error("The API did not return an array of tasks.");
    }

    // Display only tasks associated with this user.
    myTasks = response.filter(function (task) {
      return task && task.user === currentUser;
    });

    tasksLoaded = true;
    renderTasks();

    $("#message").text(
      myTasks.length
        ? `${myTasks.length} task(s) loaded.`
        : "No tasks yet. Add your first task above."
    );

    return true;
  } catch (error) {
    console.error("Loading tasks failed:", error);

    $("#message").text(
      "Could not load your tasks. Refresh the page to try again."
    );

    return false;
  } finally {
    busy = false;
    updateButtons();
  }
}

async function saveTask(event) {
  event.preventDefault();

  if (busy) return;

  const title = $("#txtTitle").val().trim();
  const desc = $("#txtDescription").val().trim();
  const color = $("#selColor").val();
  const date = $("#selDate").val();
  const status = $("#selStatus").val();
  const budget = Number($("#numBudget").val() || 0);

  if (!title) {
    $("#message").text("Please enter a task title.");
    $("#txtTitle").focus();
    return;
  }

  if (!Number.isFinite(budget) || budget < 0) {
    $("#message").text("Enter a budget of zero or more.");
    return;
  }

  const task = new Task(
    title,
    desc,
    color,
    date,
    status,
    budget,
    currentUser
  );

  busy = true;
  updateButtons();
  $("#btnSave").text("Saving...");
  $("#message").text("Saving your task...");

  try {
    await $.ajax({
      type: "POST",
      url: serverName,
      data: JSON.stringify(task),
      contentType: "application/json",
      timeout: 20000
    });
  } catch (error) {
    console.error("Saving task failed:", error);

    $("#message").text(
      "Could not confirm the save. Refresh to check before trying again."
    );

    busy = false;
    $("#btnSave").text("Save Task");
    updateButtons();
    return;
  }

  $("#taskForm")[0].reset();

  // Reload to get the saved task and its server-generated ID.
  const loaded = await loadTasks();

  $("#message").text(
    loaded
      ? "Task saved successfully."
      : "Task saved, but the list could not refresh. Refresh the page."
  );

  $("#btnSave").text("Save Task");
  $("#txtTitle").focus();
}

async function deleteAllTasks() {
  if (busy || !tasksLoaded || myTasks.length === 0) return;

  const confirmed = window.confirm(
    `Delete all ${myTasks.length} of your tasks? This cannot be undone.`
  );

  if (!confirmed) return;

  // Delete only the current user's tasks, using individual IDs.
  const tasksToDelete = myTasks.slice();

  busy = true;
  updateButtons();
  $("#message").text("Deleting your tasks...");

  let deleted = 0;
  let failed = 0;

  for (const task of tasksToDelete) {
    const id = getTaskId(task);

    try {
      await $.ajax({
        type: "DELETE",
        url: `${serverName}/${encodeURIComponent(id)}`,
        timeout: 20000
      });

      deleted++;
    } catch (error) {
      console.error("Deleting task failed:", id, error);
      failed++;
    }
  }

  const loaded = await loadTasks();

  if (!loaded) {
    $("#message").text(
      `Deleted ${deleted} task(s); ${failed} request(s) failed. ` +
      "Refresh to check the latest server list."
    );
  } else if (failed > 0) {
    $("#message").text(
      `Deleted ${deleted} task(s). ${failed} could not be deleted.`
    );
  } else {
    $("#message").text("All your tasks were deleted.");
  }
}

function init() {
  // jQuery handles the form and button events.
  $("#taskForm").on("submit", saveTask);
  $("#btnDeleteAll").on("click", deleteAllTasks);

  loadTasks();
}

$(document).ready(init);