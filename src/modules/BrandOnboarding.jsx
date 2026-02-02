import React, { useState, useEffect, memo } from 'react';
import { Users, MoreHorizontal, MessageSquare, AlertCircle, Plus, X, Save, TrendingUp, Mail, Phone, Trash2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';

const STAGES = ['Applied', 'Approved', 'Store created', 'Products uploaded', 'First sale'];

// --- Sub-components for state isolation ---

const CreateBrandModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        brand: '',
        category: '',
        contact: '',
        stage: 'Applied',
        assigned: 'Ops Manager'
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
                width: '90%', maxWidth: '450px', padding: '2rem', position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}>
                    <X size={24} />
                </button>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Add New Brand</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Brand Name</label>
                        <input
                            type="text"
                            required
                            autoFocus
                            value={formData.brand}
                            onChange={e => setFormData({ ...formData, brand: e.target.value })}
                            placeholder="Enter brand name..."
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Category</label>
                        <input
                            type="text"
                            required
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            placeholder="e.g. Fashion, Electronics..."
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Contact Info</label>
                        <input
                            type="text"
                            required
                            value={formData.contact}
                            onChange={e => setFormData({ ...formData, contact: e.target.value })}
                            placeholder="Email or phone number..."
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Initial Stage</label>
                        <select
                            value={formData.stage}
                            onChange={e => setFormData({ ...formData, stage: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                        >
                            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                        <Save size={18} /> Add Brand
                    </button>
                </form>
            </div>
        </div>
    );
};

const BrandCard = memo(({ brand, onAction }) => (
    <div className="card" style={{ padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: '600', fontSize: '1rem' }}>{brand.brand}</span>
            <button style={{ color: 'var(--text-muted)' }}><MoreHorizontal size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-accent)' }}></span>
                {brand.category}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={12} /> {brand.contact}
            </div>
        </div>

        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--brand-primary)', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    {brand.assigned ? brand.assigned.charAt(0) : 'O'}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{brand.assigned}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <MessageSquare size={14} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                {brand.id % 3 === 0 && <AlertCircle size={14} color="var(--priority-critical)" />}
            </div>
        </div>
    </div>
));

// --- Main Component ---

const BrandOnboarding = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    React.useEffect(() => {
        const q = collection(db, 'onboarding');
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setBrands(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleCreateBrand = async (brandData) => {
        try {
            await addDoc(collection(db, 'onboarding'), brandData);
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error("Error adding brand:", error);
        }
    };

    return (
        <div className="onboarding" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Brand Onboarding</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Monitor brand lifecycle from application to first sale.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
                    >
                        <Plus size={18} />
                        <span>Add Brand</span>
                    </button>
                </div>
            </header>

            {isCreateModalOpen && <CreateBrandModal onClose={() => setIsCreateModalOpen(false)} onSave={handleCreateBrand} />}

            <div style={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                paddingBottom: '1rem',
                flex: 1,
                minHeight: '0'
            }}>
                {STAGES.map(stage => (
                    <div key={stage} style={{
                        minWidth: '280px',
                        background: 'rgba(255, 255, 255, 0.01)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1rem',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                                {stage}
                            </h3>
                            <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                                {brands.filter(b => b.stage === stage).length}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1 }}>
                            {brands.filter(b => b.stage === stage).map(brand => (
                                <BrandCard key={brand.id} brand={brand} />
                            ))}

                            {brands.filter(b => b.stage === stage).length === 0 && (
                                <div style={{
                                    padding: '2rem',
                                    border: '1px dashed var(--border-subtle)',
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'center',
                                    fontSize: '0.875rem',
                                    color: 'var(--text-muted)',
                                    marginTop: '1rem'
                                }}>
                                    No brands in this stage
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BrandOnboarding;
