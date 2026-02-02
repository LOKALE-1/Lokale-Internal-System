import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    TrendingUp,
    Users,
    Handshake,
    Cpu,
    Settings,
    ChevronRight,
    UserCircle,
    LogOut,
    Bug,
    Briefcase
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import GlobalReportModal from './GlobalReportModal';

const Sidebar = () => {
    const { user, activeBoard, switchBoard, getAccessibleBoards, logout } = useAuth();
    const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);

    const menuItems = [
        {
            title: 'Dashboard',
            icon: LayoutDashboard,
            path: '/',
            roles: [ROLES.ADMIN]
        },
        {
            title: 'Task Management',
            icon: CheckSquare,
            path: '/tasks',
            roles: [ROLES.ADMIN, ROLES.MARKETING, ROLES.PARTNERSHIPS, ROLES.IT]
        },
        {
            title: 'Project Management',
            icon: Briefcase,
            path: '/projects',
            roles: [ROLES.ADMIN, ROLES.MARKETING, ROLES.PARTNERSHIPS, ROLES.IT]
        },
        {
            title: 'Growth & Campaigns',
            icon: TrendingUp,
            path: '/growth',
            roles: [ROLES.ADMIN, ROLES.MARKETING]
        },
        {
            title: 'Brand Onboarding',
            icon: Users,
            path: '/onboarding',
            roles: [ROLES.ADMIN, ROLES.PARTNERSHIPS]
        },
        {
            title: 'Partnerships',
            icon: Handshake,
            path: '/partnerships',
            roles: [ROLES.ADMIN, ROLES.PARTNERSHIPS]
        },
        {
            title: 'IT / Product Board',
            icon: Cpu,
            path: '/it-board',
            roles: [ROLES.ADMIN, ROLES.IT]
        },
    ];

    if (!user) return null;

    // Filter menu items based on user role
    // Non-founders only see items for their role, Founders see all
    const filteredItems = user.role === ROLES.ADMIN
        ? menuItems.filter(item => item.roles.includes(ROLES.ADMIN))
        : menuItems.filter(item => item.roles.includes(user.role) && item.path !== '/');

    return (
        <aside className="sidebar glass" style={{
            width: '220px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            borderRight: '1px solid var(--border-subtle)',
            zIndex: 100
        }}>
            <div className="logo" style={{ marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>
                <h1 style={{ fontSize: '1.25rem', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', background: 'var(--brand-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>L</div>
                    Lokale OS
                </h1>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.6rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            transition: 'var(--transition)',
                            backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                            fontWeight: isActive ? '600' : '400',
                            fontSize: '0.875rem'
                        })}
                    >
                        <item.icon size={18} />
                        <span style={{ flex: 1 }}>{item.title}</span>
                        <ChevronRight size={14} style={{ opacity: 0.5 }} />
                    </NavLink>
                ))}
            </nav>

            <div className="user-section" style={{
                marginTop: 'auto',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <UserCircle size={28} color="var(--brand-primary)" />
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role}</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        onClick={() => setIsReportModalOpen(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            background: 'rgba(239, 68, 68, 0.05)',
                            color: 'var(--priority-critical)',
                            border: '1px solid rgba(239, 68, 68, 0.1)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'var(--transition)'
                        }}
                    >
                        <Bug size={16} />
                        Report Bug / Feature
                    </button>

                    {user.role === ROLES.ADMIN && (
                        <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.65rem',
                                fontWeight: '700',
                                color: 'var(--text-muted)',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                View Board
                            </label>
                            <select
                                value={activeBoard}
                                onChange={(e) => switchBoard(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    background: 'var(--bg-tertiary)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {getAccessibleBoards().map(board => (
                                    <option key={board.path} value={board.path}>{board.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        onClick={logout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem',
                            color: 'var(--priority-critical)',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            opacity: 0.8,
                            transition: 'var(--transition)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </div>
            {isReportModalOpen && <GlobalReportModal onClose={() => setIsReportModalOpen(false)} />}
        </aside>
    );
};

export default Sidebar;
