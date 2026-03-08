import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, Layout, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailParam = params.get('email');
        if (emailParam) {
            setEmail(emailParam);
            toast('Email pre-filled from registration', { icon: '📧', position: 'bottom-center' });
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading('Logging in to ProjectX...');
        try {
            const { data } = await API.post('/auth/login', { email, password });
            login(data);
            toast.success(`Welcome back, ${data.name}!`, { id: loadingToast });
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            toast.error(msg, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-48px)] relative bg-[#f9fafc] dark:bg-[#111418] flex flex-col items-center justify-center p-4">
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 flex items-center gap-2 text-[#44546f] dark:text-[#9fadbc] hover:text-[#0c66e4] dark:hover:text-[#5794f7] font-bold text-sm transition-colors py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1d2125]"
            >
                <ArrowLeft size={16} /> Back to Home
            </button>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-40 dark:opacity-10">
                <div className="absolute -top-24 -left-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-100 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-[400px] bg-white dark:bg-[#1d2125] rounded-lg shadow-[0_12px_32px_rgba(149,157,165,0.25)] dark:shadow-none p-10 border border-[#dfe1e6] dark:border-[#333c44] animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center justify-center gap-2 mb-8 select-none cursor-pointer" onClick={() => navigate('/')}>
                    <Layout size={28} className="fill-[#0c66e4] text-[#0c66e4]" />
                    <span className="text-3xl font-black text-[#172b4d] dark:text-[#b6c2cf] tracking-tight">ProjectX</span>
                </div>

                <h1 className="text-base font-bold text-center text-[#44546f] dark:text-[#9fadbc] mb-8 tracking-tight">Log in to your account</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            required
                            className="w-full px-4 py-3 border-2 border-[#dfe1e6] dark:border-[#333c44] rounded-xl bg-transparent focus:bg-white dark:focus:bg-[#1d2125] focus:border-[#0c66e4] dark:focus:border-[#5794f7] outline-none transition-all text-sm font-bold shadow-inner placeholder:text-gray-400 dark:placeholder:text-[#9fadbc] text-[#172b4d] dark:text-white"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                        />
                    </div>

                    <div className="relative group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            autoComplete="current-password"
                            required
                            className="w-full px-4 py-3 border-2 border-[#dfe1e6] dark:border-[#333c44] rounded-xl bg-transparent focus:bg-white dark:focus:bg-[#1d2125] focus:border-[#0c66e4] dark:focus:border-[#5794f7] outline-none transition-all text-sm font-bold pr-12 shadow-inner placeholder:text-gray-400 dark:placeholder:text-[#9fadbc] text-[#172b4d] dark:text-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#44546f] hover:text-[#0c66e4] transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0c66e4] text-white font-black py-4 rounded-xl hover:bg-[#0055cc] transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/20 text-sm tracking-wide uppercase flex items-center justify-center gap-3 mt-4"
                    >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        Log in
                    </button>
                </form>


                <div className="mt-8 pt-6 border-t border-[#dfe1e6] text-center space-y-4">
                    <p className="text-sm font-bold text-[#44546f]">New to ProjectX? <Link to="/register" className="text-[#0c66e4] hover:underline">Sign up</Link></p>
                    <div className="flex justify-center gap-6 text-[10px] text-[#44546f] font-black uppercase tracking-widest">
                        <span className="hover:text-[#0c66e4] cursor-pointer">Privacy</span>
                        <span className="hover:text-[#0c66e4] cursor-pointer">Terms</span>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default Login;


                                                            