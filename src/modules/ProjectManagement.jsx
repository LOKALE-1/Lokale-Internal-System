import React, { useState, useMemo, memo } from 'react';
import {
    Briefcase,
    Plus,
    Search,
    Filter,
    Calendar,
    DollarSign,
    User,
    BarChart3,
    ChevronRight,
    X,
    Save,
    Flag,
    PieChart,
    Clock,
    Target,
    Users,
    Activity,
    AlertCircle,
    CheckCircle2,
    Link as LinkIcon,
    AlertTriangle,
    MinusCircle
} from 'lucide-react';
import { PROJECTS, INITIAL_TASKS } from '../data/mockData';
import { ROLES, useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';

// --- Sub-components ---

const CreateProjectModal = ({ onClose, onSave, userName }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'Campaign',
        objective: '',
        owner: userName || 'Founder',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'Planned',
        linkedDepts: [ROLES.MARKETING],
        notes: '',
        budget: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const toggleDept = (dept) => {
        setFormData(prev => ({
            ...prev,
            linkedDepts: prev.linkedDepts.includes(dept)
                ? prev.linkedDepts.filter(d => d !== dept)
                : [...prev.linkedDepts, dept]
        }));
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card" onClick={e => e.stopPropagation()} style={{
                width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-muted)' }}>
                    <X size={24} />
                </button>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Plan New Project</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Project Name</label>
                        <input
                            type="text" required autoFocus
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Q2 Influencer Blitz"
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                            >
                                <option value="Event">Event</option>
                                <option value="Campaign">Campaign</option>
                                <option value="Product">Product</option>
                                <option value="Internal">Internal</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Owner</label>
                            <input
                                type="text" required
                                value={formData.owner}
                                onChange={e => setFormData({ ...formData, owner: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Objective</label>
                        <textarea
                            value={formData.objective} required
                            onChange={e => setFormData({ ...formData, objective: e.target.value })}
                            placeholder="What does success look like?"
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', minHeight: '60px', outline: 'none', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Start Date</label>
                            <input
                                type="date" required
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>End Date</label>
                            <input
                                type="date" required
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Linked Departments</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {Object.values(ROLES).map(role => (
                                <button
                                    key={role} type="button"
                                    onClick={() => toggleDept(role)}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        fontSize: '0.75rem',
                                        borderRadius: 'var(--radius-full)',
                                        border: '1px solid var(--border-subtle)',
                                        background: formData.linkedDepts.includes(role) ? 'var(--brand-primary)' : 'var(--bg-tertiary)',
                                        color: formData.linkedDepts.includes(role) ? 'white' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'var(--transition)'
                                    }}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Additional details..."
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', minHeight: '60px', outline: 'none', resize: 'vertical' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                        <Save size={18} /> Save Project
                    </button>
                </form>
            </div>
        </div>
    );
};

const ProjectOverviewModal = ({ project, tasks, onClose }) => {
    const projectTasks = useMemo(() => tasks.filter(t => t.projectId === project.id), [tasks, project.id]);
    const progress = useMemo(() => {
        if (projectTasks.length === 0) return 0;
        const completed = projectTasks.filter(t => t.status === 'Done').length;
        return Math.round((completed / projectTasks.length) * 100);
    }, [projectTasks]);

    const overdueCount = projectTasks.filter(t => t.status !== 'Done' && new Date(t.dueDate) < new Date()).length;
    const blockedCount = projectTasks.filter(t => t.status === 'Blocked').length;

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card" onClick={e => e.stopPropagation()} style={{
                width: '95%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '3rem', position: 'relative'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-muted)' }}>
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <span className="badge" style={{ background: 'var(--bg-tertiary)' }}>{project.type}</span>
                            <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--brand-primary)' }}>{project.status}</span>
                        </div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{project.name}</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>{project.objective}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--brand-primary)' }}>{progress}%</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Project Completion</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                    <div className="card" style={{ padding: '1rem', background: 'var(--bg-tertiary)', border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                            <User size={14} /> Owner
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{project.owner}</div>
                    </div>
                    <div className="card" style={{ padding: '1rem', background: 'var(--bg-tertiary)', border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                            <Calendar size={14} /> Timeline
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{project.startDate} — {project.endDate}</div>
                    </div>
                    <div className="card" style={{ padding: '1rem', background: overdueCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)', border: overdueCount > 0 ? '1px solid rgba(239, 68, 68, 0.2)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: overdueCount > 0 ? 'var(--priority-critical)' : 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                            <AlertTriangle size={14} /> Overdue Tasks
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: overdueCount > 0 ? 'var(--priority-critical)' : 'inherit' }}>{overdueCount}</div>
                    </div>
                    <div className="card" style={{ padding: '1rem', background: blockedCount > 0 ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-tertiary)', border: blockedCount > 0 ? '1px solid rgba(245, 158, 11, 0.2)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: blockedCount > 0 ? 'var(--priority-medium)' : 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                            <MinusCircle size={14} /> Blocked Tasks
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: blockedCount > 0 ? 'var(--priority-medium)' : 'inherit' }}>{blockedCount}</div>
                    </div>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={18} /> Connected Tasks ({projectTasks.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {projectTasks.map(t => (
                            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{
                                    width: '12px', height: '12px', borderRadius: '50%',
                                    background: t.status === 'Done' ? 'var(--status-done)' : 'var(--brand-primary)'
                                }}></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{t.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.assigned} • Due {t.dueDate}</div>
                                </div>
                                <span className={`badge ${t.status === 'Done' ? 'badge-success' : ''}`} style={{ fontSize: '0.7rem' }}>{t.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={18} /> Strategic Notes
                    </h3>
                    <div style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '3px solid var(--brand-primary)' }}>
                        "{project.notes || 'No strategic notes added yet.'}"
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProjectCard = memo(({ project, tasks, onClick }) => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const progress = projectTasks.length === 0 ? 0 : Math.round((projectTasks.filter(t => t.status === 'Done').length / projectTasks.length) * 100);
    const overdue = projectTasks.filter(t => t.status !== 'Done' && new Date(t.dueDate) < new Date()).length;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'var(--brand-accent)';
            case 'Planned': return 'var(--brand-primary)';
            case 'On Hold': return 'var(--priority-medium)';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <div className="card" onClick={() => onClick(project)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontSize: '0.65rem' }}>{project.type}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: getStatusColor(project.status), display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getStatusColor(project.status) }}></div>
                    {project.status}
                </span>
            </div>

            <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{project.name}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
                    {project.linkedDepts.map(d => (
                        <span key={d} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>{d}</span>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <User size={14} /> {project.owner}
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <span>Completion</span>
                    <span>{progress}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '0.75rem' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))', transition: 'width 0.5s ease' }}></div>
                </div>
                {overdue > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--priority-critical)', fontSize: '0.7rem', fontWeight: '600' }}>
                        <AlertTriangle size={12} /> {overdue} overdue tasks
                    </div>
                )}
            </div>
        </div>
    );
});

// --- Main Component ---

const ProjectManagement = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [filterType, setFilterType] = useState('All');

    // Sync projects
    React.useEffect(() => {
        const q = query(collection(db, 'projects'), orderBy('startDate', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Sync tasks for progress
    React.useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
            setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const canManage = (project) => user?.role === ROLES.ADMIN || project?.owner === user?.name;

    const handleCreateProject = async (projectData) => {
        try {
            await addDoc(collection(db, 'projects'), projectData);
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error("Error creating project:", error);
        }
    };

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || p.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="projects" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Lokale Initiatives</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>High-level planning and cross-departmental execution.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{ boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
                >
                    <Plus size={18} />
                    <span>Plan Initiative</span>
                </button>
            </header>

            <div className="card" style={{ marginBottom: '1.5rem', padding: '0.75rem 1.25rem', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRight: '1px solid var(--border-subtle)', paddingRight: '1.5rem' }}>
                        <Filter size={16} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Type</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', flex: 1 }}>
                        <select
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="All">All Types</option>
                            <option value="Event">Event</option>
                            <option value="Campaign">Campaign</option>
                            <option value="Product">Product</option>
                            <option value="Internal">Internal</option>
                        </select>
                    </div>
                    <div style={{ width: '250px', position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text" placeholder="Search initiatives..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', color: 'white', borderRadius: 'var(--radius-md)' }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', paddingBottom: '2rem' }}>
                    {filteredProjects.map(project => (
                        <ProjectCard key={project.id} project={project} tasks={tasks} onClick={setSelectedProject} />
                    ))}
                </div>
            </div>

            {isCreateModalOpen && <CreateProjectModal onClose={() => setIsCreateModalOpen(false)} onSave={handleCreateProject} userName={user?.name} />}
            {selectedProject && <ProjectOverviewModal project={selectedProject} tasks={tasks} onClose={() => setSelectedProject(null)} />}
        </div>
    );
};

export default ProjectManagement;
