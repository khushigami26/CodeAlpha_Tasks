import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    Layout,
    Home as HomeIcon,
    Plus,
    Settings,
    Users,
    CreditCard,
    Download,
    LogOut,
    ChevronDown,
    LayoutGrid,
    User as UserIcon,
    Clock
} from 'lucide-react';

const MainLayout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    if (!user) return <>{children}</>;

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully!');
        navigate('/');
    };

    const navItems = [
        { id: 'templates', icon: LayoutGrid, label: 'Templates', path: '/templates' },
        { id: 'activity', icon: Clock, label: 'Activity', path: '/activity' },
        { id: 'home', icon: HomeIcon, label: 'Home', path: '/home' },
        { id: 'profile', icon: UserIcon, label: 'Profile', path: '/profile' },
    ];

    const workspaceItems = [
        { id: 'ws-boards', icon: LayoutGrid, label: 'Boards', path: '/boards' },
        { id: 'members', icon: Users, label: 'Members', path: '/members' },
        { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="flex h-[calc(100vh-48px)] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-65 bg-[#f7f8f9] dark:bg-[#161a1d] border-r border-[#dfe1e6] dark:border-[#333c44] flex flex-col pt-3 shrink-0 transition-colors">
                <div className="flex flex-col gap-1 px-3 mb-6">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded transition-colors ${location.pathname === item.path
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-[#0c66e4] dark:text-[#5794f7]'
                                : 'text-[#172b4d] dark:text-[#b6c2cf] hover:bg-gray-100 dark:hover:bg-[#333c44]'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="h-px bg-[#dfe1e6] dark:bg-[#333c44] mx-3 mb-4" />

                <div className="px-6 text-xs font-semibold text-[#44546f] dark:text-[#9fadbc] uppercase tracking-wider mb-2 flex justify-between items-center group">
                    Workspaces
                    <button className="hover:bg-gray-200 p-0.5 rounded"><Plus size={14} /></button>
                </div>

                <div className="px-3">
                    <div className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#172b4d] dark:text-[#b6c2cf] hover:bg-gray-100 dark:hover:bg-[#333c44] rounded cursor-pointer mb-2 transition-colors">
                        <div className="w-6 h-6 bg-[#0c66e4] dark:bg-[#5794f7] rounded flex items-center justify-center text-white text-[10px]">P</div>
                        <span className="flex-1 truncate">ProjectX Workspace</span>
                        <ChevronDown size={16} />
                    </div>

                    <div className="flex flex-col gap-0.5 ml-2 border-l border-[#dfe1e6] dark:border-[#333c44]">
                        {workspaceItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`flex items-center gap-3 px-6 py-2 text-sm font-medium rounded transition-colors ${location.pathname === item.path
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-[#0c66e4] dark:text-[#5794f7]'
                                    : 'text-[#44546f] dark:text-[#9fadbc] hover:bg-gray-100 dark:hover:bg-[#333c44]'
                                    }`}
                            >
                                <item.icon size={16} />
                                {item.label}
                            </button>
                        ))}
                        <button
                            onClick={() => navigate('/export')}
                            className={`flex items-center gap-3 px-6 py-2 text-sm font-medium rounded transition-colors ${location.pathname === '/export'
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-[#0c66e4] dark:text-[#5794f7]'
                                : 'text-[#44546f] dark:text-[#9fadbc] hover:bg-gray-100 dark:hover:bg-[#333c44]'
                                }`}
                        >
                            <Download size={16} />
                            Export
                            <span className="bg-[#dfd8f7] text-[#5243aa] text-[9px] font-bold px-1 rounded uppercase">Premium</span>
                        </button>
                    </div>
                </div>

                <div className="mt-auto p-3 border-t border-[#dfe1e6]">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-[#ef4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 overflow-auto bg-white dark:bg-[#1d2125] transition-colors">
                {children}
            </div>
        </div>
    );
};

export default MainLayout;
