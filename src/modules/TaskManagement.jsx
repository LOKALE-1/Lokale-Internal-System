import React, { useState, useMemo, memo } from 'react';
import {
    Search,
    Filter,
    Plus,
    Calendar,
    User,
    Tag,
    X,
    Clock,
    AlertCircle,
    Trash2,
    Save,
    CheckCircle2,
    Briefcase
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ROLES, useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy
} from 'firebase/firestore';

const COLUMNS = ['Backlog', 'To Do', 'In Progress', 'Blocked', 'Done'];

// Helper to get priority color
const getPriorityColor = (priority) => {
    switch (priority) {
        case 'Critical': return 'var(--priority-critical)';
        case 'High': return 'var(--priority-high)';
        case 'Medium': return 'var(--priority-medium)';
        default: return 'var(--priority-low)';
    }
};

// --- Sub-components to isolate state and prevent main-board re-renders ---

const CreateTaskModal = ({ onClose, onSave, uniqueUsers, userRole, userName, projects }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dept: userRole || ROLES.MARKETING,
        assigned: userName || '',
        priority: 'Medium',
        dueDate: new Date().toISOString().split('T')[0],
        projectId: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card" onClick={e => e.stopPropagation()} style={{
                width: '90%', maxWidth: '500px', padding: '2rem', position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}>
                    <X size={24} />
                </button>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Create Task</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Title</label>
                        <input
                            type="text"
                            required
                            autoFocus
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter task title..."
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Provide more details..."
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', minHeight: '100px', outline: 'none', resize: 'vertical' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Priority</label>
                            <select
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Due Date</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Assign To</label>
                        <select
                            value={formData.assigned}
                            onChange={e => setFormData({ ...formData, assigned: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                        >
                            <option value={userName}>{userName} (You)</option>
                            {uniqueUsers.filter(u => u !== userName).map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Link to Project</label>
                        <select
                            value={formData.projectId}
                            onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                        >
                            <option value="">No Project</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                        <Save size={18} /> Create Task
                    </button>
                </form>
            </div>
        </div>
    );
};

const TaskDetailModal = ({ task, onClose, onUpdate, onDelete, uniqueUsers, isFounder }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...task });

    const handleSave = () => {
        onUpdate(editData);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="modal-overlay" onClick={() => setIsEditing(false)} style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001
            }}>
                <div className="card" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Edit Task</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <input
                            type="text"
                            value={editData.title}
                            onChange={e => setEditData({ ...editData, title: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
                        />
                        <textarea
                            value={editData.description}
                            onChange={e => setEditData({ ...editData, description: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', minHeight: '100px' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <select
                                value={editData.priority}
                                onChange={e => setEditData({ ...editData, priority: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                            <input
                                type="date"
                                value={editData.dueDate}
                                onChange={e => setEditData({ ...editData, dueDate: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
                            />
                        </div>
                        <select
                            value={editData.assigned}
                            onChange={e => setEditData({ ...editData, assigned: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white' }}
                        >
                            {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancel</button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card" onClick={e => e.stopPropagation()} style={{
                width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
                padding: '2.5rem', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-muted)' }}>
                    <X size={24} />
                </button>

                <header style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                        <span className="badge" style={{ background: `${getPriorityColor(task.priority)}20`, color: getPriorityColor(task.priority) }}>
                            {task.priority} Priority
                        </span>
                        <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--brand-primary)' }}>
                            {task.status}
                        </span>
                    </div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{task.title}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>{task.description}</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem', background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Department</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Tag size={16} color="var(--brand-secondary)" />
                            <span>{task.dept}</span>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Assigned To</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} color="var(--brand-accent)" />
                            <span>{task.assigned}</span>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Due Date</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={16} color="var(--priority-critical)" />
                            <span style={{ color: new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'var(--priority-critical)' : 'inherit' }}>
                                {task.dueDate} {new Date(task.dueDate) < new Date() && task.status !== 'Done' && '(Overdue)'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Created On</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={16} color="var(--text-muted)" />
                            <span>{task.creationDate || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                        <Clock size={16} /> Activity History
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border-subtle)' }}>
                        {task.history.map((item, i) => (
                            <div key={i} style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '-13px', top: '5px', width: '9px', height: '9px', borderRadius: '50%', background: 'var(--brand-primary)', border: '2px solid var(--bg-secondary)' }}></div>
                                <div style={{ fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-muted)', marginRight: '1rem' }}>{item.date}</span>
                                    <span style={{ color: 'var(--text-primary)' }}>
                                        <strong>{item.user}</strong> {item.action}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {isFounder && (
                    <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                        <button className="btn btn-outline" style={{ flex: 1, color: 'var(--priority-critical)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => onDelete(task.id)}>
                            <Trash2 size={18} /> Delete Task
                        </button>
                        <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setIsEditing(true)}>Edit Details</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Component ---

const TaskManagement = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        dept: 'All',
        priority: 'All',
        user: 'All',
        overdue: false
    });

    const isFounder = user?.role === ROLES.ADMIN;

    // Listen to Tasks
    React.useEffect(() => {
        const q = query(collection(db, 'tasks'), orderBy('creationDate', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const taskData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTasks(taskData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Listen to Projects
    React.useEffect(() => {
        const q = collection(db, 'projects');
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProjects(projData);
        });
        return () => unsubscribe();
    }, []);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            const roleMatch = isFounder || task.assigned === user?.name || task.dept === user?.role;
            if (!roleMatch && filters.user === 'All' && filters.dept === 'All') return false;

            const deptMatch = filters.dept === 'All' || task.dept === filters.dept;
            const priorityMatch = filters.priority === 'All' || task.priority === filters.priority;
            const userMatch = filters.user === 'All' || task.assigned === filters.user;
            const overdueMatch = !filters.overdue || (new Date(task.dueDate) < new Date() && task.status !== 'Done');

            return deptMatch && priorityMatch && userMatch && overdueMatch;
        });
    }, [tasks, filters, user, isFounder, searchQuery]);

    const uniqueUsers = useMemo(() => {
        const users = new Set(tasks.map(t => t.assigned));
        return Array.from(users);
    }, [tasks]);

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;
        if (source.droppableId === destination.droppableId) return;

        const newStatus = destination.droppableId;
        const taskRef = doc(db, 'tasks', draggableId);
        const task = tasks.find(t => t.id === draggableId);

        try {
            await updateDoc(taskRef, {
                status: newStatus,
                history: [
                    { date: new Date().toISOString().split('T')[0], action: `Moved from ${source.droppableId} to ${newStatus}`, user: user?.name },
                    ...task.history
                ]
            });
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    const handleCreateTask = async (taskData) => {
        try {
            await addDoc(collection(db, 'tasks'), {
                ...taskData,
                status: 'To Do',
                creationDate: new Date().toISOString().split('T')[0],
                history: [{ date: new Date().toISOString().split('T')[0], action: 'Task created', user: user?.name }]
            });
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    const handleUpdateTask = async (updatedTask) => {
        try {
            const { id, ...data } = updatedTask;
            const taskRef = doc(db, 'tasks', id);
            await updateDoc(taskRef, {
                ...data,
                history: [{ date: new Date().toISOString().split('T')[0], action: 'Task updated', user: user?.name }, ...data.history]
            });
            setSelectedTask(null);
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteDoc(doc(db, 'tasks', taskId));
                setSelectedTask(null);
            } catch (error) {
                console.error("Error deleting task:", error);
            }
        }
    };

    const TaskCard = memo(({ task, index }) => (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="card task-card"
                    style={{
                        ...provided.draggableProps.style,
                        padding: '1rem',
                        marginBottom: '0.75rem',
                        background: snapshot.isDragging ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                        borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
                        cursor: 'pointer'
                    }}
                    onClick={() => setSelectedTask(task)}
                >
                    <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{task.dept}</span>
                            {new Date(task.dueDate) < new Date() && task.status !== 'Done' && (
                                <AlertCircle size={14} color="var(--priority-critical)" />
                            )}
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.4' }}>{task.title}</h4>
                        {task.projectId && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Briefcase size={12} color="var(--brand-primary)" />
                                <span style={{ fontSize: '0.65rem', color: 'var(--brand-primary)', fontWeight: '600' }}>
                                    {projects.find(p => p.id === task.projectId)?.name || 'Untitled Project'}
                                </span>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#000', fontWeight: 'bold' }}>
                                {task.assigned ? task.assigned.charAt(0) : '?'}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{task.assigned}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} />
                            {task.dueDate}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    ));

    return (
        <div className="tasks" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Kanban Board</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {isFounder ? 'Full visibility across all departments' : `Your tasks for ${user?.role}`}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="btn btn-outline"
                        onClick={() => setFilters({ ...filters, overdue: !filters.overdue })}
                        style={{
                            borderColor: filters.overdue ? 'var(--priority-critical)' : 'var(--border-subtle)',
                            background: filters.overdue ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                        }}
                    >
                        <AlertCircle size={18} color={filters.overdue ? 'var(--priority-critical)' : 'var(--text-muted)'} />
                        Overdue
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
                    >
                        <Plus size={18} />
                        <span>Create Task</span>
                    </button>
                </div>
            </header>

            {/* Filters Bar */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '0.75rem 1.25rem', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRight: '1px solid var(--border-subtle)', paddingRight: '1.5rem' }}>
                        <Filter size={16} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter By</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                        <select
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
                            value={filters.dept}
                            onChange={(e) => setFilters({ ...filters, dept: e.target.value })}
                        >
                            <option value="All">All Departments</option>
                            {Object.values(ROLES).map(role => <option key={role} value={role}>{role}</option>)}
                        </select>

                        <select
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
                            value={filters.user}
                            onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                        >
                            <option value="All">All Assignees</option>
                            {uniqueUsers.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>

                        <select
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
                            value={filters.priority}
                            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        >
                            <option value="All">All Priorities</option>
                            <option value="Critical">Critical</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>

                    <div style={{ width: '250px', position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-subtle)',
                                width: '100%',
                                padding: '0.5rem 1rem 0.5rem 2.25rem',
                                color: 'white',
                                fontSize: '0.85rem',
                                borderRadius: 'var(--radius-md)'
                            }}
                        />
                    </div>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, overflowX: 'auto', paddingBottom: '1rem', minHeight: '0' }}>
                    {COLUMNS.map(column => (
                        <div key={column} style={{ minWidth: '280px', flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', padding: '0.5rem' }}>
                            <div style={{ padding: '0.75rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{column}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <button onClick={() => setIsCreateModalOpen(true)} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}><Plus size={16} /></button>
                                    <span style={{ background: 'var(--bg-tertiary)', padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {filteredTasks.filter(t => t.status === column).length}
                                    </span>
                                </div>
                            </div>
                            <Droppable droppableId={column}>
                                {(provided, snapshot) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} style={{ flex: 1, background: snapshot.isDraggingOver ? 'rgba(99, 102, 241, 0.05)' : 'transparent', borderRadius: 'var(--radius-md)', padding: '0.5rem', overflowY: 'auto' }}>
                                        {filteredTasks.filter(task => task.status === column).map((task, index) => (
                                            <TaskCard key={task.id} task={task} index={index} />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                    uniqueUsers={uniqueUsers}
                    isFounder={isFounder}
                />
            )}
            {isCreateModalOpen && (
                <CreateTaskModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSave={handleCreateTask}
                    uniqueUsers={uniqueUsers}
                    userRole={user?.role}
                    userName={user?.name}
                    projects={projects}
                />
            )}
        </div>
    );
};

export default TaskManagement;
