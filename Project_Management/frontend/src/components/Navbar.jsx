import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Search, Bell, Info, User as UserIcon, LayoutGrid, ChevronDown, Menu, X, Star, Moon, Sun, Clock, CreditCard, Settings as SettingsIcon } from 'lucide-react';
import API from '../services/api';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';

import io from 'socket.io-client';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'board', title: 'New Board Created', desc: 'Project Alpha was added to Workspace', time: '2m ago', user: 'System' },
        { id: 2, type: 'card', title: 'Card Added', desc: 'John added "Finalize UI" to To Do', time: '15m ago', user: 'John Doe' },
        { id: 3, type: 'collab', title: 'Collaborator Joined', desc: 'Sarah joined Project Alpha', time: '1h ago', user: 'Sarah' }
    ]);
    const [activeDropdown, setActiveDropdown] = useState(null); // workspaces, recent, starred, templates
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [allProjects, setAllProjects] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const profileMenuRef = useRef(null);
    const searchRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (user) {
            //  Socket.io
            if (!socketRef.current) {
                const socket = io('http://localhost:5000');
                socketRef.current = socket;
                socket.on('new-notification', (data) => {
                    if (data.user === user._id) {
                        setNotifications(prev => {
                            if (prev.some(n => n.id === data.notificationId)) return prev;
                            return [{
                                id: data.notificationId,
                                type: data.type,
                                title: data.title,
                                desc: data.desc,
                                time: data.time,
                                action: data.action,
                                backend: true
                            }, ...prev];
                        });
                        toast.success('You have a new workspace invitation!', { icon: '🔔' });
                    }
                });
            }
            const fetchAllProjects = async () => {
                try {
                    const { data } = await API.get('/projects');
                    setAllProjects(Array.isArray(data) ? data : []);
                } catch (error) {
                    console.error('Error fetching projects for search:', error);
                }
            };
            const fetchNotifications = async () => {
                try {
                    const { data } = await API.get('/notifications');
                    const backendNotifs = data.map(n => ({
                        id: n._id,
                        type: 'collab',
                        title: 'Workspace Invitation',
                        desc: `${n.fromUser?.name} invited you to join their workspace`,
                        time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        action: 'invite',
                        backend: true
                    }));
                    setNotifications(prev => {
                        const prevMocks = prev.filter(p => !p.backend && p.id !== 1 && p.id !== 2 && p.id !== 3);
                        return [...backendNotifs, ...prevMocks,
                        { id: 1, type: 'board', title: 'New Board Created', desc: 'Project Alpha was added to Workspace', time: '2m ago', user: 'System' },
                        { id: 2, type: 'card', title: 'Card Added', desc: 'John added "Finalize UI" to To Do', time: '15m ago', user: 'John Doe' },
                        { id: 3, type: 'collab', title: 'Collaborator Joined', desc: 'Sarah joined Project Alpha', time: '1h ago', user: 'Sarah' }
                        ];
                    });
                } catch (error) {
                    console.error('Error fetching notifications:', error);
                }
            };
            fetchAllProjects();
            fetchNotifications();
        }
    }, [user]);

    let filteredProjects = [];
    for (let i = 0; i < allProjects.length; i++) {
        if (allProjects[i].name.toLowerCase().includes(searchQuery.toLowerCase())) {
            filteredProjects.push(allProjects[i]);
        }
    }

    const isLandingPage = location.pathname === '/';

    return (
        <nav className="h-12 bg-white dark:bg-[#1d2125] text-[#172b4d] dark:text-[#b6c2cf] border-b border-[#dfe1e6] dark:border-[#333c44] flex items-center justify-between px-4 sticky top-0 z-50 transition-colors">
            <div className="flex items-center gap-6">
                <div
                    className="flex items-center gap-1.5 font-black text-xl text-[#0c66e4] dark:text-[#5794f7] cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate('/')}
                >
                    <LayoutGrid size={22} className="fill-[#0c66e4] dark:fill-[#5794f7]" />
                    <span className="tracking-tight">ProjectX</span>
                </div>

                {user && (
                    <div className="hidden lg:flex items-center gap-1">
                        {[
                            { label: 'Workspaces', id: 'workspaces' },
                            { label: 'Recent', id: 'recent' },
                            { label: 'Starred', id: 'starred' },
                            { label: 'Templates', id: 'templates' }
                        ].map((item) => (
                            <div key={item.id} className="relative">
                                <button
                                    onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                                    className={`flex items-center gap-1 px-3 py-1.5 text-sm font-bold transition-colors rounded ${activeDropdown === item.id ? 'bg-blue-50 dark:bg-blue-900/30 text-[#0c66e4] dark:text-[#5794f7]' : 'text-[#44546f] dark:text-[#b6c2cf] hover:bg-gray-100 dark:hover:bg-[#333c44]'}`}
                                >
                                    {item.label} <ChevronDown size={14} className={`opacity-50 transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                                </button>

                                {activeDropdown === item.id && (
                                    <div className="absolute left-0 mt-3 w-64 bg-white dark:bg-[#1d2125] border border-[#dfe1e6] dark:border-[#333c44] rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in duration-200">
                                        <div className="text-[10px] font-black text-[#44546f] dark:text-[#9fadbc] mb-3 uppercase tracking-widest">{item.label}</div>
                                        <div className="space-y-1">
                                            {item.id === 'workspaces' && (
                                                <div className="p-3 bg-gray-50 dark:bg-[#161a1d] rounded-lg border border-[#dfe1e6] dark:border-[#333c44] flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-[#0c66e4] rounded flex items-center justify-center text-white font-black text-xs">P</div>
                                                    <div className="text-sm font-black text-[#172b4d] dark:text-[#b6c2cf]">ProjectX Workspace</div>
                                                </div>
                                            )}
                                            {item.id === 'recent' && (
                                                <div className="text-xs text-[#44546f] dark:text-[#9fadbc] py-4 text-center font-bold bg-gray-50 dark:bg-[#161a1d] rounded-lg">No recent boards</div>
                                            )}
                                            {item.id === 'starred' && (
                                                <div className="text-xs text-[#44546f] dark:text-[#9fadbc] py-4 text-center font-bold bg-gray-50 dark:bg-[#161a1d] rounded-lg">No starred boards</div>
                                            )}
                                            {item.id === 'templates' && (
                                                <div className="grid grid-cols-1 gap-2">
                                                    {['Business', 'Design', 'Education'].map(t => (
                                                        <button key={t} className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-[#333c44] rounded text-sm font-black text-[#172b4d] dark:text-[#b6c2cf]">{t}</button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <div className="hidden md:relative group md:flex items-center bg-[#f1f2f4] dark:bg-[#161a1d] border border-[#dfe1e6] dark:border-[#333c44] rounded-md px-2 focus-within:bg-white dark:focus-within:bg-[#1d2125] focus-within:border-[#0c66e4] focus-within:ring-2 focus-within:ring-blue-100 transition-all" ref={searchRef}>
                            <Search size={16} className="text-[#44546f] dark:text-[#9fadbc]" />
                            <input
                                type="text"
                                className="bg-transparent border-none outline-none py-1 px-2 text-sm w-44 focus:w-64 transition-all font-medium text-[#172b4d] dark:text-[#b6c2cf]"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
                                onFocus={() => setShowSearchResults(true)}
                            />
                            {showSearchResults && searchQuery && (
                                <div className="absolute top-10 left-0 w-80 bg-white dark:bg-[#1d2125] border border-[#dfe1e6] dark:border-[#333c44] rounded-xl shadow-2xl p-4 z-[60] animate-in fade-in zoom-in-95 duration-200">
                                    <div className="text-[10px] font-black text-[#44546f] dark:text-[#9fadbc] mb-3 uppercase tracking-widest">Search results</div>
                                    <div className="space-y-1 max-h-64 overflow-auto">
                                        {filteredProjects.length > 0 ? (
                                            filteredProjects.map(p => (
                                                <button
                                                    key={p._id}
                                                    onClick={() => { navigate(`/card/${p._id}`); setShowSearchResults(false); setSearchQuery(''); }}
                                                    className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-[#333c44] rounded-lg flex items-center gap-3 group transition-colors"
                                                >
                                                    <div className={`w-8 h-8 rounded ${p.background || 'bg-[#0c66e4]'}`}></div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-black text-[#172b4d] dark:text-[#b6c2cf] truncate group-hover:text-[#0c66e4]">{p.name}</div>
                                                        <div className="text-[10px] text-[#44546f] dark:text-[#9fadbc] font-bold">ProjectX Workspace</div>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="text-xs text-[#44546f] dark:text-[#b6c2cf] py-4 text-center font-bold bg-gray-50 dark:bg-[#161a1d] rounded-lg">No results for "{searchQuery}"</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-blue-50 dark:bg-blue-900/30 text-[#0c66e4] dark:text-[#5794f7]' : 'text-[#44546f] dark:text-[#b6c2cf] hover:bg-gray-100 dark:hover:bg-[#333c44]'}`}
                                    title="Notifications"
                                >
                                    <Bell size={18} />
                                    {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#1d2125]"></span>}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1d2125] border border-[#dfe1e6] dark:border-[#333c44] rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in zoom-in duration-200">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="text-[10px] font-black text-[#44546f] dark:text-[#9fadbc] uppercase tracking-widest">Notifications</div>
                                            <button className="text-[10px] font-black text-[#0c66e4] dark:text-[#5794f7] uppercase hover:underline">Mark all as read</button>
                                        </div>
                                        <div className="space-y-4 max-h-[400px] overflow-auto">
                                            {notifications.map((n, i) => (
                                                <div key={n.id} className="flex gap-4 p-3 hover:bg-gray-50 dark:hover:bg-[#333c44] rounded-xl transition-colors cursor-pointer group">
                                                    <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center ${n.type === 'board' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-[#5794f7]' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'}`}>
                                                        {n.type === 'board' ? <LayoutGrid size={18} /> : <Info size={18} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-black text-[#172b4d] dark:text-[#b6c2cf] group-hover:text-[#0c66e4]">{n.title}</div>
                                                        <div className="text-xs text-[#44546f] dark:text-[#9fadbc] leading-relaxed">{n.desc}</div>
                                                        {n.action && (
                                                            <div className="mt-2 flex gap-2">
                                                                <button onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    const toastId = toast.loading('Accepting...');
                                                                    if (n.backend) {
                                                                        try {
                                                                            await API.post(`/notifications/${n.id}/accept`);
                                                                            toast.success('Invitation accepted! You now have access.', { id: toastId });
                                                                            setNotifications(prev => prev.filter(notif => notif.id !== n.id));


                                                                            const dashRoutes = ['/boards', '/members', '/activity', '/home'];
                                                                            if (dashRoutes.includes(location.pathname)) {
                                                                                window.location.reload();
                                                                            }
                                                                        } catch (err) {
                                                                            toast.error('Failed to accept.', { id: toastId });
                                                                        }
                                                                    } else {
                                                                        toast.success('Invitation accepted!', { id: toastId });
                                                                        setNotifications(prev => prev.filter(notif => notif.id !== n.id));
                                                                    }
                                                                }} className="text-xs font-bold bg-[#0c66e4] text-white px-3 py-1.5 rounded-md hover:bg-[#0055cc]">Accept</button>

                                                                <button onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    if (n.backend) {
                                                                        try { await API.post(`/notifications/${n.id}/decline`); } catch (e) { console.error('Error declining', e); }
                                                                    }
                                                                    setNotifications(prev => prev.filter(notif => notif.id !== n.id));
                                                                }} className="text-xs font-bold bg-gray-200 dark:bg-[#333c44] text-[#172b4d] dark:text-[#b6c2cf] px-3 py-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-[#44546f]">Decline</button>
                                                            </div>
                                                        )}
                                                        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 uppercase font-bold">{n.time}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {notifications.length === 0 && (
                                            <div className="text-center py-6 text-sm text-[#44546f] dark:text-[#9fadbc] font-bold">No new notifications</div>
                                        )}
                                        <button onClick={() => setNotifications([])} className="w-full mt-6 py-2.5 bg-[#f4f5f7] dark:bg-[#161a1d] hover:bg-[#ebecf0] dark:hover:bg-[#333c44] rounded-xl text-xs font-black text-[#172b4d] dark:text-[#b6c2cf] transition-all">
                                            View all activity
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0c66e4] to-blue-500 text-white flex items-center justify-center font-black text-xs ring-offset-2 hover:ring-2 hover:ring-blue-200 transition-all shadow-md"
                            >
                                {user?.name?.charAt(0).toUpperCase()}
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-3 w-[320px] bg-white dark:bg-[#1d2125] border border-[#dfe1e6] dark:border-[#333c44] rounded-2xl shadow-2xl p-0 z-50 animate-in fade-in zoom-in duration-200 overflow-hidden text-[#172b4d] dark:text-[#b6c2cf]">
                                    <div className="p-6 border-b border-[#f1f2f4] dark:border-[#333c44] bg-white dark:bg-[#1d2125]">
                                        <div className="text-[10px] font-black text-[#44546f] dark:text-[#9fadbc] mb-4 uppercase tracking-widest">Account</div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-[#0c66e4] text-white flex items-center justify-center font-black text-lg shadow-inner">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="font-black text-[#172b4d] dark:text-[#b6c2cf] truncate">{user?.name}</div>
                                                <div className="text-xs text-[#44546f] dark:text-[#9fadbc] font-bold truncate">{user?.email}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-2 space-y-0.5">
                                        {[
                                            { label: 'Profile and visibility', icon: UserIcon, path: '/profile' },
                                            { label: 'Activity', icon: Clock, path: '/activity' },
                                            { label: 'Cards', icon: CreditCard, path: '/boards' },
                                            { label: 'Settings', icon: SettingsIcon, path: '/settings' },
                                        ].map((item) => (
                                            <button
                                                key={item.label}
                                                onClick={() => { navigate(item.path); setShowProfileMenu(false); }}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-[#f1f2f4] dark:hover:bg-[#333c44] rounded-xl text-sm font-bold text-[#172b4d] dark:text-[#b6c2cf] transition-colors"
                                            >
                                                <item.icon size={16} className="opacity-60" />
                                                {item.label}
                                            </button>
                                        ))}

                                        <div className="h-px bg-[#f1f2f4] dark:bg-[#333c44] my-2 mx-2" />

                                        <div className="flex items-center justify-between p-3">
                                            <div className="flex items-center gap-3 text-sm font-bold text-[#172b4d] dark:text-[#b6c2cf]">
                                                {theme === 'dark' ? <Moon size={16} className="opacity-60" /> : <Sun size={16} className="opacity-60" />}
                                                Theme
                                            </div>
                                            <button
                                                onClick={toggleTheme}
                                                className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-[#5794f7]' : 'bg-[#f1f2f4]'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        <div className="h-px bg-[#f1f2f4] dark:bg-[#333c44] my-2 mx-2" />

                                        <button
                                            onClick={() => {
                                                logout();
                                                navigate('/');
                                                toast.success('Logged out successfully!!');
                                            }}
                                            className="w-full text-left p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 transition-colors"
                                        >
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className={`mr-2 w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-[#5794f7]' : 'bg-[#f1f2f4] border border-gray-300'}`}
                            title="Toggle Theme"
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
                        </button>
                        <Link
                            to="/login"
                            className="text-sm font-black text-[#172b4d] dark:text-[#b6c2cf] hover:text-[#0c66e4] dark:hover:text-[#5794f7] px-4 py-2 transition-all"
                        >
                            Log in
                        </Link>
                        <Link
                            to="/register"
                            className="bg-[#0c66e4] text-white px-5 py-2 rounded-lg text-sm font-black hover:bg-[#0055cc] transition-all shadow-lg shadow-blue-500/10 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Get ProjectX for free
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
