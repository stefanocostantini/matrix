// Supabase Configuration
const SUPABASE_URL = 'https://rndvtvtpmrjlrnuczqmz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_o8UDAa44JkdmG0ZKZY8_PA_OPq85sui';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// State Management
let tasks = [];

// DOM Elements
const form = document.getElementById('add-task-form');
const taskTitleInput = document.getElementById('task-title');
const taskQuadrantSelect = document.getElementById('task-quadrant');
const quadrants = document.querySelectorAll('.quadrant');
const syncStatusEl = document.getElementById('sync-status');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await fetchTasks();
    setupDragAndDrop();
    setupRealtimeSubscription();
});

// Fetch Tasks from Supabase
async function fetchTasks() {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching tasks:', error);
    } else {
        tasks = data;
        renderTasks();
    }
}

// Real-time Subscription
function setupRealtimeSubscription() {
    const channel = supabase
        .channel('schema-db-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'tasks',
            },
            (payload) => {
                handleRealtimeUpdate(payload);
            }
        )
        .subscribe((status) => {
            updateSyncStatus(status);
        });
}

function updateSyncStatus(status) {
    if (status === 'SUBSCRIBED') {
        syncStatusEl.textContent = 'ONLINE';
        syncStatusEl.className = 'online';
    } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        syncStatusEl.textContent = 'OFFLINE';
        syncStatusEl.className = 'connecting';
    }
}

function flashSyncIndicator() {
    const originalText = syncStatusEl.textContent;
    const originalClass = syncStatusEl.className;
    
    syncStatusEl.textContent = 'SYNCING';
    syncStatusEl.classList.add('syncing');
    
    setTimeout(() => {
        syncStatusEl.textContent = originalText;
        syncStatusEl.className = originalClass;
    }, 500);
}

function handleRealtimeUpdate(payload) {
    flashSyncIndicator();
    
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT') {
        // Only add if not already present (local insert might have already added it)
        if (!tasks.some(t => t.id === newRecord.id)) {
            tasks.push(newRecord);
        }
    } else if (eventType === 'UPDATE') {
        const index = tasks.findIndex(t => t.id === newRecord.id);
        if (index !== -1) {
            tasks[index] = newRecord;
        }
    } else if (eventType === 'DELETE') {
        tasks = tasks.filter(t => t.id === oldRecord.id);
    }

    renderTasks();
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
    div.querySelector('input').addEventListener('change', async (e) => {
        const isCompleted = e.target.checked;
        task.completed = isCompleted;
        div.classList.toggle('completed', isCompleted);
        
        const { error } = await supabase
            .from('tasks')
            .update({ completed: isCompleted })
            .eq('id', task.id);

        if (error) console.error('Error updating task status:', error);
    });

    div.querySelector('.delete-btn').addEventListener('click', async () => {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', task.id);

        if (error) {
            console.error('Error deleting task:', error);
        } else {
            // Local update (optional as handles in realtime handler, but good for UX)
            tasks = tasks.filter(t => t.id !== task.id);
            div.remove();
        }
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
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newTask = {
        title: taskTitleInput.value.toUpperCase(),
        quadrant: taskQuadrantSelect.value,
        completed: false
    };

    const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select();

    if (error) {
        console.error('Error adding task:', error);
    } else {
        // Local update handled by realtime handler usually, 
        // but adding here for immediate feedback if subscription is slow
        if (data && !tasks.some(t => t.id === data[0].id)) {
            tasks.push(data[0]);
            renderTasks();
        }
        taskTitleInput.value = '';
        taskTitleInput.focus();
    }
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

        taskList.addEventListener('drop', async (e) => {
            e.preventDefault();
            taskList.classList.remove('drag-over');
            
            const taskId = parseInt(e.dataTransfer.getData('text/plain'));
            const newQuadrantId = quadrant.dataset.id;
            
            const task = tasks.find(t => t.id === taskId);
            if (task && task.quadrant !== newQuadrantId) {
                const oldQuadrantId = task.quadrant;
                task.quadrant = newQuadrantId; // Optimistic update
                renderTasks();

                const { error } = await supabase
                    .from('tasks')
                    .update({ quadrant: newQuadrantId })
                    .eq('id', taskId);

                if (error) {
                    console.error('Error updating task quadrant:', error);
                    task.quadrant = oldQuadrantId; // Revert on error
                    renderTasks();
                }
            }
        });
    });
}
