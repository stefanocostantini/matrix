import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import './App.css'

interface Task {
  id: number;
  title: string;
  description: string;
  quadrant: string;
  completed: boolean;
}

const QUADRANTS = [
  { id: 'urgent_important', label: 'Urgent & Important' },
  { id: 'not_urgent_important', label: 'Important (Not Urgent)' },
  { id: 'urgent_not_important', label: 'Urgent (Not Important)' },
  { id: 'not_urgent_not_important', label: 'Neither' }
];

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newQuadrant, setNewQuadrant] = useState('urgent_important');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch('http://localhost:8000/tasks');
    const data = await res.json();
    setTasks(data);
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    await fetch('http://localhost:8000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, quadrant: newQuadrant })
    });
    setNewTitle('');
    fetchTasks();
  };

  const toggleTask = async (task: Task) => {
    await fetch(`http://localhost:8000/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed })
    });
    fetchTasks();
  };

  const deleteTask = async (id: number) => {
    await fetch(`http://localhost:8000/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const taskId = parseInt(draggableId);
    const newQuadrantId = destination.droppableId;

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, quadrant: newQuadrantId } : t));

    await fetch(`http://localhost:8000/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quadrant: newQuadrantId })
    });
    fetchTasks();
  };

  return (
    <div className="app-container">
      <h1>Eisenhower Matrix</h1>
      
      <form onSubmit={addTask} className="add-task-form">
        <input 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)} 
          placeholder="New task..."
        />
        <select value={newQuadrant} onChange={(e) => setNewQuadrant(e.target.value)}>
          {QUADRANTS.map(q => <option key={q.id} value={q.id}>{q.label}</option>)}
        </select>
        <button type="submit">Add Task</button>
      </form>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="matrix-grid">
          {QUADRANTS.map(q => (
            <Droppable key={q.id} droppableId={q.id}>
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  className={`quadrant ${q.id.replace(/_/g, '-')} ${snapshot.isDraggingOver ? 'quadrant-dragging-over' : ''}`}
                >
                  <h2>{q.label}</h2>
                  <div className="task-list">
                    {tasks.filter(t => t.quadrant === q.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided) => (
                          <div 
                            ref={provided.innerRef} 
                            {...provided.draggableProps} 
                            {...provided.dragHandleProps}
                            className={`task-item ${task.completed ? 'completed' : ''}`}
                          >
                            <div className="task-content">
                              <input 
                                type="checkbox" 
                                checked={task.completed} 
                                onChange={() => toggleTask(task)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span>{task.title}</span>
                            </div>
                            <button onClick={() => deleteTask(task.id)}>x</button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}

export default App
