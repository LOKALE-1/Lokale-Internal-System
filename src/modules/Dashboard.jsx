import React from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import { seedMockData } from '../utils/seedFirebase';
import {
    CheckSquare,
    AlertCircle,
    TrendingUp,
    Users,
    Cpu,
    Clock,
    Briefcase,
    Activity,
    AlertTriangle,
    Calendar as CalendarIcon,
    Database
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="card" style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: `${color}15`,
                color: color
            }}>
                <Icon size={24} />
            </div>
            {subtitle && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</span>}
        </div>
        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{title}</h3>
        <p style={{ fontSize: '1.75rem', fontWeight: '700' }}>{value}</p>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [seeding, setSeeding] = React.useState(false);

    // Live Data States
    const [tasks, setTasks] = React.useState([]);
    const [campaigns, setCampaigns] = React.useState([]);
    const [onboarding, setOnboarding] = React.useState([]);
    const [itItems, setItItems] = React.useState([]);
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // Listeners
    React.useEffect(() => {
        const unsubTasks = onSnapshot(collection(db, 'tasks'), s => setTasks(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const unsubCampaigns = onSnapshot(collection(db, 'campaigns'), s => setCampaigns(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const unsubOnboarding = onSnapshot(collection(db, 'onboarding'), s => setOnboarding(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const unsubIT = onSnapshot(collection(db, 'it_items'), s => setItItems(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const unsubProjects = onSnapshot(collection(db, 'projects'), s => setProjects(s.docs.map(d => ({ id: d.id, ...d.data() }))));

        setLoading(false);
        return () => {
            unsubTasks(); unsubCampaigns(); unsubOnboarding(); unsubIT(); unsubProjects();
        };
    }, []);

    const handleSeed = async () => {
        if (!window.confirm("This will overwrite existing data. Proceed?")) return;
        setSeeding(true);
        const success = await seedMockData();
        setSeeding(false);
        if (success) alert("Database synced successfully!");
    };

    // Calculate Stats from Live Data
    const openTasks = tasks.filter(t => t.status !== 'Done').length;
    const overdueTasks = tasks.filter(t => t.status !== 'Done' && new Date(t.dueDate) < new Date()).length;
    const activeCampaigns = campaigns.filter(c => c.status === 'Live').length;
    const onboardingBrands = onboarding.length;
    const criticalIT = itItems.filter(i => i.priority === 'Critical' && i.status !== 'Live').length;
    const activeProjects = projects.filter(p => p.status === 'Active').length;

    const projectsWithOverdue = projects.filter(p => {
        const projectTasks = tasks.filter(t => t.projectId === p.id);
        return projectTasks.some(t => t.status !== 'Done' && new Date(t.dueDate) < new Date());
    }).length;

    const upcomingDeadlines = projects.filter(p => {
        const diff = new Date(p.endDate) - new Date();
        return diff > 0 && diff < (14 * 24 * 60 * 60 * 1000); // 14 days
    }).length;

    if (loading) return <div style={{ padding: '2rem' }}>Loading operations data...</div>;

    return (
        <div className="dashboard" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
            <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Founder Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time overview of Lokale's operations and growth.</p>
                </div>
                {user?.role === ROLES.ADMIN && (
                    <button
                        onClick={handleSeed}
                        disabled={seeding}
                        className="btn btn-primary"
                        style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--brand-primary)', border: '1px solid rgba(99, 102, 241, 0.2)' }}
                    >
                        <Database size={18} /> {seeding ? "Syncing..." : "Sync Database"}
                    </button>
                )}
            </header>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <StatCard title="Open Tasks" value={openTasks} icon={CheckSquare} color="var(--brand-primary)" subtitle="Across teams" />
                <StatCard title="Overdue Tasks" value={overdueTasks} icon={Clock} color="var(--priority-critical)" subtitle="Needs attention" />
                <StatCard title="Active Campaigns" value={activeCampaigns} icon={TrendingUp} color="var(--brand-accent)" subtitle="Growth phase" />
                <StatCard title="Brands Onboarding" value={onboardingBrands} icon={Users} color="var(--brand-secondary)" subtitle="Pipeline" />
                <StatCard title="Critical IT Issues" value={criticalIT} icon={AlertCircle} color="var(--priority-high)" subtitle="System stability" />
                <StatCard title="Active Initiatives" value={activeProjects} icon={Briefcase} color="var(--brand-primary)" subtitle={`${projectsWithOverdue} at risk`} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={20} color="var(--priority-high)" /> Attention Required
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {tasks.filter(t => t.priority === 'Critical' || (t.status !== 'Done' && new Date(t.dueDate) < new Date())).map(task => (
                            <div key={task.id} style={{
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--bg-tertiary)',
                                borderLeft: `4px solid ${task.priority === 'Critical' ? 'var(--priority-critical)' : 'var(--priority-medium)'}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{task.title}</span>
                                    <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--priority-critical)' }}>{task.status}</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Assigned to: {task.assigned} • Due: {task.dueDate}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Growth Snapshot</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {campaigns.map(campaign => (
                            <div key={campaign.id} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{campaign.name}</span>
                                    <span className="badge" style={{
                                        background: campaign.status === 'Live' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                        color: campaign.status === 'Live' ? 'var(--status-done)' : 'var(--brand-primary)'
                                    }}>{campaign.status}</span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{campaign.channel} • {campaign.objective}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={20} color="var(--brand-primary)" /> Project Lifecycle Overview
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <span style={{ color: 'var(--priority-critical)' }}>●</span> {projectsWithOverdue} At Risk
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <span style={{ color: 'var(--brand-secondary)' }}>●</span> {upcomingDeadlines} Impending Deadlines
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                        {projects.map(project => {
                            const pTasks = tasks.filter(t => t.projectId === project.id);
                            const progress = pTasks.length === 0 ? 0 : Math.round((pTasks.filter(t => t.status === 'Done').length / pTasks.length) * 100);
                            const overdueCount = pTasks.filter(t => t.status !== 'Done' && new Date(t.dueDate) < new Date()).length;

                            return (
                                <div key={project.id} style={{
                                    padding: '1.25rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-tertiary)',
                                    border: overdueCount > 0 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid transparent'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{project.type}</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{project.name}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: progress === 100 ? 'var(--status-done)' : 'var(--brand-primary)' }}>{progress}%</div>
                                            {overdueCount > 0 && <div style={{ fontSize: '0.65rem', color: 'var(--priority-critical)' }}>{overdueCount} Overdue</div>}
                                        </div>
                                    </div>
                                    <div style={{ height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--brand-primary)' }}></div>
                                    </div>
                                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Owner: {project.owner}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>Ends: {project.endDate}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
