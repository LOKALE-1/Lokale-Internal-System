import React, { useState, useEffect, memo } from 'react';
import { Handshake, MessageCircle, ExternalLink, Plus, X, Save, User, Tag } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';

// --- Sub-components for state isolation ---

const CreatePartnerModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'Influencer',
        status: 'Contacted',
        owner: 'Ops Manager'
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
                width: '90%', maxWidth: '450px', padding: '2rem', position: 'relative'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}>
                    <X size={24} />
                </button>
                <h2 style={{ marginBottom: '1.5rem' }}>New Strategic Partner</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Partner Name</label>
                        <input
                            type="text"
                            required
                            autoFocus
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                            <option value="Influencer">Influencer</option>
                            <option value="Strategic Brand">Strategic Brand</option>
                            <option value="Logistics">Logistics</option>
                            <option value="Payment Gateway">Payment Gateway</option>
                            <option value="Community">Community Group</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Status</label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                        >
                            <option value="Contacted">Contacted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Contract Sent">Contract Sent</option>
                            <option value="Live on Lokale">Live on Lokale</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                        <Save size={18} /> Save Partner
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Main Component ---

const Partnerships = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    React.useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'partnerships'), (snapshot) => {
            setPartners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleCreatePartner = async (partnerData) => {
        try {
            await addDoc(collection(db, 'partnerships'), partnerData);
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error("Error adding partner:", error);
        }
    };

    return (
        <div className="partnerships">
            <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Strategic Partnerships</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage high-value relationships and influencers.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
                    >
                        <Plus size={18} />
                        <span>New Partner</span>
                    </button>
                </div>
            </header>

            {isCreateModalOpen && <CreatePartnerModal onClose={() => setIsCreateModalOpen(false)} onSave={handleCreatePartner} />}

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Partner</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Type</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Owner</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partners.map(partner => (
                            <tr key={partner.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'var(--transition)' }} className="table-row">
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                                            <Handshake size={18} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{partner.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High Strategic Value</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{partner.type}</span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: partner.status === 'Live on Lokale' ? 'var(--status-done)' : 'var(--priority-medium)' }}></span>
                                        <span style={{ fontSize: '0.875rem' }}>{partner.status}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ fontSize: '0.875rem' }}>{partner.owner}</div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button style={{ color: 'var(--text-muted)' }} onClick={() => alert('Message partner function')}><MessageCircle size={18} /></button>
                                        <button style={{ color: 'var(--text-muted)' }} onClick={() => alert('View partner portal')}><ExternalLink size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .table-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
      `}} />
        </div>
    );
};

export default Partnerships;
