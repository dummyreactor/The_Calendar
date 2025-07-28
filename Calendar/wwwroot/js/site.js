// Make all current and future .task-card elements draggable
function makeTaskDraggable(task) {
    task.setAttribute('draggable', 'true');

    task.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData("text/plain", task.textContent.trim());
        e.dataTransfer.setData("source", task.closest(".task-panel") ? "task-panel" : "calendar");
        task.classList.add("dragging");
    });

    task.addEventListener('dragend', function () {
        task.classList.remove("dragging");
    });
}

// Apply to all existing task cards
document.querySelectorAll('.task-card').forEach(makeTaskDraggable);

// Handle drop into calendar slots
document.querySelectorAll('.calendar-slot').forEach(slot => {
    slot.addEventListener('dragover', function (e) {
        e.preventDefault();
        slot.style.backgroundColor = "#d6e4ff";
    });

    slot.addEventListener('dragleave', function () {
        slot.style.backgroundColor = "";
    });

    slot.addEventListener('drop', function (e) {
        e.preventDefault();
        slot.style.backgroundColor = "";

        const taskText = e.dataTransfer.getData("text/plain");
        const source = e.dataTransfer.getData("source");

        // Remove the dragged task from source
        const dragging = document.querySelector('.dragging');
        if (dragging) {
            dragging.remove();
        }

        // Create new draggable task card in calendar slot
        const newTask = document.createElement('div');
        newTask.className = "task-card bg-success text-white";
        newTask.textContent = taskText;
        newTask.style.padding = "5px";
        newTask.style.fontSize = "0.8rem";
        newTask.style.borderRadius = "6px";
        newTask.style.margin = "2px 0";

        makeTaskDraggable(newTask); // Make it draggable

        slot.appendChild(newTask);
    });
});

// Allow drop back into the task panel
const taskList = document.querySelector('.task-list');
if (taskList) {
    taskList.addEventListener('dragover', function (e) {
        e.preventDefault();
        taskList.style.backgroundColor = "#f0f8ff";
    });

    taskList.addEventListener('dragleave', function () {
        taskList.style.backgroundColor = "";
    });

    taskList.addEventListener('drop', function (e) {
        e.preventDefault();
        taskList.style.backgroundColor = "";

        const taskText = e.dataTransfer.getData("text/plain");
        const source = e.dataTransfer.getData("source");

        // Remove from calendar if dragged from there
        const dragging = document.querySelector('.dragging');
        if (dragging && source === "calendar") {
            dragging.remove();
        }

        // Create restored task card in task list
        const restoredTask = document.createElement('div');
        restoredTask.className = "task-card";
        restoredTask.textContent = taskText;

        makeTaskDraggable(restoredTask);

        taskList.appendChild(restoredTask);
    });

    const trashCan = document.getElementById('trash-can');

    if (trashCan) {
        trashCan.addEventListener('dragover', function (e) {
            e.preventDefault();
            trashCan.classList.add("dragover");
        });

        trashCan.addEventListener('dragleave', function () {
            trashCan.classList.remove("dragover");
        });

        trashCan.addEventListener('drop', function (e) {
            e.preventDefault();
            trashCan.classList.remove("dragover");

            const dragging = document.querySelector('.dragging');
            if (dragging) {
                dragging.remove();
            }
        });
    }

}
