function makeTaskDraggable(task) {
    task.setAttribute('draggable', 'true');

    task.addEventListener('dragstart', function (e) {
        const title = task.querySelector('strong')?.textContent || task.textContent.trim();
        const desc = task.querySelector('small')?.textContent || "";

        const payload = JSON.stringify({ title, desc });
        e.dataTransfer.setData("text/plain", payload);
        e.dataTransfer.setData("source", task.closest(".task-panel") ? "task-panel" : "calendar");
        task.classList.add("dragging");
    });

    task.addEventListener('dragend', function () {
        task.classList.remove("dragging");
    });
}

document.querySelectorAll('.task-card').forEach(makeTaskDraggable);

// Calendar Slots
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

        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        const source = e.dataTransfer.getData("source");

        const dragging = document.querySelector('.dragging');
        if (dragging) dragging.remove();

        const newTask = document.createElement('div');
        newTask.className = "task-card bg-success text-white";
        newTask.innerHTML = `<strong>${data.title}</strong><br><small>${data.desc}</small>`;
        newTask.style.padding = "5px";
        newTask.style.fontSize = "0.8rem";
        newTask.style.borderRadius = "6px";
        newTask.style.margin = "2px 0";

        makeTaskDraggable(newTask);
        slot.appendChild(newTask);
    });
});

// Task Panel
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

        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        const source = e.dataTransfer.getData("source");

        const dragging = document.querySelector('.dragging');
        if (dragging && source === "calendar") dragging.remove();

        const restoredTask = document.createElement('div');
        restoredTask.className = 'task-card';
        restoredTask.innerHTML = `<strong>${data.title}</strong><br><small>${data.desc}</small>`;

        makeTaskDraggable(restoredTask);
        taskList.appendChild(restoredTask);
    });

    // Trash can
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
            if (dragging) dragging.remove();
        });
    }

    // Add new task UI
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskInputWrapper = document.getElementById('task-input-wrapper');
    const taskTitleInput = document.getElementById('new-task-title');
    const taskDescInput = document.getElementById('new-task-desc');
    const saveTaskBtn = document.getElementById('save-task-btn');

    addTaskBtn.addEventListener('click', () => {
        taskInputWrapper.style.display = 'block';
        taskTitleInput.focus();
    });

    saveTaskBtn.addEventListener('click', () => {
        const title = taskTitleInput.value.trim();
        const desc = taskDescInput.value.trim();

        if (title !== '') {
            const taskCard = document.createElement('div');
            taskCard.className = 'task-card';
            taskCard.innerHTML = `<strong>${title}</strong><br><small>${desc}</small>`;

            makeTaskDraggable(taskCard);
            taskList.appendChild(taskCard);

            taskTitleInput.value = '';
            taskDescInput.value = '';
            taskInputWrapper.style.display = 'none';
        }
    });

    taskTitleInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') saveTaskBtn.click();
    });
    taskDescInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveTaskBtn.click();
        }
    });
}

// Resizable Columns
document.querySelectorAll('.day-header').forEach((header, index) => {
    const resizer = document.createElement('div');
    resizer.className = 'column-resizer';
    resizer.addEventListener('mousedown', initColumnResize);
    header.appendChild(resizer);
});

function initColumnResize(e) {
    const startX = e.clientX;
    const column = e.target.parentElement;
    const index = Array.from(column.parentElement.children).indexOf(column);
    const calendarRows = document.querySelectorAll('.calendar-row');
    const originalWidth = column.offsetWidth;

    function onMouseMove(e) {
        const deltaX = e.clientX - startX;
        let newWidth = originalWidth + deltaX;
        newWidth = Math.max(80, Math.min(newWidth, 240));

        column.style.width = `${newWidth}px`;

        calendarRows.forEach(row => {
            const slot = row.children[index + 1]; // skip time label
            if (slot) slot.style.width = `${newWidth}px`;
        });
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

// Resizable Rows
document.querySelectorAll('.calendar-row').forEach(row => {
    const resizer = document.createElement('div');
    resizer.className = 'row-resizer';
    row.appendChild(resizer);

    resizer.addEventListener('mousedown', function (e) {
        e.preventDefault();
        const startY = e.clientY;
        const startHeight = row.offsetHeight;

        function onMouseMove(e) {
            const delta = e.clientY - startY;
            const newHeight = Math.max(startHeight + delta, 24);
            row.style.minHeight = newHeight + 'px';
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
});
