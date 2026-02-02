import React, { useState } from 'react';
import { X, Bug, Lightbulb, Zap, Save } from 'lucide-react';

const GlobalReportModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'Bug',
        priority: 'Medium'
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock submission
        setIsSubmitted(true);
        setTimeout(() => {
            onClose();
        }, 2000);
    };

    if (isSubmitted) {
        return (
            <div className="modal-overlay" style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
            }}>
                <div className="card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-done)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <Zap size={32} />
                    </div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Report Submitted!</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>The IT department has been notified. We'll look into it ASAP.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
            <div className="card" onClick={e => e.stopPropagation()} style={{
                width: '90%', maxWidth: '450px', padding: '2rem', position: 'relative'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}>
                    <X size={24} />
                </button>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Bug size={24} color="var(--brand-primary)" />
                    Report to IT
                </h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Issue / Feature Name</label>
                        <input
                            type="text"
                            required
                            autoFocus
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="What's happening?"
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Category</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'Bug' })}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: formData.type === 'Bug' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)',
                                    border: `1px solid ${formData.type === 'Bug' ? 'var(--priority-critical)' : 'var(--border-subtle)'}`,
                                    color: formData.type === 'Bug' ? 'var(--priority-critical)' : 'var(--text-secondary)',
                                    fontSize: '0.875rem'
                                }}
                            >
                                <Bug size={14} style={{ marginRight: '0.5rem' }} /> Bug
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'Feature' })}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: formData.type === 'Feature' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-tertiary)',
                                    border: `1px solid ${formData.type === 'Feature' ? 'var(--brand-accent)' : 'var(--border-subtle)'}`,
                                    color: formData.type === 'Feature' ? 'var(--brand-accent)' : 'var(--text-secondary)',
                                    fontSize: '0.875rem'
                                }}
                            >
                                <Lightbulb size={14} style={{ marginRight: '0.5rem' }} /> Feature
                            </button>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Description</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Provide details..."
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', minHeight: '100px', outline: 'none', resize: 'none' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                        <Save size={18} /> Submit to IT
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GlobalReportModal;
