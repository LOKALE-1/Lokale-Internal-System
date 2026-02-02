import { ROLES } from '../context/AuthContext';

export const INITIAL_TASKS = [
    {
        id: '1',
        title: 'Finalize TikTok strategy',
        description: 'Complete the Q1 TikTok influencer outreach strategy and budget allocation.',
        dept: ROLES.MARKETING,
        assigned: 'Marketing Lead',
        priority: 'High',
        status: 'In Progress',
        dueDate: '2026-02-01',
        creationDate: '2026-01-20',
        projectId: '1',
        history: [
            { date: '2026-01-20', action: 'Task created', user: 'Founder' },
            { date: '2026-01-22', action: 'Moved to To Do', user: 'Marketing Lead' },
            { date: '2026-01-25', action: 'Moved to In Progress', user: 'Marketing Lead' }
        ]
    },
    {
        id: '2',
        title: 'Fix login button lag',
        description: 'Users reporting 2-3s delay on login button click. Need to optimize the auth request.',
        dept: ROLES.IT,
        assigned: 'Lead Developer',
        priority: 'Critical',
        status: 'To Do',
        dueDate: '2026-01-28',
        creationDate: '2026-01-25',
        projectId: '1',
        history: [
            { date: '2026-01-25', action: 'Task created', user: 'Founder' }
        ]
    },
    {
        id: '3',
        title: 'Onboard Fashion Brand X',
        description: 'Send contract and setup initial store profile for Brand X.',
        dept: ROLES.PARTNERSHIPS,
        assigned: 'Partnerships Lead',
        priority: 'Medium',
        status: 'In Progress',
        dueDate: '2026-02-05',
        creationDate: '2026-01-26',
        projectId: '1',
        history: [
            { date: '2026-01-26', action: 'Task created', user: 'Partnerships Lead' }
        ]
    },
    {
        id: '4',
        title: 'Update internal dashboard CSS',
        description: 'Refine the dashboard aesthetics to match the new brand guidelines.',
        dept: ROLES.ADMIN,
        assigned: 'Founder',
        priority: 'Low',
        status: 'Done',
        dueDate: '2026-01-29',
        creationDate: '2026-01-27',
        projectId: '3',
        history: [
            { date: '2026-01-27', action: 'Task created', user: 'Founder' },
            { date: '2026-01-29', action: 'Moved to Done', user: 'Founder' }
        ]
    },
    {
        id: '5',
        title: 'Q2 Growth Roadmap',
        description: 'Draft the growth roadmap for Q2 focused on user retention.',
        dept: ROLES.PARTNERSHIPS,
        assigned: 'Founder',
        priority: 'Medium',
        status: 'Backlog',
        dueDate: '2026-03-01',
        creationDate: '2026-01-28',
        projectId: null,
        history: [
            { date: '2026-01-28', action: 'Task created', user: 'Founder' }
        ]
    },
    {
        id: '6',
        title: 'App Store Screenshots',
        description: 'Design new screenshots for the latest app features.',
        dept: ROLES.MARKETING,
        assigned: 'Marketing Lead',
        priority: 'Medium',
        status: 'Blocked',
        dueDate: '2026-01-30',
        creationDate: '2026-01-25',
        projectId: '1',
        history: [
            { date: '2026-01-25', action: 'Task created', user: 'Marketing Lead' },
            { date: '2026-01-27', action: 'Moved to Blocked', user: 'Marketing Lead', reason: 'Waiting for design assets' }
        ]
    },
];

export const CAMPAIGNS = [
    {
        id: 1,
        name: 'TikTok Influencer Blitz',
        description: 'Collaborating with 5 major fashion influencers to drive app installs and brand awareness among Gen Z audience.',
        channel: 'TikTok',
        objective: 'App installs',
        status: 'Live',
        startDate: '2026-01-20',
        endDate: '2026-02-15',
        kpi: '5,000 Installs',
        budget: '$2,500',
        spent: '$1,200',
        results: '2,340 Installs achieved so far.'
    },
    {
        id: 2,
        name: 'Brand Awareness Q1',
        description: 'Instagram ad campaign focused on promoting the "Shop Local" value proposition through video storytelling.',
        channel: 'Instagram',
        objective: 'Brand awareness',
        status: 'Planned',
        startDate: '2026-02-01',
        endDate: '2026-03-01',
        kpi: '100k Impressions',
        budget: '$1,500',
        spent: '$0',
        results: 'Campaign pending launch.'
    },
];

export const ONBOARDING = [
    { id: 1, brand: 'Urban Vogue', contact: 'Alice', stage: 'Store created', assigned: 'Growth Guy', category: 'Clothing' },
    { id: 2, brand: 'Eco Essentials', contact: 'Bob', stage: 'Applied', assigned: 'Growth Guy', category: 'Home' },
    { id: 3, brand: 'Tech Trinkets', contact: 'Charlie', stage: 'Approved', assigned: 'Founder', category: 'Electronics' },
];

export const PARTNERSHIPS = [
    { id: 1, name: 'Mega Influencer Y', type: 'Influencer', status: 'Conversation ongoing', owner: 'Growth Guy' },
    { id: 2, name: 'Retail Giant Z', type: 'Big Brand', status: 'Identified', owner: 'Founder' },
];

export const IT_ITEMS = [
    { id: 1, title: 'Database Migration', type: 'Improvement', priority: 'Medium', status: 'Backlog', assigned: 'Dev A' },
    { id: 2, title: 'App Crash on Android 12', type: 'Bug', priority: 'Critical', status: 'Testing', assigned: 'Dev B' },
];

export const PROJECTS = [
    {
        id: '1',
        name: 'App Launch v2.0',
        type: 'Product',
        objective: 'Launch version 2.0 with social commerce features.',
        owner: 'Founder',
        startDate: '2026-03-01',
        endDate: '2026-04-15',
        status: 'Active',
        linkedDepts: [ROLES.IT, ROLES.MARKETING],
        notes: 'Priority 1 for Q1.',
        budget: '$10,000'
    },
    {
        id: '2',
        name: 'Influencer Summit 2026',
        type: 'Event',
        objective: 'Host a networking summit for top 50 influencers.',
        owner: 'Marketing Lead',
        startDate: '2026-05-10',
        endDate: '2026-05-12',
        status: 'Planned',
        linkedDepts: [ROLES.MARKETING],
        notes: 'Venue TBD.',
        budget: '$15,000'
    },
    {
        id: '3',
        name: 'Warehouse Automation',
        type: 'Internal',
        objective: 'Reduce fulfillment time by 30%.',
        owner: 'Ops Manager',
        startDate: '2026-06-01',
        endDate: '2026-08-01',
        status: 'On Hold',
        linkedDepts: [ROLES.ADMIN],
        notes: 'Waiting for vendor quotes.',
        budget: '$5,000'
    }
];
