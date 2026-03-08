import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { User, Mail, Shield, Clock, MapPin, Briefcase, Camera, ExternalLink, X, Lock, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1542621334-a254cf47733d?auto=format&fit=crop&w=1200&q=80');
    const fileInputRef = useRef(null);

    if (!user) return null;

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setCoverImage(event.target.result);
            reader.readAsDataURL(file);
            toast.success('Cover photo updated!');
        }
    };

    const handleAction = (type) => {
        toast.loading(`Processing ${type}...`, { duration: 1000 });
        setTimeout(() => toast.success(`${type} successful!`), 1200);
    };

    return (
        <div className="min-h-full bg-[#f4f5f7] dark:bg-[#161a1d] p-8 animate-in fade-in duration-500 transition-colors">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header/Cover Section */}
                <div className="bg-white dark:bg-[#1d2125] rounded-3xl overflow-hidden shadow-sm border border-[#dfe1e6] dark:border-[#333c44] transition-colors">
                    <div className="h-48 relative overflow-hidden group">
                        <img src={coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Cover" />
                        <div className="absolute inset-0 bg-black/20" />
                        <label className="absolute bottom-4 right-6 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/40 transition-all flex items-center gap-2 border border-white/30 cursor-pointer z-10">
                            <Camera size={16} /> Edit cover
                            <input type="file" onChange={handleCoverChange} className="hidden" accept="image/*" />
                        </label>
                    </div>
                    <div className="px-10 pb-10 relative">
                        <div className="flex flex-col md:flex-row items-end gap-6 -mt-16 mb-8">
                            <div className="w-32 h-32 rounded-3xl bg-white dark:bg-[#1d2125] p-1.5 shadow-xl">
                                <div className="w-full h-full rounded-2xl bg-[#0c66e4] text-white flex items-center justify-center text-5xl font-black">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="flex-1 pb-2">
                                <h1 className="text-3xl font-black text-[#172b4d] dark:text-[#b6c2cf] tracking-tight">{user.name}</h1>
                                <p className="text-[#44546f] dark:text-[#9fadbc] font-bold">@{user.name?.toLowerCase().replace(/\s/g, '')}</p>
                            </div>
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="bg-[#0c66e4] text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0055cc] transition-all shadow-lg shadow-blue-500/20 mb-2"
                            >
                                Edit Profile
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#f1f2f4] dark:border-[#333c44]">
                            <div className="flex items-center gap-3 text-[#44546f] dark:text-[#9fadbc]">
                                <Briefcase size={18} className="text-[#0c66e4] dark:text-[#5794f7]" />
                                <span className="font-bold text-sm">Product Manager</span>
                            </div>
                            <div className="flex items-center gap-3 text-[#44546f] dark:text-[#9fadbc]">
                                <MapPin size={18} className="text-[#0c66e4] dark:text-[#5794f7]" />
                                <span className="font-bold text-sm">San Francisco, CA</span>
                            </div>
                            <div className="flex items-center gap-3 text-[#44546f] dark:text-[#9fadbc]">
                                <Clock size={18} className="text-[#0c66e4] dark:text-[#5794f7]" />
                                <span className="font-bold text-sm">Joined June 2023</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Info Card */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-[#1d2125] rounded-3xl p-8 shadow-sm border border-[#dfe1e6] dark:border-[#333c44] space-y-8 transition-colors">
                            <h2 className="text-xl font-black text-[#172b4d] dark:text-[#b6c2cf]">Profile Details</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-[#9fadbc] uppercase tracking-widest">Full Name</label>
                                    <div className="flex items-center gap-3 p-4 bg-[#f4f5f7] dark:bg-[#1a1d21] rounded-2xl border-2 border-transparent hover:border-[#dfe1e6] dark:hover:border-[#333c44] transition-all">
                                        <User size={18} className="text-[#0c66e4] dark:text-[#5794f7]" />
                                        <span className="font-bold text-[#172b4d] dark:text-[#b6c2cf]">{user.name}</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-[#9fadbc] uppercase tracking-widest">Email Address</label>
                                    <div className="flex items-center gap-3 p-4 bg-[#f4f5f7] dark:bg-[#1a1d21] rounded-2xl border-2 border-transparent hover:border-[#dfe1e6] dark:hover:border-[#333c44] transition-all">
                                        <Mail size={18} className="text-[#0c66e4] dark:text-[#5794f7]" />
                                        <span className="font-bold text-[#172b4d] dark:text-[#b6c2cf]">{user.email}</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-[#9fadbc] uppercase tracking-widest">User Role</label>
                                    <div className="flex items-center gap-3 p-4 bg-[#f4f5f7] dark:bg-[#1a1d21] rounded-2xl border-2 border-transparent hover:border-[#dfe1e6] dark:hover:border-[#333c44] transition-all">
                                        <Shield size={18} className="text-[#5aac44]" />
                                        <span className="font-bold text-[#172b4d] dark:text-[#b6c2cf]">Workspace Admin</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-[#9fadbc] uppercase tracking-widest">Status</label>
                                    <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border-2 border-emerald-100 dark:border-emerald-900/20 transition-all">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="font-bold text-emerald-700 dark:text-emerald-400">Active</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-[#f1f2f4] dark:border-[#333c44]">
                                <h3 className="text-sm font-black text-[#172b4d] dark:text-[#b6c2cf] uppercase tracking-wider">About Me</h3>
                                <p className="text-[#44546f] dark:text-[#9fadbc] leading-relaxed font-medium">
                                    Mission-driven project manager with a passion for building collaborative environments.
                                    I love organizing chaos and helping teams ship features faster by leveraging the power of ProjectX.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Security & Activity */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-[#1d2125] rounded-3xl p-8 shadow-sm border border-[#dfe1e6] dark:border-[#333c44] space-y-6 transition-colors">
                            <h2 className="text-base font-black text-[#172b4d] dark:text-[#b6c2cf]">Security</h2>
                            <div className="space-y-4">
                                <button onClick={() => setShow2FAModal(true)} className="w-full flex items-center justify-between p-4 border-2 border-[#f1f2f4] dark:border-[#333c44] hover:border-[#0c66e4] dark:hover:border-[#5794f7] hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-2xl transition-all group">
                                    <span className="text-sm font-bold text-[#44546f] dark:text-[#9fadbc] group-hover:text-[#172b4d] dark:group-hover:text-[#b6c2cf]">Two-step verification</span>
                                    <ExternalLink size={14} className="opacity-30 dark:text-[#9fadbc]" />
                                </button>
                                <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between p-4 border-2 border-[#f1f2f4] dark:border-[#333c44] hover:border-[#0c66e4] dark:hover:border-[#5794f7] hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-2xl transition-all group">
                                    <span className="text-sm font-bold text-[#44546f] dark:text-[#9fadbc] group-hover:text-[#172b4d] dark:group-hover:text-[#b6c2cf]">Change password</span>
                                    <ExternalLink size={14} className="opacity-30 dark:text-[#9fadbc]" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                            <div className="relative z-10 space-y-4">
                                <h2 className="text-base font-black">Workspace Pro</h2>
                                <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                                    You're on the premium plan. Enjoy unlimited boards and AI features.
                                </p>
                                <button className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95">
                                    Manage Plan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showEditModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1d2125] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 p-8 space-y-8 border dark:border-[#333c44]">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-[#172b4d] dark:text-[#b6c2cf]">Edit Profile</h2>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#333c44] rounded-full text-gray-400 transition-colors"><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 dark:text-[#9fadbc] uppercase tracking-widest">Full Name</label>
                                <input type="text" defaultValue={user.name} className="w-full p-4 bg-[#f4f5f7] dark:bg-[#1a1d21] rounded-2xl border-2 border-transparent focus:border-[#0c66e4] dark:focus:border-[#5794f7] transition-all font-bold text-[#172b4d] dark:text-[#b6c2cf] outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 dark:text-[#9fadbc] uppercase tracking-widest">Job Title</label>
                                <input type="text" placeholder="Product Manager" className="w-full p-4 bg-[#f4f5f7] dark:bg-[#1a1d21] rounded-2xl border-2 border-transparent focus:border-[#0c66e4] dark:focus:border-[#5794f7] transition-all font-bold text-[#172b4d] dark:text-[#b6c2cf] outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 dark:text-[#9fadbc] uppercase tracking-widest">Location</label>
                                <input type="text" placeholder="San Francisco, CA" className="w-full p-4 bg-[#f4f5f7] dark:bg-[#1a1d21] rounded-2xl border-2 border-transparent focus:border-[#0c66e4] dark:focus:border-[#5794f7] transition-all font-bold text-[#172b4d] dark:text-[#b6c2cf] outline-none" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowEditModal(false)} className="flex-1 px-8 py-3 rounded-xl font-black text-sm text-[#44546f] dark:text-[#9fadbc] hover:bg-gray-100 dark:hover:bg-[#333c44] transition-all">Cancel</button>
                            <button onClick={() => { handleAction('Profile update'); setShowEditModal(false); }} className="flex-1 px-8 py-3 rounded-xl font-black text-sm bg-[#0c66e4] text-white hover:bg-[#0055cc] shadow-lg shadow-blue-500/20 transition-all active:scale-95">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {showPasswordModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1d2125] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-8 space-y-8 text-center border dark:border-[#333c44]">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-[#0c66e4] dark:text-[#5794f7] rounded-2xl flex items-center justify-center mx-auto"><Lock size={32} /></div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-[#172b4d] dark:text-[#b6c2cf]">Change Password</h2>
                            <p className="text-sm font-medium text-[#44546f] dark:text-[#9fadbc]">Ensure your account is using a long, random password to stay secure.</p>
                        </div>
                        <div className="space-y-4">
                            <input type="password" placeholder="Current Password" className="w-full p-4 bg-[#f4f5f7] dark:bg-[#1a1d21] rounded-2xl border-2 border-transparent focus:border-[#0c66e4] dark:focus:border-[#5794f7] transition-all font-bold text-[#172b4d] dark:text-[#b6c2cf] outline-none" />
                            <input type="password" placeholder="New Password" className="w-full p-4 bg-[#f4f5f7] dark:bg-[#1a1d21] rounded-2xl border-2 border-transparent focus:border-[#0c66e4] dark:focus:border-[#5794f7] transition-all font-bold text-[#172b4d] dark:text-[#b6c2cf] outline-none" />
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowPasswordModal(false)} className="flex-1 px-8 py-3 rounded-xl font-black text-sm text-[#44546f] dark:text-[#9fadbc] hover:bg-gray-100 dark:hover:bg-[#333c44] transition-all">Cancel</button>
                            <button onClick={() => { handleAction('Password change'); setShowPasswordModal(false); }} className="flex-1 px-8 py-3 rounded-xl font-black text-sm bg-[#0c66e4] text-white hover:bg-[#0055cc] shadow-lg shadow-blue-500/20 transition-all active:scale-95">Update Password</button>
                        </div>
                    </div>
                </div>
            )}

            {show2FAModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1d2125] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-8 space-y-8 text-center border dark:border-[#333c44]">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto"><Smartphone size={32} /></div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-[#172b4d] dark:text-[#b6c2cf]">Two-Factor Auth</h2>
                            <p className="text-sm font-medium text-[#44546f] dark:text-[#9fadbc]">Add an extra layer of security to your account by configuring two-factor authentication.</p>
                        </div>
                        <button onClick={() => { handleAction('2FA activation'); setShow2FAModal(false); }} className="w-full py-4 bg-[#0c66e4] text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-[#0055cc] transition-all active:scale-95 uppercase tracking-widest text-sm">Enable 2FA</button>
                        <button onClick={() => setShow2FAModal(false)} className="w-full py-2 font-black text-sm text-[#44546f] dark:text-[#9fadbc] hover:text-[#172b4d] dark:hover:text-[#b6c2cf] transition-colors">Maybe later</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
