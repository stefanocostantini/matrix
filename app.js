// State Management
let tasks = JSON.parse(localStorage.getItem('matrix-tasks')) || [];

// DOM Elements
const form = document.getElementById('add-task-form');
const taskTitleInput = document.getElementById('task-title');
const taskQuadrantSelect = document.getElementById('task-quadrant');
const quadrants = document.querySelectorAll('.quadrant');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    setupDragAndDrop();
});

// Save to LocalStorage
function saveTasks() {
    localStorage.setItem('matrix-tasks', JSON.stringify(tasks));
}

// Render Tasks
function renderTasks() {
    // Clear all lists
    document.querySelectorAll('.task-list').forEach(list => list.innerHTML = '');

    tasks.forEach(task => {
        const quadrantEl = document.querySelector(`.quadrant[data-id="${task.quadrant}"] .task-list`);
        if (quadrantEl) {
            const taskEl = createTaskElement(task);
            quadrantEl.appendChild(taskEl);
        }
    });
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-item ${task.completed ? 'completed' : ''}`;
    div.draggable = true;
    div.dataset.id = task.id;

    div.innerHTML = `
        <div class="task-content">
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.title}</span>
        </div>
        <button class="delete-btn">&times;</button>
    `;

    // Events
    div.querySelector('input').addEventListener('change', (e) => {
        task.completed = e.target.checked;
        div.classList.toggle('completed', task.completed);
        saveTasks();
    });

    div.querySelector('.delete-btn').addEventListener('click', () => {
        tasks = tasks.filter(t => t.id !== task.id);
        div.remove();
        saveTasks();
    });

    div.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', task.id);
        div.style.opacity = '0.4';
    });

    div.addEventListener('dragend', () => {
        div.style.opacity = '1';
        document.querySelectorAll('.task-list').forEach(l => l.classList.remove('drag-over'));
    });

    return div;
}

// Add Task
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTask = {
        id: Date.now(),
        title: taskTitleInput.value,
        quadrant: taskQuadrantSelect.value,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    
    taskTitleInput.value = '';
    taskTitleInput.focus();
});

// Drag and Drop Logic
function setupDragAndDrop() {
    quadrants.forEach(quadrant => {
        const taskList = quadrant.querySelector('.task-list');

        taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            taskList.classList.add('drag-over');
        });

        taskList.addEventListener('dragleave', () => {
            taskList.classList.remove('drag-over');
        });

        taskList.addEventListener('drop', (e) => {
            e.preventDefault();
            taskList.classList.remove('drag-over');
            
            const taskId = parseInt(e.dataTransfer.getData('text/plain'));
            const newQuadrantId = quadrant.dataset.id;
            
            const task = tasks.find(t => t.id === taskId);
            if (task && task.quadrant !== newQuadrantId) {
                task.quadrant = newQuadrantId;
                saveTasks();
                renderTasks();
            }
        });
    });
}
