import React, { useState, useEffect, memo } from 'react';
import {
    Plus,
    ExternalLink,
    Calendar,
    Target,
    Hash,
    X,
    BarChart3,
    ArrowUpRight,
    Save,
    FileText,
    TrendingUp
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';

// --- Sub-components for state isolation ---

const CampaignDetailModal = ({ campaign, onClose, onEdit }) => {
    if (!campaign) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card" onClick={e => e.stopPropagation()} style={{
                width: '90%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto',
                padding: '2.5rem', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-muted)' }}>
                    <X size={24} />
                </button>

                <header style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                        <span className="badge" style={{
                            background: campaign.status === 'Live' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                            color: campaign.status === 'Live' ? 'var(--status-done)' : 'var(--brand-primary)'
                        }}>
                            {campaign.status}
                        </span>
                        <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                            {campaign.channel}
                        </span>
                    </div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{campaign.name}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>{campaign.description}</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Objective</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Target size={18} color="var(--brand-primary)" />
                            <span style={{ fontSize: '1rem' }}>{campaign.objective}</span>
                        </div>
                    </div>
                    <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Timeline</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={18} color="var(--brand-secondary)" />
                            <span style={{ fontSize: '1rem' }}>{campaign.startDate} - {campaign.endDate}</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                        <BarChart3 size={18} /> Financials & KPIs
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div style={{ textAlign: 'center', padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Budget</span>
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{campaign.budget}</span>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Spent</span>
                            <span style={{ fontWeight: '600', color: 'var(--brand-primary)' }}>{campaign.spent}</span>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Target KPI</span>
                            <span style={{ fontWeight: '600', color: 'var(--status-done)' }}>{campaign.kpi}</span>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-done)' }}>
                        <ArrowUpRight size={18} /> Performance Results
                    </h3>
                    <p style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '500' }}>{campaign.results}</p>
                </div>

                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => alert('Report exported as PDF!')}>
                        <FileText size={18} /> Export Report
                    </button>
                    <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => onEdit(campaign)}>Edit Campaign</button>
                </div>
            </div>
        </div>
    );
};

const LaunchCampaignModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        channel: 'TikTok',
        objective: 'App installs',
        status: 'Planned',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        kpi: '',
        budget: '',
        spent: '$0',
        results: 'Waiting for launch...'
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
                width: '90%', maxWidth: '550px', padding: '2rem', position: 'relative'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}>
                    <X size={24} />
                </button>
                <h2 style={{ marginBottom: '1.5rem' }}>Launch New Campaign</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Campaign Name</label>
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
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Channel</label>
                        <select
                            value={formData.channel}
                            onChange={e => setFormData({ ...formData, channel: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                        >
                            <option value="TikTok">TikTok</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Google Ads">Google Ads</option>
                            <option value="Offline">Offline/PR</option>
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Budget</label>
                            <input
                                type="text"
                                placeholder="$0.00"
                                value={formData.budget}
                                onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>KPI Target</label>
                            <input
                                type="text"
                                placeholder="e.g. 1000 sales"
                                value={formData.kpi}
                                onChange={e => setFormData({ ...formData, kpi: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                        <Save size={18} /> Launch Campaign
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Main Component ---

const GrowthCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);

    React.useEffect(() => {
        const q = query(collection(db, 'campaigns'), orderBy('startDate', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLaunchCampaign = async (campaignData) => {
        try {
            await addDoc(collection(db, 'campaigns'), campaignData);
            setIsLaunchModalOpen(false);
        } catch (error) {
            console.error("Error launching campaign:", error);
        }
    };

    return (
        <div className="growth" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Growth & Campaigns</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Track acquisition initiatives and engagement results.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsLaunchModalOpen(true)}
                        style={{ boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
                    >
                        <Plus size={18} />
                        <span>Launch Campaign</span>
                    </button>
                </div>
            </header>

            {isLaunchModalOpen && <LaunchCampaignModal onClose={() => setIsLaunchModalOpen(false)} onSave={handleLaunchCampaign} />}

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', paddingBottom: '2rem' }}>
                    {campaigns.map(campaign => (
                        <div key={campaign.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--brand-primary)' }}>
                                    <TrendingUp size={20} />
                                </div>
                                <span className="badge" style={{
                                    background: campaign.status === 'Live' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                    color: campaign.status === 'Live' ? 'var(--status-done)' : 'var(--brand-primary)'
                                }}>{campaign.status}</span>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{campaign.name}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Objective: {campaign.objective}</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <Hash size={16} color="var(--brand-primary)" />
                                    {campaign.channel}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <Target size={16} color="var(--brand-secondary)" />
                                    {campaign.kpi}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', gridColumn: 'span 2' }}>
                                    <Calendar size={16} />
                                    {campaign.startDate} - {campaign.endDate || 'TBD'}
                                </div>
                            </div>

                            <div style={{
                                marginTop: '0.5rem',
                                paddingTop: '1.25rem',
                                borderTop: '1px solid var(--border-subtle)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Detailed KPI tracking</span>
                                <button
                                    className="btn btn-outline"
                                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                                    onClick={() => setSelectedCampaign(campaign)}
                                >
                                    View Details <ExternalLink size={12} style={{ marginLeft: '0.25rem' }} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedCampaign && (
                    <CampaignDetailModal
                        campaign={selectedCampaign}
                        onClose={() => setSelectedCampaign(null)}
                        onEdit={(c) => alert(`Editing ${c.name}`)}
                    />
                )}
            </div>
        </div>
    );
};

export default GrowthCampaigns;
