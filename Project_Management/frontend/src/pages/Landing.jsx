import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Rocket,
    Layout,
    Users,
    CheckCircle2,
    ArrowRight,
    Shield,
    Zap,
    Calendar,
    Layers,
    Star
} from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 overflow-auto bg-white scroll-smooth">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-32 bg-gradient-to-br from-[#0c66e4] via-[#0055cc] to-[#172b4d]">
                {/* Background Decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-300 rounded-full blur-[100px] -ml-32 -mb-32"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-sm font-bold tracking-wide">
                                <Star size={16} className="text-amber-300 fill-amber-300" />
                                <span>Trusted by over 10,000 teams worldwide</span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
                                ProjectX helps teams <span className="text-blue-200">move work forward</span>.
                            </h1>
                            <p className="text-xl text-blue-50/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                                Collaborate, manage projects, and reach new productivity peaks. From high rises to the home office, the way your team works is unique—accomplish it all with ProjectX.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="w-full sm:w-auto bg-white text-[#0c66e4] hover:bg-blue-50 px-10 py-5 rounded-xl font-black text-lg shadow-2xl shadow-blue-900/40 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    Get ProjectX for free <ArrowRight size={20} />
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full sm:w-auto bg-transparent border-2 border-white/30 text-white hover:bg-white/10 px-10 py-5 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2"
                                >
                                    Log in
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 relative animate-in fade-in zoom-in duration-1000">
                            <div className="relative z-10 bg-white/5 backdrop-blur-sm p-4 rounded-3xl border border-white/10 shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1542621334-a254cf47733d?auto=format&fit=crop&w=1200&q=80"
                                    className="rounded-2xl shadow-inner border border-white/5"
                                    alt="ProjectX Dashboard"
                                />
                                {/* Floating Cards */}
                                <div className="absolute -top-10 -right-10 bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 hidden lg:block animate-bounce-subtle">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <div className="font-black text-[#172b4d]">Done!</div>
                                            <div className="text-xs text-[#44546f] font-bold">Project launched</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 hidden lg:block">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <div className="font-black text-[#172b4d]">12+ Members</div>
                                            <div className="text-xs text-[#44546f] font-bold">Collaborating live</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-[#f9fafc]">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                        <h2 className="text-base font-black text-[#0c66e4] uppercase tracking-[0.2em]">Why Choose ProjectX?</h2>
                        <h3 className="text-4xl lg:text-5xl font-black text-[#172b4d] tracking-tight">Powerful features for productive teams</h3>
                        <p className="text-lg text-[#44546f] font-medium leading-relaxed">Everything you need to manage projects of any size. Built for speed, collaboration, and simplicity.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: Layers,
                                title: "Custom Boards",
                                desc: "Visualize your workflow with flexible boards, lists, and cards. Drag and drop your way to completion.",
                                colorClass: "bg-blue-50 text-blue-600"
                            },
                            {
                                icon: Zap,
                                title: "Smart Automation",
                                desc: "No-code automation is built into every board. Let robots do the tedious work for you.",
                                colorClass: "bg-emerald-50 text-emerald-600"
                            },
                            {
                                icon: Shield,
                                title: "Enterprise Security",
                                desc: "Bank-grade encryption and granular permissions keep your company data safe and private.",
                                colorClass: "bg-indigo-50 text-indigo-600"
                            },
                            {
                                icon: Users,
                                title: "Team Collaboration",
                                desc: "Invite members, assign tasks, and comment in real-time. Everyone stays in the loop.",
                                colorClass: "bg-purple-50 text-purple-600"
                            },
                            {
                                icon: Calendar,
                                title: "Timeline View",
                                desc: "See the big picture with timelines, calendars, and more. Never miss a deadline again.",
                                colorClass: "bg-orange-50 text-orange-600"
                            },
                            {
                                icon: Rocket,
                                title: "Ready-to-go Templates",
                                desc: "Don't start from scratch. Use our battle-tested templates to launch in seconds.",
                                colorClass: "bg-rose-50 text-rose-600"
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                                <div className={`w-16 h-16 rounded-2xl ${feature.colorClass} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                    <feature.icon size={32} />
                                </div>
                                <h4 className="text-xl font-black text-[#172b4d] mb-4">{feature.title}</h4>
                                <p className="text-[#44546f] font-medium leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter/CTA Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="bg-[#172b4d] rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                        <div className="relative z-10 space-y-10">
                            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight">Start doing more with ProjectX today</h2>
                            <p className="text-xl text-blue-100/70 max-w-2xl mx-auto font-medium">Join over 1,000,000 teams and start your journey towards modern project management.</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10">
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="w-full sm:w-80 px-8 py-5 rounded-xl border-none outline-none text-lg font-bold shadow-lg"
                                />
                                <button className="w-full sm:w-auto bg-[#0c66e4] text-white px-10 py-5 rounded-xl font-black text-lg hover:bg-blue-600 transition-all shadow-xl hover:-translate-y-1 active:scale-95">
                                    Try it for free
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 bg-gray-50 border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20 text-center md:text-left">
                        <div className="col-span-2 lg:col-span-1 space-y-6 flex flex-col items-center md:items-start">
                            <div className="flex items-center gap-2 font-black text-2xl text-[#0c66e4]">
                                <Layout size={28} className="fill-[#0c66e4]" />
                                <span>ProjectX</span>
                            </div>
                            <p className="text-sm font-medium text-[#44546f]">The world's most popular collaboration tool.</p>
                        </div>
                        <div>
                            <h5 className="font-black text-[#172b4d] mb-6 uppercase tracking-wider text-xs">Product</h5>
                            <ul className="space-y-4 text-sm font-bold text-[#44546f]">
                                <li className="hover:text-[#0c66e4] cursor-pointer">Templates</li>
                                <li className="hover:text-[#0c66e4] cursor-pointer">Guide</li>
                                <li className="hover:text-[#0c66e4] cursor-pointer">Security</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-black text-[#172b4d] mb-6 uppercase tracking-wider text-xs">Company</h5>
                            <ul className="space-y-4 text-sm font-bold text-[#44546f]">
                                <li className="hover:text-[#0c66e4] cursor-pointer">About</li>
                                <li className="hover:text-[#0c66e4] cursor-pointer">Jobs</li>
                                <li className="hover:text-[#0c66e4] cursor-pointer">Contact</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-black text-[#172b4d] mb-6 uppercase tracking-wider text-xs">Support</h5>
                            <ul className="space-y-4 text-sm font-bold text-[#44546f]">
                                <li className="hover:text-[#0c66e4] cursor-pointer">Help Center</li>
                                <li className="hover:text-[#0c66e4] cursor-pointer">Webinars</li>
                                <li className="hover:text-[#0c66e4] cursor-pointer">System Status</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-black text-[#a5adba] uppercase tracking-[0.2em]">
                        <span>&copy; 2026 ProjectX, Inc. All rights reserved.</span>
                        <div className="flex gap-10">
                            <span className="hover:text-[#0c66e4] cursor-pointer">Privacy</span>
                            <span className="hover:text-[#0c66e4] cursor-pointer">Terms</span>
                            <span className="hover:text-[#0c66e4] cursor-pointer">Cookies</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
