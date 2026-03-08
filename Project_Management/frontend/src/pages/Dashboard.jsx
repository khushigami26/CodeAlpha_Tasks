import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import {
    LayoutGrid,
    MoreHorizontal,
    Plus,
    X,
    Layout as LayoutIcon,
    CheckCircle2,
    Link as LinkIcon,
    ChevronRight,
    Search as SearchIcon,
    Star,
    Users,
    Filter,
    Share2,
    Activity,
    Tag,
    CheckSquare,
    Clock,
    Paperclip,
    ChevronDown,
    Trash2,
    Pencil,
    Rocket,
    Search,
    Briefcase,
    PenTool,
    GraduationCap,
    Monitor,
    Globe,
    Download,
    Layers,
    User as UserIcon,
    Bug,
    MessageSquare
} from 'lucide-react';

const Dashboard = ({ activeTab = 'boards' }) => {
    const [projects, setProjects] = useState([]);
    const [projectName, setProjectName] = useState('');
    const [selectedBackground, setSelectedBackground] = useState('bg-[#f0f9ff]');
    const [showModal, setShowModal] = useState(false);
    const [selectedTemplateCategory, setSelectedTemplateCategory] = useState(null);
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [exportFormat, setExportFormat] = useState('json');
    const [allUsers, setAllUsers] = useState([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteQuery, setInviteQuery] = useState('');
    const [invitedUsers, setInvitedUsers] = useState([]);
    const [workspaceMembers, setWorkspaceMembers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [workspaceSettings, setWorkspaceSettings] = useState({
        visibility: 'Private',
        membership: 'Flexible',
        creation: 'Open',
        deletion: 'Restricted',
        aiEnabled: true
    });
    const [editingProject, setEditingProject] = useState(null);
    const [membersTab, setMembersTab] = useState('members'); // 'members', 'guests', 'requests'
    const [joinRequests, setJoinRequests] = useState([]);
    const socketRef = useRef(null);
    const { user, loading } = useContext(AuthContext);

    const fetchProjects = async () => {
        try {
            const { data } = await API.get('/projects');
            setProjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects([]);
        }
    };

    const fetchSentInvitations = async () => {
        try {
            const { data } = await API.get('/notifications/sent');
            setInvitedUsers(data.map(n => n.user.toString()));
        } catch (error) {
            console.error('Error fetching sent invitations:', error);
        }
    };

    const fetchJoinRequests = async () => {
        try {
            const { data } = await API.get('/notifications');
            setJoinRequests(data.filter(n => n.type === 'invite'));
        } catch (error) {
            console.error('Error fetching join requests:', error);
        }
    };

    const fetchActivities = async () => {
        try {
            const { data } = await API.get('/activity');
            setActivities(data);
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await API.get('/auth/users');
            setAllUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        if (user && !socketRef.current) {
            const socket = io('http://localhost:5000');
            socketRef.current = socket;

            socket.on('activityAdded', () => {
                console.log('Real-time update: Activity or member changed');
                fetchProjects();
                if (activeTab === 'activity') fetchActivities();
                if (activeTab === 'members') {
                    fetchUsers();
                    fetchJoinRequests();
                    fetchSentInvitations();
                }
            });

            socket.on('new-notification', (data) => {
                if (data.user === user._id) {
                    fetchJoinRequests();
                }
            });
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user, activeTab]);

    const { showConfirm } = useUI();
    const navigate = useNavigate();


    useEffect(() => {
        if (projects.length > 0) {
            let uniqueMembers = [];
            let memberIds = [];
            const currentUserId = user?._id || user?.id;
            let currentUserIdStr = "";
            if (currentUserId) {
                currentUserIdStr = currentUserId.toString();
            }

            for (let i = 0; i < projects.length; i++) {
                let p = projects[i];

                let ownerIdStr = "";
                if (p.owner) {
                    ownerIdStr = (p.owner._id || p.owner).toString();
                }

                if (ownerIdStr !== "" && ownerIdStr !== currentUserIdStr) {
                    if (!memberIds.includes(ownerIdStr)) {
                        uniqueMembers.push(p.owner);
                        memberIds.push(ownerIdStr);
                    }
                }

                if (p.members) {
                    for (let j = 0; j < p.members.length; j++) {
                        let m = p.members[j];

                        let memberIdStr = "";
                        if (m) {
                            memberIdStr = (m._id || m).toString();
                        }

                        if (memberIdStr !== "" && memberIdStr !== currentUserIdStr) {
                            if (!memberIds.includes(memberIdStr)) {
                                uniqueMembers.push(m);
                                memberIds.push(memberIdStr);
                            }
                        }
                    }
                }
            }
            setWorkspaceMembers(uniqueMembers);
        } else {
            setWorkspaceMembers([]);
        }
    }, [projects, user]);

    useEffect(() => {
        if (!loading && user) {
            fetchProjects();
            if (activeTab === 'members') {
                fetchUsers();
                fetchJoinRequests();
                fetchSentInvitations();
            }
            if (activeTab === 'activity') {
                fetchActivities();
            }
        }
    }, [user, loading, activeTab]);


    if (loading) return (
        <div className="flex items-center justify-center min-h-full">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!user) return null;

    const handleCreateProject = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading(editingProject ? 'Updating board...' : 'Creating board...');
        try {
            if (editingProject) {
                await API.put(`/projects/${editingProject._id}`, {
                    name: projectName,
                    background: selectedBackground
                });
            } else {
                await API.post('/projects', {
                    name: projectName,
                    background: selectedBackground
                });
            }
            setProjectName('');
            setSelectedBackground('bg-[#f0f9ff]');
            setEditingProject(null);
            setShowModal(false);
            setPreviewTemplate(null);
            fetchProjects();
            toast.success(editingProject ? 'Board updated!' : 'Board added successfully!', { id: loadingToast });
        } catch {
            toast.error(editingProject ? 'Failed to update board.' : 'Failed to create board.', { id: loadingToast });
        }
    };

    const handleUseTemplate = (template) => {
        toast.success(`Applying ${template.title}...`);
        setPreviewTemplate(null);
        setProjectName(template.title);
        setSelectedBackground(`bg-[url('${template.img}')] bg-cover bg-center text-white`);
        setShowModal(true);
    };

    const handleDeleteProject = async (projectId) => {
        const loadingToast = toast.loading('Deleting board...');
        try {
            await API.delete(`/projects/${projectId}`);
            fetchProjects();
            toast.success('Board deleted successfully!', { id: loadingToast });
        } catch {
            toast.error('Failed to delete board.', { id: loadingToast });
        }
    };



    const handleInviteUser = async (targetUser) => {
        const loadingToast = toast.loading(`Inviting ${targetUser.name}...`);
        try {
            await API.post('/projects/invite', { userId: targetUser._id });
            setInvitedUsers(prev => [...prev, targetUser._id.toString()]);
            toast.success(`Invitation sent to ${targetUser.name}!`, { id: loadingToast });
            fetchSentInvitations();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send invite', { id: loadingToast });
        }
    };

    const handleAcceptInvite = async (request) => {
        const loadingToast = toast.loading('Accepting invitation...');
        try {
            await API.post(`/notifications/${request._id}/accept`);
            toast.success('Invitation accepted!', { id: loadingToast });
            fetchJoinRequests();
            fetchProjects();
        } catch {
            toast.error('Failed to accept invitation.', { id: loadingToast });
        }
    };

    const handleDeclineInvite = async (request) => {
        const loadingToast = toast.loading('Declining invitation...');
        try {
            await API.post(`/notifications/${request._id}/decline`);
            toast.success('Invitation declined.', { id: loadingToast });
            fetchJoinRequests();
        } catch {
            toast.error('Failed to decline invitation.', { id: loadingToast });
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm('Are you sure you want to remove this member from your workspace? They will lose access to all your boards.')) return;

        const loadingToast = toast.loading('Removing member...');
        try {
            await API.delete(`/projects/member/${memberId}`);
            toast.success('Member removed successfully', { id: loadingToast });
            setInvitedUsers(prev => prev.filter(id => id !== memberId));
            fetchProjects();
        } catch {
            toast.error('Failed to remove member', { id: loadingToast });
        }
    };

    const toggleSetting = (key) => {
        setWorkspaceSettings(prev => ({ ...prev, [key]: !prev[key] }));
        toast.success('Setting updated!');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'home': {
                return (
                    <div className="p-10 max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center min-h-full transition-all animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex-1 space-y-8">
                            <div className="w-full h-80 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center border border-indigo-100 shadow-sm overflow-hidden relative group">
                                <img
                                    src="https://images.unsplash.com/photo-1542621334-a254cf47733d?auto=format&fit=crop&w=800&q=80"
                                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                    alt="Collage"
                                />
                                <div className="absolute inset-0 bg-blue-600/10 mix-blend-multiply"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent"></div>
                            </div>
                            <div className="text-center space-y-4">
                                <h1 className="text-2xl font-bold text-[#172b4d] dark:text-[#b6c2cf]">Organize anything</h1>
                                <p className="text-[#44546f] dark:text-[#9fadbc] max-w-md mx-auto leading-relaxed">
                                    Put everything in one place and start moving things forward with your first ProjectX board!
                                </p>
                                <div className="flex flex-col items-center gap-3 pt-4">
                                    <button
                                        onClick={() => navigate('/boards')}
                                        className="bg-[#0c66e4] text-white font-bold py-2.5 px-8 rounded hover:bg-[#0055cc] transition-all transform active:scale-95 shadow-md flex items-center gap-2"
                                    >
                                        Create a Workspace board
                                    </button>
                                    <button className="text-[#44546f] text-sm hover:underline font-medium">Got it! Dismiss this.</button>
                                </div>
                            </div>
                        </div>

                        <div className="w-72 space-y-8 shrink-0">
                            <div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-[#44546f] mb-4 uppercase tracking-wider">
                                    <Clock size={16} /> Recently viewed
                                </div>
                                <div className="space-y-3">
                                    {projects.slice(0, 3).map(p => (
                                        <div key={p._id} className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-[#333c44] rounded-lg cursor-pointer transition-all border border-transparent hover:border-[#dfe1e6] dark:hover:border-[#5794f7]" onClick={() => navigate(`/card/${p._id}`)}>
                                            <div className={`w-10 h-10 rounded shadow-sm ${p.background || 'bg-gradient-to-r from-blue-400 to-indigo-400'}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-[#172b4d] dark:text-[#b6c2cf] truncate">{p.name}</div>
                                                <div className="text-xs text-[#44546f] dark:text-[#9fadbc]">ProjectX Workspace</div>
                                            </div>
                                        </div>
                                    ))}
                                    {!projects.length && (
                                        <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center font-medium text-xs text-gray-400">
                                            No boards viewed yet
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold text-[#44546f] mb-4 uppercase tracking-widest">Links</div>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="flex items-center gap-3 w-full p-2.5 hover:bg-gray-100 dark:hover:bg-[#333c44] rounded-lg text-sm text-[#172b4d] dark:text-[#b6c2cf] font-semibold transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#161a1d] flex items-center justify-center text-gray-500 dark:text-[#9fadbc] group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        <Plus size={20} />
                                    </div>
                                    Create new board
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }

            case 'templates': {
                const categories = [
                    { name: 'Business', icon: Briefcase, color: 'bg-indigo-50 text-indigo-600 border-indigo-100', iconColor: '#4c9aff' },
                    { name: 'Design', icon: PenTool, color: 'bg-rose-50 text-rose-600 border-rose-100', iconColor: '#ff7452' },
                    { name: 'Education', icon: GraduationCap, color: 'bg-amber-50 text-amber-600 border-amber-100', iconColor: '#f2994a' },
                    { name: 'Engineering', icon: Monitor, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', iconColor: '#00b8d9' },
                    { name: 'Marketing', icon: Rocket, color: 'bg-cyan-50 text-cyan-600 border-cyan-100', iconColor: '#5243aa' },
                    { name: 'Remote Work', icon: Globe, color: 'bg-blue-50 text-blue-600 border-blue-100', iconColor: '#0c66e4' },
                ];

                const templatesData = {
                    'Remote Work': [
                        { title: 'Mr. Rogers: "Watercooler" Video Chat Planner', creator: 'ProjextX Team', desc: 'A simple way to build team culture.', users: '2.5K', views: '32K', img: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=tw1' },
                        { title: 'Remote Team Meetings', creator: 'ProjextX Team', desc: 'Bring focus and transparency to your remote team meetings.', users: '76.8K', views: '152.4K', img: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=tw2' },
                        { title: 'Distributed Team Brainstorming', creator: 'ProjextX Team', desc: 'A better way to brainstorm with your remote team.', users: '10K', views: '63.8K', img: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=tw3' },
                        { title: 'Remote Team Bonding Template', creator: 'ProjextX Team', desc: 'Create a space for your team to share experiences for remote activities.', users: '3.5K', views: '35.7K', img: 'https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=tw4' },
                    ],
                    'Education': [
                        { title: 'Project Based Learning', creator: 'Michael Burke, Educator', desc: 'A key aspect of organizing projects is creating a timeline, responsibilities, and checklists.', users: '29.4K', views: '195.5K', img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=michael' },
                        { title: 'Plan your Studies - Vet Student', creator: 'Becky Lossing, Veterinarian', desc: 'A template to help vet students conquer clinics and beyond!', users: '12.7K', views: '49.8K', img: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=becky' },
                        { title: 'Learn A Language', creator: 'Luis von Ahn, CEO @ Duolingo', desc: 'Learn a language by breaking up your study into small, achievable tasks.', users: '39.2K', views: '172.5K', img: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=100', logo: 'https://raw.githubusercontent.com/lucide-react/lucide/main/icons/languages.svg' },
                        { title: 'Montessori Inspired Planning', creator: 'Bee, owner @ Puff Apothecary', desc: 'Prepare for your home to become a Montessori inspired space.', users: '7.4K', views: '41.8K', img: 'https://images.unsplash.com/photo-1560785477-d43d2b43e0a5?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=bee' },
                        { title: 'Certification Prep Board', creator: 'Marie Kent from ProjextX', desc: 'Prepare and manage your workload for Atlassian University courses!', users: '2.7K', views: '8.4K', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=marie' },
                        { title: 'Academic Publishing Tracker', creator: 'Ann Gillian Chu, PhD Researcher', desc: 'Keep track of where and when you have submitted an article and celebrate your wins!', users: '23.9K', views: '91.4K', img: 'https://images.unsplash.com/photo-1456513083981-9b5bd1ceba07?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=ann' },
                    ],
                    'Business': [
                        { title: 'Nonprofit Volunteer Onboarding', creator: 'Atlassian', desc: 'Use this nonprofit staffing and volunteer scheduling template to keep everyone on the same page.', users: '310', views: '2.1K', img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=atlassian' },
                        { title: 'Align Your Team With V2MOM', creator: 'Salesforce Essentials', desc: "Get everyone in your organization in sync, whether you're a small business or a global company.", users: '26.6K', views: '127.5K', img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=salesforce' },
                        { title: 'Business Model Canvas', creator: 'Oshane Bailey', desc: 'Develop new or document existing business models.', users: '25.2K', views: '117.6K', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=oshane' },
                        { title: 'Business Plan', creator: 'Jon, Founder @ Mountain17', desc: 'Create a strong business plan and collaborate with others throughout the process.', users: '44.7K', views: '175.5K', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=jon' },
                        { title: 'Change Management Workflow', creator: 'Robyn de Burgh', desc: 'Manage the change workflow for your business.', users: '7.3K', views: '57K', img: 'https://images.unsplash.com/photo-1507679622114-c10ba35c24e0?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=robyn' },
                        { title: 'Company Overview', creator: 'Michael Pryor, Head of Product @ ProjextX', desc: "Get everybody on the same page with a high-level overview of what's going on across the organization.", users: '173.1K', views: '437.6K', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=pryor' },
                    ],
                    'Engineering': [
                        { title: 'Agile Sprint Board', creator: 'ProjextX Engineering Team', desc: "Move fast without losing sight by adopting ProjextX's agile workflow template.", users: '125.3K', views: '412K', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=projextx' },
                        { title: 'Bug Tracker', creator: 'Robin, Founder @ Blue Cat Reports', desc: 'Streamline your bug reporting and tracking with this easy to use template.', users: '5.5K', views: '17.9K', img: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=robin' },
                        { title: 'Kanban Dev Board', creator: 'Robin Warren, Founder @ Cherry Wood', desc: 'For software development teams following a Kanban process + best practices.', users: '7.5K', views: '43K', img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=robinw' },
                        { title: 'Android Developer Roadmap', creator: 'Ahmed Adel, Senior SE @ Zendesk', desc: 'A study guide for developing on Android.', users: '6.1K', views: '33.6K', img: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=ahmed' },
                        { title: 'Game Development', creator: 'Alt F4', desc: 'This is a template designed to help game developers organise their ideas and progress.', users: '12.1K', views: '41.7K', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=altf4' },
                        { title: 'Innovation Weeks', creator: 'ProjextX Engineering Team', desc: 'Innovation Weeks are extended periods of time set aside to encourage innovation in products.', users: '10.3K', views: '39.1K', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=projextx2' },
                    ],
                    'Design': [
                        { title: 'Game Design Template', creator: 'Chris McCrimmons, Cinevva', desc: 'Easy-to-organize template for planning a video game project.', users: '23.7K', views: '104.3K', img: 'https://images.unsplash.com/photo-1561070791368-74c07d391f1b?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=chris' },
                        { title: 'Portfolio - Step by Step', creator: 'Utsav Sheth, UI/UX Designer', desc: 'This template is for beginners who want to make a portfolio for their next job.', users: '10.3K', views: '54.4K', img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=utsav' },
                        { title: 'Research Iteration', creator: 'Jessica Crabb, Product Designer', desc: 'Set-up your user research plan from start to finish!', users: '13.9K', views: '102.9K', img: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=jessica' },
                        { title: 'Design Sprint', creator: 'ProjextX Design Team', desc: 'Use this design sprint template to ideate on early concepts and test ideas with customers.', users: '26.2K', views: '222.1K', img: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=projextxdesign' },
                        { title: 'Artist Commissions', creator: 'Joey Myers Design', desc: 'This board is for creative professionals who need a simple but effective workflow for client work.', users: '7K', views: '34K', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=joey' },
                        { title: 'Character Setup', creator: 'Pearl, Writer', desc: 'A template for writers to setup the characters of your stories in order.', users: '5.1K', views: '21.9K', img: 'https://images.unsplash.com/photo-1602620830347-523f36889abb?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=pearl' },
                    ],
                    'Marketing': [
                        { title: 'Podcast Workflow Template', creator: 'Ryan Spilken, Evangelist', desc: 'The one-stop-shop for managing your podcast production workflow.', users: '7.4K', views: '32.3K', img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=ryan' },
                        { title: 'Blog Content Schedule', creator: 'Scan2CAD', desc: 'A scheduled pipeline of all upcoming and published content for your blog.', users: '38.9K', views: '150.1K', img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=scan2' },
                        { title: 'Marketing Requests', creator: 'Chad Reid, VP @ JotForm', desc: 'This board is a collaboration board between marketing and growth teams.', users: '14.K', views: '60.6K', img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=chad' },
                        { title: 'Website Task Planner', creator: 'Pauline Wiles, Founder', desc: "10 Phases you'll need to plan, design, create, test, and launch a professional website.", users: '15.2K', views: '62.7K', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=pauline' },
                        { title: 'SEO Content Creation', creator: 'R.J. Weiss, Founder', desc: 'Get your content production down to a science with SEO in mind.', users: '8.5K', views: '47.3K', img: 'https://images.unsplash.com/photo-1432888117246-cdfd37218d10?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=rjweiss' },
                        { title: 'Inbound Marketing Campaign', creator: 'Delilah Osborne, Director', desc: 'Get a full view of contents and assets when working on multiple integrated campaigns.', users: '14.8K', views: '66.6K', img: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800&q=100', avatar: 'https://i.pravatar.cc/100?u=delilah' },
                    ]
                };

                return (
                    <div className="p-10 max-w-7xl mx-auto space-y-12 transition-all animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-[#172b4d] dark:text-[#b6c2cf] tracking-tight flex items-center gap-4">
                                {selectedTemplateCategory ? (
                                    <>
                                        <div className={`p-4 rounded-2xl ${categories.find(c => c.name === selectedTemplateCategory)?.color} shadow-lg shadow-black/5`}>
                                            {React.createElement(categories.find(c => c.name === selectedTemplateCategory)?.icon || LayoutIcon, { size: 32 })}
                                        </div>
                                        {selectedTemplateCategory} templates
                                    </>
                                ) : (
                                    'Professional Templates'
                                )}
                            </h1>
                            <p className="text-[#44546f] dark:text-[#9fadbc] text-lg font-medium">Get a head start with battle-tested workflows and structures.</p>
                        </div>
                        <div className="flex gap-4">
                            {selectedTemplateCategory && (
                                <button
                                    onClick={() => setSelectedTemplateCategory(null)}
                                    className="px-6 py-3 bg-gray-100 dark:bg-[#161a1d] hover:bg-gray-200 dark:hover:bg-[#333c44] rounded-2xl text-sm font-black text-[#44546f] dark:text-[#b6c2cf] transition-all flex items-center gap-2"
                                >
                                    <X size={18} /> Exit Category
                                </button>
                            )}
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0c66e4] transition-colors" size={20} />
                                <input type="text" placeholder="Find a template..." className="pl-12 pr-6 py-3.5 bg-white dark:bg-[#161a1d] border-2 border-[#dfe1e6] dark:border-[#333c44] rounded-2xl text-sm focus:border-[#0c66e4] outline-none transition-all w-80 shadow-sm" />
                            </div>
                        </div>

                        {
                            !selectedTemplateCategory ? (
                                <div className="space-y-12">
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                                        {categories.map((cat) => (
                                            <div
                                                key={cat.name}
                                                onClick={() => setSelectedTemplateCategory(cat.name)}
                                                className="flex flex-col items-center gap-4 group cursor-pointer"
                                            >
                                                <div className={`w-full max-w-[120px] aspect-square rounded-3xl ${cat.color} flex items-center justify-center border-2 border-transparent group-hover:border-current shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300`}>
                                                    <cat.icon size={44} strokeWidth={1.5} />
                                                </div>
                                                <span className="text-sm font-black text-[#172b4d] dark:text-[#b6c2cf] group-hover:text-[#0c66e4] transition-colors uppercase tracking-widest text-center mt-1">{cat.name}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-10">
                                        <h2 className="text-2xl font-black text-[#172b4d] dark:text-[#b6c2cf] flex items-center gap-4">
                                            <Star className="text-amber-400 fill-amber-400" size={24} />
                                            Popular for Education
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6">
                                            {templatesData['Education'].slice(0, 3).map((t, i) => (
                                                <div key={i} onClick={() => setPreviewTemplate(t)} className="bg-white dark:bg-[#1d2125] rounded-2xl overflow-hidden hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer border border-[#dfe1e6] dark:border-[#333c44] flex flex-col group">
                                                    <div className={`h-36 relative shrink-0 overflow-hidden ${t.color || 'bg-gray-100'}`}>
                                                        {t.img && <img src={t.img} onError={(e) => { e.target.onerror = null; e.target.src = `https://picsum.photos/seed/${encodeURIComponent(t.title)}/800/400` }} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={t.title} />}
                                                        <div className="absolute -bottom-5 left-5 p-1 bg-white dark:bg-[#1d2125] rounded-full shadow-lg">
                                                            <img src={t.avatar || t.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.creator)}&background=random`} onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=User" }} className="w-10 h-10 rounded-full border-2 border-white dark:border-[#333c44] object-cover" alt={t.creator} />
                                                        </div>
                                                    </div>
                                                    <div className="p-6 pt-8 space-y-3 flex-1 flex flex-col">
                                                        <div className="text-lg font-black text-[#172b4d] dark:text-[#b6c2cf] group-hover:text-[#0c66e4] transition-colors leading-tight">{t.title}</div>
                                                        <div className="text-[11px] font-bold text-[#44546f] dark:text-[#9fadbc]">by {t.creator}</div>
                                                        <p className="text-xs text-[#44546f] dark:text-[#9fadbc] font-medium line-clamp-2 leading-relaxed flex-1">
                                                            {t.desc}
                                                        </p>
                                                        <div className="flex items-center gap-5 pt-3 text-[9px] font-black text-[#44546f] dark:text-[#9fadbc] uppercase tracking-widest">
                                                            <span className="flex items-center gap-1.5"><Download size={10} strokeWidth={2.5} /> {t.users}</span>
                                                            <span className="flex items-center gap-1.5"><Globe size={10} strokeWidth={2.5} /> {t.views}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10">
                                    {(templatesData[selectedTemplateCategory] || []).map((t, i) => (
                                        <div key={i} onClick={() => setPreviewTemplate(t)} className="bg-white dark:bg-[#1d2125] rounded-3xl overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer border border-[#dfe1e6] dark:border-[#333c44] flex flex-col group animate-in fade-in zoom-in-95 duration-500">
                                            <div className={`h-48 relative shrink-0 overflow-hidden ${t.color || 'bg-gray-100'}`}>
                                                {t.img && <img src={t.img} onError={(e) => { e.target.onerror = null; e.target.src = `https://picsum.photos/seed/${encodeURIComponent(t.title)}/800/400` }} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={t.title} />}
                                                <div className="absolute -bottom-6 left-6 p-1 bg-white dark:bg-[#1d2125] rounded-full shadow-xl">
                                                    <img src={t.avatar || t.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.creator)}&background=random`} onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=User" }} className="w-12 h-12 rounded-full border-2 border-white dark:border-[#333c44] object-cover" alt={t.creator} />
                                                </div>
                                            </div>
                                            <div className="p-8 pt-10 space-y-4 flex-1 flex flex-col">
                                                <div className="text-xl font-black text-[#172b4d] dark:text-[#b6c2cf] group-hover:text-[#0c66e4] transition-colors leading-tight">{t.title}</div>
                                                <div className="text-xs font-bold text-[#44546f] dark:text-[#9fadbc]">by {t.creator}</div>
                                                <p className="text-sm text-[#44546f] dark:text-[#9fadbc] font-medium line-clamp-2 leading-relaxed flex-1">
                                                    {t.desc}
                                                </p>
                                                <div className="flex items-center gap-6 pt-4 text-[10px] font-black text-[#44546f] dark:text-[#9fadbc] uppercase tracking-widest">
                                                    <span className="flex items-center gap-2"><Download size={12} strokeWidth={2.5} /> {t.users}</span>
                                                    <span className="flex items-center gap-2"><Globe size={12} strokeWidth={2.5} /> {t.views}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>
                );
            }

            case 'activity': {
                return (
                    <div className="p-10 max-w-5xl mx-auto space-y-12 transition-all animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <h1 className="text-3xl font-black text-[#172b4d] dark:text-[#b6c2cf] tracking-tight">Recent Activity</h1>
                            <p className="text-[#44546f] dark:text-[#9fadbc] text-base font-medium max-w-lg leading-relaxed">Stay updated with everything happening across your Workspace.</p>
                        </div>

                        <div className="space-y-6">
                            {activities.length > 0 ? activities.map((a, i) => (
                                <div key={i} className="flex gap-6 p-6 bg-white dark:bg-[#1d2125] border-2 border-[#f1f2f4] dark:border-[#333c44] rounded-3xl hover:border-[#0c66e4] transition-all group shadow-sm">
                                    <div className="w-14 h-14 rounded-2xl bg-[#0c66e4] text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0 group-hover:rotate-6 transition-transform">
                                        {a.user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="space-y-2 flex-1 pt-1">
                                        <div className="text-lg leading-relaxed dark:text-[#b6c2cf]">
                                            <span className="font-black text-[#172b4d] dark:text-[#b6c2cf]">{a.user?.name}</span>
                                            <span className="text-[#44546f] dark:text-[#9fadbc] ml-2">
                                                {a.action} {a.type}
                                            </span>
                                            <span className="font-black text-[#0c66e4] dark:text-[#5794f7] ml-2 group-hover:underline cursor-pointer">
                                                {a.entityTitle}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-bold text-[#44546f] dark:text-[#9fadbc] uppercase tracking-widest opacity-60">
                                            <span className="flex items-center gap-2"><Clock size={12} /> {new Date(a.createdAt).toLocaleString()}</span>
                                            {a.project && <span className="flex items-center gap-2">• on board {a.project.name}</span>}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 flex flex-col items-center justify-center bg-gray-50 border-4 border-dashed border-gray-200 rounded-3xl gap-6 opacity-30">
                                    <Clock size={80} strokeWidth={1} />
                                    <div className="text-center">
                                        <div className="text-xl font-black mb-2">No activity recorded yet</div>
                                        <div className="text-sm font-bold">Try creating a board or adding some cards!</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            }

            case 'members': {
                return (
                    <div className="p-10 max-w-5xl mx-auto space-y-12 transition-all animate-in fade-in duration-300">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-4">
                                <h1 className="text-3xl font-black text-[#172b4d] dark:text-[#b6c2cf] tracking-tight">Collaborators</h1>
                                <p className="text-[#44546f] dark:text-[#9fadbc] text-base font-medium max-w-lg leading-relaxed">Workspace members can view and join all Workspace visible boards.</p>
                            </div>
                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="bg-[#0c66e4] text-white font-black py-4 px-8 rounded-xl shadow-[0_8px_20px_rgba(12,102,228,0.3)] text-sm hover:bg-[#0055cc] transition-all active:scale-95 uppercase tracking-widest"
                            >
                                Invite members
                            </button>
                        </div>

                        <div className="border-b-2 border-[#f1f2f4] dark:border-[#333c44]">
                            <div className="flex gap-10">
                                <button
                                    onClick={() => setMembersTab('members')}
                                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${membersTab === 'members' ? 'border-b-4 border-[#0c66e4] text-[#0c66e4]' : 'text-[#44546f] dark:text-[#9fadbc] hover:text-[#172b4d] opacity-50'}`}
                                >
                                    Members ({allUsers.length + 1})
                                </button>
                                <button
                                    onClick={() => setMembersTab('guests')}
                                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${membersTab === 'guests' ? 'border-b-4 border-[#0c66e4] text-[#0c66e4]' : 'text-[#44546f] dark:text-[#9fadbc] hover:text-[#172b4d] opacity-50'}`}
                                >
                                    Guests (0)
                                </button>
                                <button
                                    onClick={() => setMembersTab('requests')}
                                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${membersTab === 'requests' ? 'border-b-4 border-[#0c66e4] text-[#0c66e4]' : 'text-[#44546f] dark:text-[#9fadbc] hover:text-[#172b4d] opacity-50'}`}
                                >
                                    Join requests ({joinRequests.length})
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {membersTab === 'members' && (
                                <>
                                    {/* Current User */}
                                    <div className="bg-white dark:bg-[#1d2125] p-6 rounded-2xl flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-2 border-[#f1f2f4] dark:border-[#333c44] hover:shadow-lg transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-[#0c66e4] text-white flex items-center justify-center font-black text-2xl shadow-xl">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="font-black text-[#172b4d] dark:text-[#b6c2cf] text-lg">{user?.name} (You)</div>
                                                <div className="text-sm font-bold text-[#44546f] dark:text-[#9fadbc]">Admin</div>
                                            </div>
                                        </div>
                                        <div className="bg-[#f4f5f7] dark:bg-[#161a1d] px-6 py-2.5 rounded-xl text-sm font-black text-[#172b4d] dark:text-[#b6c2cf] border border-[#dfe1e6] dark:border-[#333c44]">Workspace Admin</div>
                                    </div>

                                    {/* Workspace Members */}
                                    {workspaceMembers.length > 0 && (
                                        <div className="space-y-6">
                                            <div className="text-xs font-black text-[#44546f] dark:text-[#9fadbc] uppercase tracking-widest pl-2">Joined Workspace Members ({workspaceMembers.length})</div>
                                            {workspaceMembers.map(m => (
                                                <div key={(m._id || m)?.toString()} className="bg-white dark:bg-[#1d2125] p-6 rounded-2xl flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-2 border-[#f1f2f4] dark:border-[#333c44] hover:shadow-xl transition-all group border-l-8 border-l-[#4bce97]">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 rounded-2xl bg-[#4bce97] text-white flex items-center justify-center font-black text-2xl shadow-lg">
                                                            {m.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="font-black text-[#172b4d] dark:text-[#b6c2cf] text-lg">{m.name}</div>
                                                            <div className="flex gap-2">
                                                                <div className="text-xs font-black bg-emerald-50 dark:bg-emerald-900/20 text-[#22a06b] px-2 py-1 rounded inline-block">Member</div>
                                                                {projects.some(p => (p.owner?._id || p.owner)?.toString() === (m._id || m)?.toString()) && (
                                                                    <div className="text-xs font-black bg-blue-50 dark:bg-blue-900/20 text-[#0c66e4] px-2 py-1 rounded inline-block">Owner</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {projects.some(p =>
                                                        ((p.owner?._id || p.owner)?.toString() === (user?._id || user?.id)?.toString()) &&
                                                        p.members.some(mem => (mem._id || mem)?.toString() === (m._id || m)?.toString())
                                                    ) && (
                                                            <button
                                                                onClick={() => handleRemoveMember((m._id || m)?.toString())}
                                                                className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-black rounded-xl text-sm transition-all border border-transparent hover:border-red-200"
                                                            >
                                                                Remove Collaboration
                                                            </button>
                                                        )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* All Users -Invite Section */}
                                    <div className="space-y-6 pt-6">
                                        <div className="text-xs font-black text-[#44546f] dark:text-[#9fadbc] uppercase tracking-widest pl-2">Invite New Collaborators</div>
                                        {allUsers.filter(u => !workspaceMembers.some(m => (m._id || m)?.toString() === (u._id || u)?.toString())).map(u => (
                                            <div key={u._id} className="bg-white dark:bg-[#1d2125] p-6 rounded-2xl flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-2 border-transparent hover:border-[#dfe1e6] dark:hover:border-[#333c44] hover:bg-gray-50 dark:hover:bg-[#1d2125] transition-all group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#161a1d] text-[#44546f] dark:text-[#9fadbc] flex items-center justify-center font-black text-2xl border dark:border-[#333c44]">
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="font-black text-[#172b4d] dark:text-[#b6c2cf] text-lg">{u.name}</div>
                                                        <div className="text-sm font-bold text-[#c1c7d0] dark:text-[#9fadbc]">{u.email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {invitedUsers.includes(u._id.toString()) ? (
                                                        <button disabled className="px-4 py-2 bg-gray-100 dark:bg-[#161a1d] text-[#44546f] dark:text-[#9fadbc] font-bold rounded-xl text-sm border-2 border-[#dfe1e6] dark:border-[#333c44] cursor-not-allowed">
                                                            Invited
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleInviteUser(u)} className="px-4 py-2 bg-[#0c66e4] hover:bg-[#0055cc] text-white font-bold rounded-xl text-sm transition-colors shadow-sm">
                                                            Invite
                                                        </button>
                                                    )}
                                                    <select className="bg-white dark:bg-[#161a1d] border-2 border-[#dfe1e6] dark:border-[#333c44] rounded-xl px-4 py-2 text-sm font-black text-[#172b4d] dark:text-[#b6c2cf] outline-none focus:border-[#0c66e4]">
                                                        <option>Member</option>
                                                        <option>Admin</option>
                                                        <option>Observer</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {membersTab === 'requests' && (
                                <>
                                    {joinRequests.length > 0 ? joinRequests.map(r => (
                                        <div key={r._id} className="bg-white dark:bg-[#1d2125] p-6 rounded-2xl flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-2 border-[#f1f2f4] dark:border-[#333c44] hover:shadow-lg transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-2xl border border-indigo-200 dark:border-indigo-800">
                                                    {r.fromUser?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="font-black text-[#172b4d] dark:text-[#b6c2cf] text-lg">{r.fromUser?.name}</div>
                                                    <div className="text-sm font-bold text-[#44546f] dark:text-[#9fadbc]">Wants to join your Workspace</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => handleAcceptInvite(r)}
                                                    className="px-6 py-2.5 bg-[#4bce97] hover:bg-[#3fb081] text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                                                >
                                                    <CheckCircle2 size={18} /> Accept
                                                </button>
                                                <button
                                                    onClick={() => handleDeclineInvite(r)}
                                                    className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-red-500/20 flex items-center gap-2"
                                                >
                                                    <X size={18} /> Decline
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-20 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#161a1d] border-4 border-dashed border-gray-200 dark:border-[#333c44] rounded-3xl gap-6 opacity-40">
                                            <Users size={80} strokeWidth={1} />
                                            <div className="text-center">
                                                <div className="text-xl font-black mb-2 dark:text-[#b6c2cf]">No pending requests</div>
                                                <div className="text-sm font-bold dark:text-[#9fadbc]">New join requests will appear here.</div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {membersTab === 'guests' && (
                                <div className="py-20 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#161a1d] border-4 border-dashed border-gray-200 dark:border-[#333c44] rounded-3xl gap-6 opacity-40">
                                    <UserIcon size={80} strokeWidth={1} />
                                    <div className="text-center">
                                        <div className="text-xl font-black mb-2 dark:text-[#b6c2cf]">No guest members</div>
                                        <div className="text-sm font-bold dark:text-[#9fadbc]">Guests are users with access to specific boards only.</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            }

            case 'settings': {
                const settingsList = [
                    { key: 'visibility', label: 'Workspace visibility', desc: `Current: ${workspaceSettings.visibility} - This dictates who can see and index your Workspace boards.`, icon: Globe, options: ['Private', 'Public'] },
                    { key: 'membership', label: 'Workspace membership restrictions', desc: `Current: ${workspaceSettings.membership} - Controlling who can join this collaborative space.`, icon: Users, options: ['Flexible', 'Strict'] },
                    { key: 'creation', label: 'Board creation restrictions', desc: `Current: ${workspaceSettings.creation} - Managing which roles are allowed to spawn new boards.`, icon: LayoutGrid, options: ['Open', 'Admins Only'] },
                    { key: 'deletion', label: 'Board deletion restrictions', desc: `Current: ${workspaceSettings.deletion} - Safeguarding boards from accidental or unauthorized removal.`, icon: Trash2, options: ['Restricted', 'Open'] },
                ];

                return (
                    <div className="p-10 max-w-4xl mx-auto space-y-12 transition-all animate-in fade-in duration-300">
                        <div className="flex justify-between items-center text-[#172b4d] dark:text-[#b6c2cf]">
                            <h1 className="text-3xl font-black tracking-tight">Workspace settings</h1>
                        </div>

                        <section className="bg-white dark:bg-[#1d2125] border-2 border-[#f1f2f4] dark:border-[#333c44] rounded-3xl p-8 space-y-8 shadow-sm">
                            <div className="flex items-center gap-6 text-[#172b4d] dark:text-[#b6c2cf]">
                                <div className="w-20 h-20 bg-gradient-to-br from-[#4bce97] to-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-emerald-500/20">P</div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black">ProjectX Workspace</h2>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/20 text-[#0c66e4] dark:text-[#5794f7] px-3 py-1 rounded-lg uppercase tracking-wider border border-blue-100 dark:border-blue-900/30">Premium Plan</span>
                                        <span className="text-[10px] font-black bg-gray-50 dark:bg-[#1d2125] text-[#44546f] dark:text-[#9fadbc] px-3 py-1 rounded-lg uppercase tracking-wider border border-[#dfe1e6] dark:border-[#333c44]">{workspaceSettings.visibility}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-6 rounded-2xl flex items-center justify-between transition-all border-2 ${workspaceSettings.aiEnabled ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30' : 'bg-gray-50 border-gray-100 grayscale opacity-60'}`}>
                                <div className="flex items-center gap-6">
                                    <div className="p-3 bg-white dark:bg-[#161a1d] rounded-xl shadow-md border dark:border-[#333c44]">
                                        <Rocket className="text-[#5243aa]" size={24} />
                                    </div>
                                    <div>
                                        <div className="font-black text-[#172b4d] dark:text-[#b6c2cf] text-lg flex items-center gap-3">AI capabilities <span className="text-[10px] bg-[#5243aa] text-white px-3 py-1 rounded-full animate-pulse uppercase tracking-widest">Active</span></div>
                                        <p className="text-sm text-[#44546f] dark:text-[#9fadbc] font-medium leading-relaxed">Let AI help you generate board structures, card descriptions and task lists.</p>
                                    </div>
                                </div>
                                <div
                                    onClick={() => toggleSetting('aiEnabled')}
                                    className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${workspaceSettings.aiEnabled ? 'bg-[#4bce97]' : 'bg-gray-300 dark:bg-gray-700'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${workspaceSettings.aiEnabled ? 'right-1' : 'left-1'}`} />
                                </div>
                            </div>
                        </section>

                        <div className="bg-white dark:bg-[#1d2125] border-2 border-[#f1f2f4] dark:border-[#333c44] rounded-3xl overflow-hidden divide-y divide-[#f1f2f4] dark:divide-[#333c44] shadow-sm">
                            {settingsList.map((s, i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between p-8 hover:bg-gray-50 dark:hover:bg-[#1d2125]/50 transition-colors group">
                                    <div className="flex gap-6 items-center">
                                        <div className="w-14 h-14 flex items-center justify-center bg-gray-100 dark:bg-[#161a1d] rounded-2xl text-gray-500 shrink-0 group-hover:bg-[#0c66e4] group-hover:text-white transition-all border dark:border-[#333c44]">
                                            <s.icon size={24} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="font-black text-lg text-[#172b4d] dark:text-[#b6c2cf]">{s.label}</div>
                                            <div className="text-sm text-[#44546f] dark:text-[#9fadbc] leading-relaxed max-w-xl font-medium">{s.desc}</div>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => {
                                            const currentIdx = s.options.indexOf(workspaceSettings[s.key]);
                                            const nextIdx = (currentIdx + 1) % s.options.length;
                                            setWorkspaceSettings(prev => ({ ...prev, [s.key]: s.options[nextIdx] }));
                                            toast.success(`${s.label} updated!`);
                                        }}
                                        className={`w-14 h-8 shrink-0 rounded-full relative cursor-pointer transition-all ${workspaceSettings[s.key] === s.options[1] ? 'bg-[#4bce97]' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${workspaceSettings[s.key] === s.options[1] ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }

            case 'export': {
                return (
                    <div className="p-10 max-w-3xl mx-auto text-center space-y-10 flex flex-col items-center justify-center min-h-[70vh] animate-in zoom-in-95 duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-2xl animate-pulse"></div>
                            <div className="relative w-24 h-24 bg-white dark:bg-[#1d2125] border dark:border-[#333c44] rounded-3xl shadow-2xl flex items-center justify-center text-[#0c66e4] dark:text-[#5794f7]">
                                <Download size={48} strokeWidth={1.5} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-3xl font-black text-[#172b4d] dark:text-[#b6c2cf] tracking-tight">
                                Export Data <span className="ml-3 bg-[#dfd8f7] dark:bg-indigo-900/30 text-[#5243aa] dark:text-[#9fadbc] text-[12px] font-black px-3 py-1 rounded-lg uppercase align-middle shadow-sm">Premium</span>
                            </h1>
                            <p className="text-[#44546f] dark:text-[#9fadbc] text-base leading-relaxed max-w-md mx-auto font-medium">
                                Choose your preferred format to back up your Workspace boards and member data.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-[#1d2125] border-2 border-[#f1f2f4] dark:border-[#333c44] p-8 rounded-2xl shadow-lg w-full max-w-xl space-y-8">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {['json', 'csv', 'pdf', 'text'].map(format => (
                                    <button
                                        key={format}
                                        onClick={() => setExportFormat(format)}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${exportFormat === format
                                            ? 'border-[#0c66e4] bg-blue-50 dark:bg-blue-900/20 text-[#0c66e4] dark:text-[#5794f7]'
                                            : 'border-[#dfe1e6] dark:border-[#333c44] hover:border-[#0c66e4] text-[#44546f] dark:text-[#9fadbc]'
                                            }`}
                                    >
                                        <Layers size={24} />
                                        <span className="text-xs font-black uppercase tracking-widest">{format}</span>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    const data = JSON.stringify({
                                        workspace: "My Workspace",
                                        boards: projects,
                                        members: allUsers,
                                        exportedAt: new Date().toISOString()
                                    }, null, 2);
                                    const blob = new Blob([data], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `projectx-export-${exportFormat}-${new Date().getTime()}.json`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    toast.success(`Exporting ${exportFormat.toUpperCase()}...`);
                                }}
                                className="w-full bg-[#0c66e4] text-white py-4 rounded-xl font-black text-sm hover:bg-[#0055cc] shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Download size={20} /> Download Export File
                            </button>
                        </div>
                    </div>
                );
            }

            default: { // Boards View
                return (
                    <div className="p-10 max-w-6xl mx-auto space-y-12 transition-all animate-in fade-in duration-300">
                        <section className="space-y-8">
                            <h2 className="text-2xl font-black text-[#172b4d] dark:text-[#b6c2cf] flex items-center gap-4 tracking-tight">
                                <Clock className="text-[#44546f] dark:text-[#9fadbc]" strokeWidth={2.5} /> Recently viewed
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {projects.slice(0, 3).map((p) => (
                                    <div key={p._id} className={`h-36 p-5 ${p.background || 'bg-gradient-to-br from-[#0079bf] to-[#055a8c]'} rounded-2xl font-black text-black cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col justify-end shadow-lg relative border border-black/10`} onClick={() => navigate(`/card/${p._id}`)}>
                                        <span className="text-lg group-hover:underline">{p.name}</span>
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setProjectName(p.name);
                                                    setSelectedBackground(p.background);
                                                    setEditingProject(p);
                                                    setShowModal(true);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 bg-black/10 hover:bg-blue-500 hover:text-white rounded-lg transition-all text-black mr-1"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    showConfirm({
                                                        title: 'Delete Board',
                                                        message: 'Are you sure you want to delete this board? All data will be permanently removed.',
                                                        onConfirm: () => handleDeleteProject(p._id)
                                                    });
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 bg-black/10 hover:bg-red-500 hover:text-white rounded-lg transition-all text-black"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <Star size={16} className="text-black opacity-70" />
                                        </div>
                                    </div>
                                ))}
                                {!projects.length && (
                                    <div className="col-span-full py-12 border-4 border-dashed border-[#f1f2f4] dark:border-[#333c44] rounded-2xl flex flex-col items-center justify-center text-gray-300 dark:text-[#44546f] gap-4">
                                        <LayoutIcon size={48} strokeWidth={1} />
                                        <p className="font-bold text-sm">No boards viewed recently</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="space-y-8">
                            <h2 className="text-2xl font-black text-[#172b4d] dark:text-[#b6c2cf] flex items-center gap-4 tracking-tight">
                                <LayoutGrid className="text-[#44546f] dark:text-[#9fadbc]" strokeWidth={2.5} /> Your boards
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {projects.map((p) => (
                                    <div key={p._id} className={`h-40 p-6 ${p.background || 'bg-gradient-to-br from-[#0079bf] to-[#055a8c]'} rounded-2xl font-black text-black cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col justify-end shadow-lg relative border border-black/10`} onClick={() => navigate(`/card/${p._id}`)}>
                                        <span className="text-xl group-hover:underline">{p.name}</span>
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setProjectName(p.name);
                                                    setSelectedBackground(p.background);
                                                    setEditingProject(p);
                                                    setShowModal(true);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 bg-black/10 hover:bg-blue-500 hover:text-white rounded-lg transition-all text-black mr-1"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    showConfirm({
                                                        title: 'Delete Board',
                                                        message: 'Are you sure you want to delete this board? This action is permanent and all lists, cards, and comments will be lost forever.',
                                                        onConfirm: () => handleDeleteProject(p._id)
                                                    });
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 bg-black/10 hover:bg-red-500 hover:text-white rounded-lg transition-all text-black"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <Star size={16} className="text-black opacity-70" />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="h-40 bg-[#f1f2f4] dark:bg-[#161a1d] hover:bg-[#e4e6ea] dark:hover:bg-[#333c44] rounded-2xl text-base font-black text-[#44546f] dark:text-[#9fadbc] flex flex-col items-center justify-center gap-4 border-2 border-[#dfe1e6] dark:border-[#333c44] transition-all group shadow-inner"
                                >
                                    <div className="p-3 bg-gray-200 dark:bg-[#1d2125] rounded-xl group-hover:bg-white dark:group-hover:bg-[#161a1d] transition-colors"><Plus size={24} /></div>
                                    Create new board
                                </button>
                            </div>
                        </section>
                    </div>
                );
            }
        }
    };

    return (
        <div className="flex flex-1 overflow-hidden relative">
            <div className="flex-1 overflow-auto">
                {renderContent()}
            </div>

            {/* Centered Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content animate-in zoom-in-95 duration-200 bg-white dark:bg-[#1d2125] border dark:border-[#333c44] shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-[#172b4d] dark:text-[#b6c2cf] tracking-tight">{editingProject ? 'Edit board' : 'Create board'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-[#44546f] dark:text-[#9fadbc] hover:bg-gray-100 dark:hover:bg-[#333c44] p-2 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateProject} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-[#44546f] uppercase tracking-widest">Background</label>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { name: 'Light Pink', class: "bg-[#F4C2C2]" },
                                        { name: 'Pastel Yellow', class: "bg-[#FDFD96]" },
                                        { name: 'Pastel Orange', class: "bg-[#FFB347]" },
                                        { name: 'Pistachio', class: "bg-[#93C572]" },
                                        { name: 'Lavender', class: "bg-[#E6E6FA]" },
                                        { name: 'Matcha Green', class: "bg-[#B5C99A]" },
                                        { name: 'Sky Blue', class: "bg-[#87CEEB]" },
                                    ].map(color => (
                                        <button
                                            key={color.class}
                                            type="button"
                                            onClick={() => setSelectedBackground(color.class)}
                                            title={color.name}
                                            className={`w-12 h-10 rounded-lg cursor-pointer ring-offset-2 transition-all ${color.class} border-2 ${selectedBackground === color.class ? 'ring-2 ring-blue-500 border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#44546f] dark:text-[#9fadbc] uppercase tracking-widest">Board title <span className="text-red-500 text-lg">*</span></label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    className="w-full px-4 py-3 border-2 border-[#dfe1e6] dark:border-[#333c44] rounded-xl focus:border-[#0c66e4] outline-none transition-all text-base font-bold placeholder:text-gray-400 shadow-inner bg-gray-50 dark:bg-[#161a1d] text-[#172b4d] dark:text-[#b6c2cf] focus:bg-white dark:focus:bg-[#1d2125]"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="Enter board title"
                                />
                                <p className="text-[10px] font-black text-gray-400 dark:text-[#44546f] uppercase tracking-tighter">  Choose a  name for your Work</p>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    type="button"
                                    className="flex-1 bg-gray-50 border-2 border-[#dfe1e6] text-gray-500 font-black py-3 rounded-xl hover:bg-gray-100 transition-all uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!projectName.trim()}
                                    className="flex-[2] bg-[#0c66e4] text-white font-black py-3 rounded-xl hover:bg-[#0055cc] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_8px_16px_rgba(12,102,228,0.3)] uppercase tracking-widest text-xs"
                                >
                                    Create Board
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}



            {/* Template Preview Modal */}
            {previewTemplate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setPreviewTemplate(null)}>
                    <div className="bg-white dark:bg-[#1d2125] border dark:border-[#333c44] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="h-64 relative w-full overflow-hidden shrink-0 bg-gray-100 dark:bg-[#161a1d]">
                            {previewTemplate.img && (
                                <img src={previewTemplate.img} className="w-full h-full object-cover" alt={previewTemplate.title} />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                                <h2 className="text-3xl font-black text-white tracking-tight leading-tight">{previewTemplate.title}</h2>
                                <p className="text-white/80 font-medium mt-2 flex items-center gap-2">
                                    <img src={previewTemplate.avatar || previewTemplate.logo} className="w-6 h-6 rounded-full border border-white/30" alt="creator" />
                                    By {previewTemplate.creator}
                                </p>
                            </div>
                            <button onClick={() => setPreviewTemplate(null)} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-[#44546f] dark:text-[#9fadbc] uppercase tracking-widest">About this template</h3>
                                <p className="text-[#172b4d] dark:text-[#b6c2cf] text-lg font-medium leading-relaxed">
                                    {previewTemplate.desc}
                                </p>
                            </div>

                            <div className="flex items-center gap-8 py-4 border-t border-b border-[#dfe1e6] dark:border-[#333c44]">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-[#44546f] dark:text-[#9fadbc] uppercase tracking-widest">Downloads</div>
                                    <div className="text-xl font-black text-[#172b4d] dark:text-[#b6c2cf] flex items-center gap-2"><Download size={18} className="text-[#0c66e4]" /> {previewTemplate.users}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-[#44546f] dark:text-[#9fadbc] uppercase tracking-widest">Views</div>
                                    <div className="text-xl font-black text-[#172b4d] dark:text-[#b6c2cf] flex items-center gap-2"><Globe size={18} className="text-purple-500" /> {previewTemplate.views}</div>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-4">
                                <button
                                    onClick={() => handleUseTemplate(previewTemplate)}
                                    className="flex-1 bg-[#0c66e4] text-white font-black py-4 rounded-xl hover:bg-[#0055cc] active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(12,102,228,0.3)] uppercase tracking-widest text-sm"
                                >
                                    Use Template
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1d2125] border dark:border-[#333c44] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 p-8 space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-[#172b4d] dark:text-[#b6c2cf]">Invite to Workspace</h2>
                            <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#333c44] rounded-full text-gray-400 transition-colors"><X size={24} /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0c66e4] transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Email address or name"
                                    className="w-full pl-12 pr-4 py-4 bg-[#f4f5f7] dark:bg-[#161a1d] rounded-2xl border-2 border-transparent focus:border-[#0c66e4] dark:focus:border-[#5794f7] outline-none font-bold text-[#172b4d] dark:text-[#b6c2cf] transition-all"
                                    value={inviteQuery}
                                    onChange={(e) => setInviteQuery(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 max-h-64 overflow-auto">
                                {allUsers.filter(u => u.name.toLowerCase().includes(inviteQuery.toLowerCase()) || u.email.toLowerCase().includes(inviteQuery.toLowerCase())).map(u => (
                                    <div key={u._id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#161a1d] rounded-2xl transition-all border border-transparent hover:border-[#dfe1e6] dark:hover:border-[#333c44]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[#0c66e4] dark:text-[#5794f7] flex items-center justify-center font-black text-sm">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-[#172b4d] dark:text-[#b6c2cf]">{u.name}</div>
                                                <div className="text-[10px] font-bold text-[#44546f] dark:text-[#9fadbc]">{u.email}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => !invitedUsers.includes(u._id) && handleInviteUser(u)}
                                            disabled={invitedUsers.includes(u._id)}
                                            className={`px-4 py-2 rounded-xl font-black text-xs transition-all active:scale-95 shadow-lg ${invitedUsers.includes(u._id)
                                                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                                : 'bg-[#0c66e4] text-white hover:bg-[#0055cc] shadow-blue-500/20'
                                                }`}
                                        >
                                            {invitedUsers.includes(u._id) ? 'Invited' : 'Invite'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="pt-4 border-t border-[#f1f2f4]">
                            <p className="text-xs text-[#44546f] font-medium text-center">Tip: You can invite multiple members by separating their emails with a comma.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
