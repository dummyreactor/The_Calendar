// DRAG & DROP HELPERS
function makeTaskDraggable(task) {
    task.setAttribute('draggable', 'true');

    task.addEventListener('dragstart', function (e) {
        const title = task.querySelector('strong')?.textContent || task.textContent.trim();
        const desc = task.querySelector('small')?.textContent || "";
        const duration = task.dataset.duration || 1;

        const payload = JSON.stringify({ title, desc, duration });
        e.dataTransfer.setData("text/plain", payload);
        e.dataTransfer.setData("source", task.closest(".task-panel") ? "task-panel" : "calendar");
        task.classList.add("dragging");
    });

    task.addEventListener('dragend', function () {
        task.classList.remove("dragging");
    });

    task.style.cursor = 'pointer';

    task.addEventListener('click', function () {
        const title = task.querySelector('strong')?.textContent || '';
        const desc = task.querySelector('small')?.textContent || '';
        const duration = parseFloat(task.dataset.duration || 1);
        const totalMinutes = Math.round(duration * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        taskTitleInput.value = title;
        taskDescInput.value = desc;
        taskHourInput.value = hours;
        taskMinuteInput.value = minutes;

        document.querySelectorAll('.task-card[data-editing]').forEach(t => delete t.dataset.editing);
        task.dataset.editing = "true";
        taskModal.show();

        setTimeout(() => taskTitleInput.focus(), 200);
    });
}

document.querySelectorAll('.task-card').forEach(makeTaskDraggable);

// =======================
// CALENDAR SLOTS DROP ZONES
// =======================
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

        const duration = parseFloat(data.duration) || 1;
        const durationInMinutes = duration * 60;

        const day = slot.dataset.day;
        const hour = parseInt(slot.dataset.hour);

        const currentSlot = document.querySelector(`.calendar-slot[data-day="${day}"][data-hour="${hour}"]`);
        const existingTasks = currentSlot.querySelectorAll('.task-card');

        let existingDurationInMinutes = 0;
        existingTasks.forEach(task => {
            const taskDuration = parseFloat(task.dataset.duration) || 1;
            existingDurationInMinutes += taskDuration * 60;
        });

        if ((existingDurationInMinutes + durationInMinutes) > 60) {
            alert("Combined tasks exceed 60 minutes. Cannot place more in this slot.");

            const restoredTask = document.createElement('div');
            restoredTask.className = 'task-card';
            restoredTask.innerHTML = `<strong>${data.title}</strong><br><small>${data.desc}</small>`;
            restoredTask.dataset.duration = duration;
            makeTaskDraggable(restoredTask);
            document.querySelector('.task-list')?.appendChild(restoredTask);
            return;
        }

        const newTask = document.createElement('div');
        newTask.className = "task-card bg-success text-white";
        newTask.innerHTML = `<strong>${data.title}</strong><br><small>${data.desc}</small>`;
        newTask.dataset.duration = duration;

        // 48px per hour = 0.8px per minute
        //newTask.style.height = `${(48 * durationInMinutes) / 60}px`;
        newTask.style.position = 'absolute';
        newTask.style.top = `${existingTasks.length * 4}px`; // stacking margin
        newTask.style.left = '0';
        newTask.style.right = '0';
        newTask.style.zIndex = '1';

        makeTaskDraggable(newTask);
        currentSlot.appendChild(newTask);
        currentSlot.style.position = 'relative';
    });
});

// =======================
// TASK PANEL DROP & CREATE
// =======================
const taskList = document.querySelector('.task-list');
const addTaskBtn = document.getElementById('add-task-btn');
const taskTitleInput = document.getElementById('new-task-title');
const taskDescInput = document.getElementById('new-task-desc');
const taskHourInput = document.getElementById('new-task-hour');
const taskMinuteInput = document.getElementById('new-task-minute');
const saveTaskBtn = document.getElementById('save-task-btn');
const taskModal = new bootstrap.Modal(document.getElementById('taskInputModal'));

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
        restoredTask.dataset.duration = data.duration;

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
            if (dragging) dragging.remove();
        });
    }

    addTaskBtn.addEventListener('click', () => {
        taskTitleInput.value = '';
        taskDescInput.value = '';
        taskHourInput.value = '';
        taskMinuteInput.value = '';
        document.querySelectorAll('.task-card[data-editing]').forEach(t => delete t.dataset.editing);
        taskModal.show();
        setTimeout(() => taskTitleInput.focus(), 200);
    });

    taskMinuteInput.addEventListener('input', () => {
        let minutes = parseInt(taskMinuteInput.value) || 0;
        let hours = parseInt(taskHourInput.value) || 0;

        if (minutes >= 60) {
            const extra = Math.floor(minutes / 60);
            minutes = minutes % 60;
            hours += extra;

            if (hours > 8) {
                hours = 8;
                minutes = 0;
            }

            taskHourInput.value = hours;
            taskMinuteInput.value = minutes;
        }
    });

    saveTaskBtn.addEventListener('click', () => {
        const title = taskTitleInput.value.trim();
        const desc = taskDescInput.value.trim();
        let hours = parseInt(taskHourInput.value) || 0;
        let minutes = parseInt(taskMinuteInput.value) || 0;

        const totalMinutes = hours * 60 + minutes;
        if (totalMinutes < 1) return;

        const decimalDuration = totalMinutes / 60;

        const editingTask = document.querySelector('.task-card[data-editing="true"]');
        if (editingTask) {
            editingTask.querySelector('strong').textContent = title;
            editingTask.querySelector('small').textContent = desc;
            editingTask.dataset.duration = decimalDuration.toFixed(2);
            //editingTask.style.height = `${(48 * totalMinutes) / 60}px`;
            delete editingTask.dataset.editing;
            taskModal.hide();
            return;
        }

        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `<strong>${title}</strong><br><small>${desc}</small>`;
        taskCard.dataset.duration = decimalDuration.toFixed(2);

        makeTaskDraggable(taskCard);
        taskList.appendChild(taskCard);
        taskModal.hide();
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



// =======================
// COLUMN RESIZER
// =======================
document.querySelectorAll('.day-header').forEach((header, index) => {
    const resizer = document.createElement('div');
    resizer.className = 'column-resizer';
    header.appendChild(resizer);

    resizer.addEventListener('mousedown', function (e) {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = header.offsetWidth;
        const columnIndex = index;
        const calendarRows = document.querySelectorAll('.calendar-row');

        function onMouseMove(e) {
            const delta = e.clientX - startX;
            const newWidth = Math.max(80, Math.min(startWidth + delta, 240));
            header.style.width = `${newWidth}px`;

            calendarRows.forEach(row => {
                const slot = row.children[columnIndex + 1];
                if (slot) {
                    slot.style.width = `${newWidth}px`;
                }
            });
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
});

// =======================
// ROW RESIZER (UPDATED TO RESIZE TASKS TOO)
// =======================
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

            // Resize all tasks in this row
            row.querySelectorAll('.task-card').forEach(task => {
                //const duration = parseInt(task.dataset.duration) || 1;
                //task.style.height = `${newHeight * duration}px`;
            });
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
});

// =======================
// RESET LAYOUT (UPDATED TO RESET TASK HEIGHTS)
// =======================
document.getElementById('reset-layout-btn')?.addEventListener('click', () => {
    const headers = document.querySelectorAll('.day-header');
    const rows = document.querySelectorAll('.calendar-row');
    const defaultWidth = '120px';
    const defaultHeight = 48;

    headers.forEach((header, index) => {
        header.style.width = defaultWidth;
        rows.forEach(row => {
            const slot = row.children[index + 1];
            if (slot) slot.style.width = defaultWidth;
        });
    });

    rows.forEach(row => {
        row.style.minHeight = `${defaultHeight}px`;
        row.querySelectorAll('.task-card').forEach(task => {
            //const duration = parseInt(task.dataset.duration) || 1;
            //task.style.height = `${defaultHeight * duration}px`;
        });
    });
});
