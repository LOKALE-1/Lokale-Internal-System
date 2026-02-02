import React, { useState, useEffect, memo } from 'react';
import { Cpu, Bug, Lightbulb, Zap, Plus, AlertTriangle, X, Save, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';

// --- Sub-components for state isolation ---

const ReportModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'Bug',
        priority: 'Medium',
        status: 'Backlog',
        assigned: 'IT Team'
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
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Report Bug / Feature</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Subject</label>
                        <input
                            type="text"
                            required
                            autoFocus
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Login page is slow..."
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Type</label>
                        <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                        >
                            <option value="Bug">Bug / Issue</option>
                            <option value="Feature">New Feature Request</option>
                            <option value="Improvement">UI/UX Improvement</option>
                        </select>
                    </div>
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
                            <option value="Critical">Critical (Blocker)</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Explain the bug or feature in detail..."
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', minHeight: '100px', outline: 'none', resize: 'vertical' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                        <Save size={18} /> Submit Report
                    </button>
                </form>
            </div>
        </div>
    );
};

const ITItemCard = memo(({ item }) => {
    const getTypeIcon = (type) => {
        switch (type) {
            case 'Bug': return <Bug size={16} color="var(--priority-critical)" />;
            case 'Feature': return <Lightbulb size={16} color="var(--brand-accent)" />;
            case 'Improvement': return <Zap size={16} color="var(--brand-primary)" />;
            default: return <Cpu size={16} />;
        }
    };

    return (
        <div className="card" style={{ padding: '1rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {getTypeIcon(item.type)}
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{item.type}</span>
                {item.priority === 'Critical' && <AlertTriangle size={14} color="var(--priority-critical)" style={{ marginLeft: 'auto' }} />}
            </div>

            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', lineHeight: '1.4' }}>{item.title}</h4>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-tertiary)', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        {item.assigned ? item.assigned.split(' ').pop().charAt(0) : 'U'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.assigned}</span>
                </div>
                <span className="badge" style={{
                    background: item.priority === 'Critical' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)',
                    color: item.priority === 'Critical' ? 'var(--priority-critical)' : 'var(--text-muted)',
                    fontSize: '0.65rem'
                }}>
                    {item.priority}
                </span>
            </div>
        </div>
    );
});

// --- Main Component ---

const ITBoard = () => {
    const [itItems, setItItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    React.useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'it_items'), (snapshot) => {
            setItItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleReport = async (reportData) => {
        try {
            await addDoc(collection(db, 'it_items'), reportData);
            setIsReportModalOpen(false);
        } catch (error) {
            console.error("Error submitting report:", error);
        }
    };

    return (
        <div className="it-board" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>IT / Product Board</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage stability, bugs, and platform evolution.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsReportModalOpen(true)}
                        style={{ boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
                    >
                        <Plus size={18} />
                        <span>Report Issue / Feature</span>
                    </button>
                </div>
            </header>

            {isReportModalOpen && <ReportModal onClose={() => setIsReportModalOpen(false)} onSave={handleReport} />}

            <div style={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                paddingBottom: '1rem',
                flex: 1,
                minHeight: '0'
            }}>
                {['Backlog', 'In Progress', 'Testing', 'Live'].map(status => (
                    <div key={status} style={{ minWidth: '280px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '2px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status === 'Live' ? 'var(--status-done)' : status === 'Testing' ? 'var(--brand-secondary)' : 'var(--text-muted)' }}></div>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{status}</h3>
                            <span style={{ marginLeft: 'auto', background: 'var(--bg-tertiary)', padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {itItems.filter(i => i.status === status).length}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1 }}>
                            {itItems.filter(i => i.status === status).map(item => (
                                <ITItemCard key={item.id} item={item} />
                            ))}

                            {itItems.filter(i => i.status === status).length === 0 && (
                                <div style={{
                                    padding: '2rem',
                                    textAlign: 'center',
                                    color: 'var(--text-muted)',
                                    fontSize: '0.875rem',
                                    border: '1px dashed var(--border-subtle)',
                                    borderRadius: 'var(--radius-md)',
                                    marginTop: '0.5rem'
                                }}>
                                    No items in {status}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ITBoard;
