import { GoogleGenAI } from "@google/genai";
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { LogIn, Users, Star, LogOut, Search, Filter, Mail, ChevronRight, Check, X, MapPin, Globe, Award, Briefcase, Calendar, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-zinc-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-12">
            <Link to="/influencers" className="flex items-center">
              <img 
                src="https://www.realizenetworks.com/wp-content/uploads/2023/05/logo-realize.png" 
                alt="Realize Networks" 
                className="h-8 w-auto"
                onError={(e) => {
                  // Fallback if the black logo doesn't exist at that path
                  (e.target as HTMLImageElement).src = 'https://www.realizenetworks.com/wp-content/uploads/2023/05/logo-realize-bianco.png';
                  (e.target as HTMLImageElement).classList.add('invert');
                }}
              />
              <span className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-1">Tool</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/influencers" className="text-xs font-bold uppercase tracking-widest text-zinc-900 hover:text-realize-purple transition-colors">Talents</Link>
              <Link to="/shortlist" className="text-xs font-bold uppercase tracking-widest text-zinc-900 hover:text-realize-purple transition-colors">Brief & Wishlist</Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-zinc-900 uppercase tracking-tight">{user.name}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{user.role.replace('_', ' ')}</p>
            </div>
            <div className="h-8 w-px bg-zinc-100 mx-2" />
            <button 
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-realize-purple transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button className="md:hidden p-2 text-zinc-900">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'luxury' }) => {
  const variants = {
    default: 'bg-zinc-100 text-zinc-600',
    indigo: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border border-rose-100',
    luxury: 'bg-linear-to-r from-realize-purple to-realize-blue text-white shadow-lg shadow-indigo-200/50',
  };
  return (
    <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em]", variants[variant])}>
      {children}
    </span>
  );
};

// --- Pages ---

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-realize-dark flex flex-col relative overflow-hidden selection:bg-realize-purple/30 selection:text-white">
      {/* Background Gradients */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-realize-purple/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-realize-blue/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-8 max-w-7xl mx-auto w-full backdrop-blur-sm">
        <img 
          src="https://www.realizenetworks.com/wp-content/uploads/2023/05/logo-realize-bianco.png" 
          alt="Realize Networks" 
          className="h-10"
        />
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-3 text-xs font-black text-white uppercase tracking-widest hover:text-realize-yellow transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="px-8 py-3 bg-white text-realize-dark rounded-full text-xs font-black uppercase tracking-widest hover:bg-realize-yellow transition-all"
          >
            Registrati
          </button>
        </div>
      </nav>

      <main className="relative z-10 pt-32">
        {/* ROW 1: HERO */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter mb-8 leading-[0.85]">
              The <span className="realize-gradient-text">Ultimate</span> <br />
              <span className="text-realize-blue">Talent</span> Hub
            </h1>
            <p className="text-zinc-400 text-lg md:text-2xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
              La piattaforma definitiva per agenzie e media center per gestire, 
              analizzare e collaborare con i migliori talenti digitali.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => navigate('/signup')}
                className="px-10 py-5 bg-linear-to-r from-realize-purple to-realize-blue text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-indigo-500/20 transition-all"
              >
                Inizia Ora
              </button>
              <button 
                onClick={() => document.getElementById('discovery')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
              >
                Scopri di più
              </button>
            </div>
          </motion.div>
        </section>

        {/* ROW 2: DISCOVERY */}
        <section id="discovery" className="py-40 border-t border-white/5 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="w-16 h-1 bg-realize-purple" />
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                Talent <br /> <span className="text-realize-purple">Discovery</span>
              </h2>
              <p className="text-zinc-400 text-xl leading-relaxed">
                Accedi a un database esclusivo di talenti. Filtra per verticali, 
                engagement rate, location e presenza media. Trova il match perfetto 
                per la tua campagna in pochi secondi.
              </p>
            </motion.div>
            <div className="bg-white/5 rounded-[3rem] aspect-video border border-white/10 flex items-center justify-center relative overflow-hidden group">
              <Search className="w-24 h-24 text-realize-purple opacity-20 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-linear-to-tr from-realize-purple/20 to-transparent" />
            </div>
          </div>
        </section>

        {/* ROW 3: MANAGEMENT */}
        <section className="py-40 border-t border-white/5 px-8 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1 bg-white/5 rounded-[3rem] aspect-video border border-white/10 flex items-center justify-center relative overflow-hidden group">
              <Star className="w-24 h-24 text-realize-yellow opacity-20 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-linear-to-bl from-realize-yellow/10 to-transparent" />
            </div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8 order-1 md:order-2"
            >
              <div className="w-16 h-1 bg-realize-yellow" />
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                Smart <br /> <span className="text-realize-yellow">Wishlist</span>
              </h2>
              <p className="text-zinc-400 text-xl leading-relaxed">
                Organizza i tuoi talenti preferiti in liste dedicate. 
                Condividi le selezioni con il tuo team e monitora la 
                disponibilità in tempo reale per ogni progetto.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ROW 4: BRIEFING */}
        <section className="py-40 border-t border-white/5 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="w-16 h-1 bg-realize-blue" />
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                Creative <br /> <span className="text-realize-blue">Briefing</span>
              </h2>
              <p className="text-zinc-400 text-xl leading-relaxed">
                Crea brief professionali completi di obiettivi, brand values 
                e creative direction. Genera automaticamente proposte per i 
                talenti selezionati.
              </p>
            </motion.div>
            <div className="bg-white/5 rounded-[3rem] aspect-video border border-white/10 flex items-center justify-center relative overflow-hidden group">
              <Briefcase className="w-24 h-24 text-realize-blue opacity-20 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-linear-to-br from-realize-blue/20 to-transparent" />
            </div>
          </div>
        </section>

        {/* ROW 5: ANALYTICS */}
        <section className="py-40 border-t border-white/5 px-8 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1 bg-white/5 rounded-[3rem] aspect-video border border-white/10 flex items-center justify-center relative overflow-hidden group">
              <Award className="w-24 h-24 text-emerald-500 opacity-20 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-linear-to-tr from-emerald-500/10 to-transparent" />
            </div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8 order-1 md:order-2"
            >
              <div className="w-16 h-1 bg-emerald-500" />
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                Data <br /> <span className="text-emerald-500">Insights</span>
              </h2>
              <p className="text-zinc-400 text-xl leading-relaxed">
                Analizza le performance storiche e i case studies. 
                Prendi decisioni basate sui dati reali per massimizzare 
                il ROI delle tue campagne di influencer marketing.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-40 border-t border-white/5 text-center px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-linear-to-r from-realize-purple/20 to-realize-blue/20 p-20 rounded-[4rem] border border-white/10"
          >
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-12">
              Pronto a gestire i tuoi <br /> talenti come un pro?
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => navigate('/signup')}
                className="px-12 py-6 bg-white text-realize-dark rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:bg-realize-yellow transition-all"
              >
                Registrati Ora
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="px-12 py-6 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
              >
                Login
              </button>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">
          © 2024 Realize Networks • All Rights Reserved
        </p>
      </footer>
    </div>
  );
};

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'media_center' | 'admin'>('media_center');
  const [error, setError] = useState('');
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Frontend restriction check
    if (email !== 'info@media.com') {
      setError('Registration is restricted to authorized users only.');
      return;
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role }),
    });
    if (res.ok) {
      const user = await res.json();
      setUser(user);
      navigate('/influencers');
    } else {
      const data = await res.json();
      setError(data.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-realize-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-realize-purple/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-realize-blue/20 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <img 
            src="https://www.realizenetworks.com/wp-content/uploads/2023/05/logo-realize.png" 
            alt="Realize Networks" 
            className="h-10 mx-auto mb-6"
          />
          <h1 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] mb-2">Create Account</h1>
          <p className="text-zinc-500 text-sm">Join the Realize ecosystem today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:ring-2 focus:ring-realize-purple outline-none transition-all font-medium"
              placeholder="John Doe"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:ring-2 focus:ring-realize-purple outline-none transition-all font-medium"
              placeholder="name@agency.com"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:ring-2 focus:ring-realize-purple outline-none transition-all font-medium"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Role</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:ring-2 focus:ring-realize-purple outline-none transition-all font-medium appearance-none"
            >
              <option value="media_center">Media Center</option>
              <option value="admin">Admin / Agency</option>
            </select>
          </div>
          {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-linear-to-r from-realize-purple to-realize-blue text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-4"
          >
            Sign Up <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-400 font-bold">
          Already have an account? <Link to="/login" className="text-realize-purple hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const user = await res.json();
      setUser(user);
      navigate('/influencers');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-realize-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-realize-purple/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-realize-blue/20 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <img 
            src="https://www.realizenetworks.com/wp-content/uploads/2023/05/logo-realize.png" 
            alt="Realize Networks" 
            className="h-10 mx-auto mb-6"
          />
          <h1 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] mb-2">Access Portal</h1>
          <p className="text-zinc-500 text-sm">Enter your credentials to manage talents</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:ring-2 focus:ring-realize-purple outline-none transition-all font-medium"
              placeholder="name@agency.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:ring-2 focus:ring-realize-purple outline-none transition-all font-medium"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-linear-to-r from-realize-purple to-realize-blue text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-4"
          >
            Sign In <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-400 font-bold">
          Don't have an account? <Link to="/signup" className="text-realize-purple hover:underline">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
};

const InfluencerListPage = () => {
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [selectedVerticals, setSelectedVerticals] = useState<string[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [followerRange, setFollowerRange] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/influencers')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setInfluencers(data);
        } else {
          setInfluencers([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setInfluencers([]);
        setLoading(false);
      });
  }, []);

  const toggleFilter = (filter: string) => {
    setFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const toggleVertical = (v: string) => {
    setSelectedVerticals(prev => 
      prev.includes(v) ? prev.filter(item => item !== v) : [...prev, v]
    );
  };

  const toggleMedia = (m: string) => {
    setSelectedMedia(prev => 
      prev.includes(m) ? prev.filter(item => item !== m) : [...prev, m]
    );
  };

  const allVerticals = Array.isArray(influencers) 
    ? Array.from(new Set(influencers.flatMap(inf => inf.verticals || []))).sort()
    : [];

  const filtered = (Array.isArray(influencers) ? influencers : []).filter(inf => {
    const matchesSearch = inf.name.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(inf.verticals) && inf.verticals.some((v: string) => v.toLowerCase().includes(search.toLowerCase())));
    
    if (!matchesSearch) return false;

    // Profile Filters
    if (filters.length > 0) {
      const matchesProfile = filters.every(f => {
        if (f === 'Professional') return !!inf.professional;
        if (f === 'Events') return !!inf.available_for_events;
        if (f === 'Ambassador') return !!inf.available_ambassador;
        if (f === 'Works Abroad') return !!inf.works_abroad;
        if (f === 'Has Case Studies') return !!inf.has_case_studies;
        return true;
      });
      if (!matchesProfile) return false;
    }

    // Vertical Filters
    if (selectedVerticals.length > 0) {
      const matchesVertical = Array.isArray(inf.verticals) && selectedVerticals.some(v => inf.verticals.includes(v));
      if (!matchesVertical) return false;
    }

    // Media Filters
    if (selectedMedia.length > 0) {
      const matchesMedia = selectedMedia.every(m => {
        if (m === 'TV') return !!inf.media_tv;
        if (m === 'Radio') return !!inf.media_radio;
        if (m === 'Press') return !!inf.media_press;
        return true;
      });
      if (!matchesMedia) return false;
    }

    // Follower Range
    if (followerRange) {
      const count = inf.follower_ig || 0;
      if (followerRange === '> 1M' && count < 1000000) return false;
      if (followerRange === '500k - 1M' && (count < 500000 || count > 1000000)) return false;
      if (followerRange === '< 500k' && count >= 500000) return false;
    }

    return true;
  });

  const addToShortlist = async (id: number) => {
    await fetch(`/api/shortlist/${id}`, { method: 'POST' });
    alert('Added to shortlist!');
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter">
            in <span className="realize-gradient-text">Talent</span> we <span className="text-realize-blue">Trust</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg font-medium">
            Discover the most influential voices in the Realize Networks ecosystem.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-32 space-y-8">
              <div>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-6">Search</h3>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                  <input 
                    type="text"
                    placeholder="Talent name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-realize-purple outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-6">Profile</h3>
                <div className="space-y-4">
                  {['Professional', 'Events', 'Ambassador', 'Works Abroad', 'Has Case Studies'].map(filter => (
                    <label 
                      key={filter} 
                      className="flex items-center gap-3 group cursor-pointer"
                      onClick={() => toggleFilter(filter)}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                        filters.includes(filter) 
                          ? "bg-realize-purple border-realize-purple" 
                          : "bg-white border-zinc-200 group-hover:border-realize-purple"
                      )}>
                        <Check className={cn(
                          "w-3 h-3 text-white transition-opacity",
                          filters.includes(filter) ? "opacity-100" : "opacity-0"
                        )} />
                      </div>
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-widest transition-colors",
                        filters.includes(filter) ? "text-realize-purple" : "text-zinc-600"
                      )}>
                        {filter}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-6">Media Presence</h3>
                <div className="space-y-4">
                  {['TV', 'Radio', 'Press'].map(m => (
                    <label 
                      key={m} 
                      className="flex items-center gap-3 group cursor-pointer"
                      onClick={() => toggleMedia(m)}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                        selectedMedia.includes(m) 
                          ? "bg-realize-blue border-realize-blue" 
                          : "bg-white border-zinc-200 group-hover:border-realize-blue"
                      )}>
                        <Check className={cn(
                          "w-3 h-3 text-white transition-opacity",
                          selectedMedia.includes(m) ? "opacity-100" : "opacity-0"
                        )} />
                      </div>
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-widest transition-colors",
                        selectedMedia.includes(m) ? "text-realize-blue" : "text-zinc-600"
                      )}>
                        {m}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-6">Followers (IG)</h3>
                <div className="space-y-4">
                  {['> 1M', '500k - 1M', '< 500k'].map(range => (
                    <label 
                      key={range} 
                      className="flex items-center gap-3 group cursor-pointer"
                      onClick={() => setFollowerRange(followerRange === range ? null : range)}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                        followerRange === range 
                          ? "bg-realize-yellow border-realize-yellow" 
                          : "bg-white border-zinc-200 group-hover:border-realize-yellow"
                      )}>
                        <div className={cn(
                          "w-2 h-2 bg-white rounded-full transition-opacity",
                          followerRange === range ? "opacity-100" : "opacity-0"
                        )} />
                      </div>
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-widest transition-colors",
                        followerRange === range ? "text-realize-yellow" : "text-zinc-600"
                      )}>
                        {range}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-6">Verticals</h3>
                <div className="flex flex-wrap gap-2">
                  {allVerticals.map(v => (
                    <button
                      key={v}
                      onClick={() => toggleVertical(v)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        selectedVerticals.includes(v)
                          ? "bg-realize-purple border-realize-purple text-white shadow-lg shadow-realize-purple/20"
                          : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-realize-purple hover:text-realize-purple"
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-100">
                <button 
                  onClick={() => { 
                    setFilters([]); 
                    setSearch(''); 
                    setSelectedVerticals([]);
                    setSelectedMedia([]);
                    setFollowerRange(null);
                  }}
                  className="text-[10px] font-black text-realize-purple uppercase tracking-[0.2em] hover:text-realize-blue transition-colors realize-btn-arrow"
                >
                  Reset all
                </button>
              </div>
            </div>
          </div>

          {/* Talent Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
                Best <span className="text-realize-blue">branded</span> content
              </h2>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{filtered.length} Talents found</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-3/4 bg-zinc-50 rounded-[2.5rem] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filtered.length > 0 ? (
                  filtered.map(inf => (
                    <motion.div 
                      key={inf.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="realize-card group relative aspect-3/4"
                    >
                      <img 
                        src={inf.avatar_url} 
                        alt={inf.name} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-realize-dark/90 via-realize-dark/20 to-transparent" />
                      
                      <div className="absolute top-6 left-6 flex flex-col gap-2">
                        <Badge variant="luxury">{inf.engagement_rate}% ER</Badge>
                        <div className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-2">
                          <Award className="w-3 h-3 text-realize-yellow" />
                          <span className="text-[8px] font-black text-white uppercase tracking-widest">Case Studies</span>
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <div className="mb-4">
                          <h3 className="text-2xl font-black text-white tracking-tight mb-1">{inf.name}</h3>
                          <p className="text-zinc-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-realize-blue" /> {inf.location}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {Array.isArray(inf.verticals) && inf.verticals.slice(0, 2).map((v: string) => (
                            <span key={v} className="px-2 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-[8px] font-black text-white uppercase tracking-widest">
                              {v}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-3">
                          <Link 
                            to={`/influencers/${inf.id}`}
                            className="flex-1 bg-white text-realize-dark text-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-realize-yellow transition-all"
                          >
                            View Profile
                          </Link>
                          <button 
                            onClick={() => addToShortlist(inf.id)}
                            className="p-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl hover:bg-realize-purple transition-all"
                          >
                            <Star className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-8 h-8 text-zinc-200" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 tracking-tight mb-2">No talents found</h3>
                    <p className="text-zinc-400 text-sm font-medium">Try adjusting your filters or search terms.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="bg-realize-dark py-20 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
            Ti va un progetto <span className="text-realize-yellow">insieme?</span>
          </h2>
          <button className="text-white text-xl font-black uppercase tracking-[0.2em] hover:text-realize-blue transition-colors realize-btn-arrow">
            Contattaci
          </button>
        </div>
      </div>
    </div>
  );
};

const InfluencerDetailPage = () => {
  const { id } = useParams();
  const [inf, setInf] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/influencers/${id}`)
      .then(res => res.json())
      .then(data => {
        setInf(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-12 h-12 border-4 border-realize-purple border-t-transparent rounded-full animate-spin" />
  </div>;
  if (!inf) return <div className="p-8 text-center">Influencer not found</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link to="/influencers" className="inline-flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] hover:text-realize-purple transition-colors mb-12">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Talents
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left: Visuals */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-3/4 rounded-[3rem] overflow-hidden shadow-2xl shadow-zinc-200"
            >
              <img src={inf.avatar_url} alt={inf.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-50 p-6 rounded-[2rem] text-center">
                <p className="text-2xl font-black text-realize-purple">{inf.engagement_rate}%</p>
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1">ER</p>
              </div>
              <div className="bg-zinc-50 p-6 rounded-[2rem] text-center">
                <p className="text-2xl font-black text-realize-blue">{(inf.follower_ig / 1000000).toFixed(1)}M</p>
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1">IG</p>
              </div>
              <div className="bg-zinc-50 p-6 rounded-[2rem] text-center">
                <p className="text-2xl font-black text-zinc-900">{inf.follower_tiktok ? (inf.follower_tiktok / 1000).toFixed(0) + 'K' : 'N/A'}</p>
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1">TikTok</p>
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-7 space-y-12">
            <div>
              <div className="flex flex-wrap gap-2 mb-6">
                {inf.professional && <Badge variant="luxury">Professional</Badge>}
                {inf.available_ambassador && <Badge variant="amber">Ambassador</Badge>}
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter mb-6">{inf.name}</h1>
              <p className="text-xl text-zinc-500 font-medium leading-relaxed max-w-2xl">{inf.bio_short}</p>
            </div>

            <div className="grid grid-cols-2 gap-8 py-8 border-y border-zinc-100">
              <div>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4">Location</h3>
                <p className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-realize-blue" /> {inf.location}
                </p>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4">Verticals</h3>
                <div className="flex flex-wrap gap-2">
                  {inf.verticals.map((v: string) => (
                    <span key={v} className="text-sm font-bold text-zinc-900">{v}</span>
                  ))}
                </div>
              </div>
            </div>

            <section>
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-8">Case Studies</h3>
              <div className="space-y-6">
                {inf.case_studies.map((cs: any) => (
                  <div 
                    key={cs.id} 
                    onClick={() => setSelectedCase(cs)}
                    className="group p-8 rounded-[2.5rem] bg-zinc-50 border border-zinc-100 hover:bg-white hover:shadow-xl transition-all duration-500 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-[9px] font-black text-realize-purple uppercase tracking-[0.2em] mb-2">{cs.brand}</p>
                        <h4 className="text-xl font-black text-zinc-900 tracking-tight">{cs.title}</h4>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Deliverables</p>
                        <p className="text-sm font-bold text-zinc-700">{cs.deliverables}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Results</p>
                        <p className="text-sm font-black text-emerald-600">{cs.results_kpi}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex items-center gap-6 pt-8">
              <button 
                onClick={() => fetch(`/api/shortlist/${inf.id}`, { method: 'POST' }).then(() => alert('Added to wishlist!'))}
                className="flex-1 bg-realize-dark text-white font-black uppercase tracking-[0.2em] py-6 rounded-[2rem] hover:bg-realize-purple transition-all shadow-xl shadow-zinc-200"
              >
                Add to Wishlist
              </button>
              <Link 
                to="/shortlist"
                className="flex-1 bg-white border border-zinc-200 text-realize-dark text-center font-black uppercase tracking-[0.2em] py-6 rounded-[2rem] hover:bg-zinc-50 transition-all"
              >
                Start Brief
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Case Study Modal */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-realize-dark/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-realize-purple flex items-center justify-center text-white">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-realize-purple uppercase tracking-widest">{selectedCase.brand}</p>
                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">{selectedCase.title}</h3>
                  </div>
                </div>
                <button onClick={() => setSelectedCase(null)} className="p-3 hover:bg-zinc-200 rounded-full transition-colors">
                  <X className="w-6 h-6 text-zinc-500" />
                </button>
              </div>
              
              <div className="p-10 space-y-10">
                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Objective</h4>
                    <p className="text-lg font-bold text-zinc-900">{selectedCase.objective}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Results KPI</h4>
                    <p className="text-lg font-black text-emerald-600">{selectedCase.results_kpi}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Deliverables</h4>
                  <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-zinc-600 leading-relaxed">{selectedCase.deliverables}</p>
                  </div>
                </div>

                {selectedCase.link && (
                  <div className="pt-4">
                    <a 
                      href={selectedCase.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-black text-realize-blue uppercase tracking-widest hover:underline underline-offset-8"
                    >
                      View Campaign Link <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                )}

                <button 
                  onClick={() => setSelectedCase(null)}
                  className="w-full bg-realize-dark text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-realize-purple transition-all"
                >
                  Close Case Study
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ShortlistPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [recentBriefs, setRecentBriefs] = useState<any[]>([]);
  const [step, setStep] = useState<'review' | 'brief'>('review');
  const [briefStep, setBriefStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuthStore();

  // Brief Data
  const [brief, setBrief] = useState({
    campaignName: 'Realize Campaign 2026',
    brandName: '',
    brandValues: '',
    objectives: [] as string[],
    targetAudience: '',
    budget: '',
    timeline: '',
    creativeDirection: '',
    keyMessages: '',
    competitors: '',
    notes: ''
  });

  useEffect(() => {
    fetch('/api/shortlist')
      .then(res => res.json())
      .then(setItems);
    
    fetch('/api/briefs')
      .then(res => res.json())
      .then(setRecentBriefs);
  }, []);

  const removeItem = async (id: number) => {
    await fetch(`/api/shortlist/${id}`, { method: 'DELETE' });
    setItems(items.filter(i => i.id !== id));
  };

  const handleBriefChange = (field: string, value: any) => {
    setBrief(prev => ({ ...prev, [field]: value }));
  };

  const toggleObjective = (obj: string) => {
    setBrief(prev => ({
      ...prev,
      objectives: prev.objectives.includes(obj) 
        ? prev.objectives.filter(o => o !== obj)
        : [...prev.objectives, obj]
    }));
  };

  const generateEmail = () => {
    const subject = `[BRIEF] ${brief.campaignName} – ${brief.brandName} – Agency: ${user?.name}`;
    const body = `
GENTILE TEAM REALIZE NETWORKS,

Di seguito il brief dettagliato per la campagna "${brief.campaignName}" del brand "${brief.brandName}".

--- SELEZIONE TALENTI ---
${items.map(inf => `• ${inf.name.toUpperCase()} (ER: ${inf.engagement_rate}%, Niche: ${inf.verticals.join(', ')})`).join('\n')}

--- IDENTITÀ BRAND ---
VALORI BRAND: ${brief.brandValues || 'Non specificati'}
COMPETITORS: ${brief.competitors || 'Non specificati'}

--- DETTAGLI CAMPAGNA ---
OBIETTIVI: ${brief.objectives.join(', ') || 'Non specificati'}
TARGET: ${brief.targetAudience || 'Non specificato'}
BUDGET: ${brief.budget || 'Non specificato'}
TIMELINE: ${brief.timeline || 'Non specificata'}

--- DIREZIONE CREATIVA ---
TONE OF VOICE / CREATIVITÀ: ${brief.creativeDirection || 'Non specificata'}
KEY MESSAGES: ${brief.keyMessages || 'Non specificati'}

NOTE AGGIUNTIVE: ${brief.notes || 'Nessuna nota specifica.'}

--- CONTATTO AGENZIA ---
Nome: ${user?.name}
Email: ${user?.email}

Cordiali saluti,
Generato tramite Realize-tool
    `.trim();

    return { subject, body };
  };

  const copyToClipboard = async () => {
    const { subject, body } = generateEmail();
    
    // Save to database
    try {
      await fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...brief,
          influencerIds: items.map(i => i.id)
        })
      });
    } catch (err) {
      console.error('Failed to save brief:', err);
    }

    navigator.clipboard.writeText(`To: info@realizenetworks.com\nSubject: ${subject}\n\n${body}`);
    alert('Brief saved and summary copied to clipboard! You can now paste it into your email client.');
    setShowPreview(false);
    setStep('review');
  };

  const suggestCreative = async () => {
    if (!brief.brandName || !brief.brandValues) {
      alert('Please fill in Brand Name and Values first for better suggestions.');
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
      As a senior creative director at Realize Networks, suggest a creative direction and 3 key messages for a campaign.
      Brand: ${brief.brandName}
      Brand Values: ${brief.brandValues}
      Objectives: ${brief.objectives.join(', ')}
      Target Audience: ${brief.targetAudience}
      
      Return a JSON object with "creativeDirection" (string) and "keyMessages" (string).
      Keep it professional, premium, and focused on influencer marketing.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      if (result.creativeDirection) handleBriefChange('creativeDirection', result.creativeDirection);
      if (result.keyMessages) handleBriefChange('keyMessages', result.keyMessages);
    } catch (err) {
      console.error('AI Suggestion failed:', err);
      alert('Could not generate suggestions at this moment.');
    }
  };

  const triggerQuickEmail = () => {
    const subject = encodeURIComponent('New Campaign Brief');
    const body = encodeURIComponent(`Hello Realize Networks,\n\nI would like to start a new campaign brief.\n\nCampaign Name: [Enter Name]\nBrand: [Enter Brand]\nObjectives: [Enter Objectives]\n\nSelected Talents:\n${items.map(i => `- ${i.name}`).join('\n')}\n\nBest regards,\n${user?.name}`);
    window.location.href = `mailto:info@realizenetworks.com?subject=${subject}&body=${body}`;
  };

  const renderBriefStep = () => {
    switch (briefStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-xl font-black text-white tracking-tight">Brand & Campaign Identity</h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Brand Name</label>
                  <input 
                    type="text" 
                    value={brief.brandName}
                    onChange={(e) => handleBriefChange('brandName', e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-realize-blue outline-none font-bold text-white"
                    placeholder="e.g. Barilla, Amazon..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Brand Values & Identity</label>
                  <textarea 
                    value={brief.brandValues}
                    onChange={(e) => handleBriefChange('brandValues', e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-realize-blue outline-none font-medium text-zinc-300 resize-none"
                    placeholder="What does the brand stand for?"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Campaign Name</label>
                  <input 
                    type="text" 
                    value={brief.campaignName}
                    onChange={(e) => handleBriefChange('campaignName', e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-realize-blue outline-none font-bold text-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-black text-white tracking-tight">Objectives & Target</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Awareness', 'Conversion', 'Engagement', 'Traffic', 'Brand Loyalty', 'Lead Gen'].map(obj => (
                  <button
                    key={obj}
                    onClick={() => toggleObjective(obj)}
                    className={cn(
                      "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                      brief.objectives.includes(obj) 
                        ? "bg-realize-purple border-realize-purple text-white" 
                        : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/30"
                    )}
                  >
                    {obj}
                  </button>
                ))}
              </div>
              <div className="space-y-2 pt-4">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Target Audience</label>
                <textarea 
                  value={brief.targetAudience}
                  onChange={(e) => handleBriefChange('targetAudience', e.target.value)}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-realize-blue outline-none font-medium text-zinc-300 resize-none"
                  placeholder="Describe your ideal customer..."
                  rows={3}
                />
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-black text-white tracking-tight">Budget & Timeline</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Budget</label>
                  <div className="space-y-4">
                    <select 
                      value={['< 5k', '5k - 15k', '15k - 50k', '50k+', ''].includes(brief.budget) ? brief.budget : 'custom'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          handleBriefChange('budget', '€');
                        } else {
                          handleBriefChange('budget', val);
                        }
                      }}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-realize-blue outline-none font-bold text-white appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-realize-dark">Select range...</option>
                      <option value="< 5k" className="bg-realize-dark">Under €5,000</option>
                      <option value="5k - 15k" className="bg-realize-dark">€5,000 - €15,000</option>
                      <option value="15k - 50k" className="bg-realize-dark">€15,000 - €50,000</option>
                      <option value="50k+" className="bg-realize-dark">€50,000+</option>
                      <option value="custom" className="bg-realize-dark">Custom Amount...</option>
                    </select>
                    
                    {(!['< 5k', '5k - 15k', '15k - 50k', '50k+', ''].includes(brief.budget)) && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <input 
                          type="text" 
                          value={brief.budget}
                          onChange={(e) => handleBriefChange('budget', e.target.value)}
                          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-realize-blue outline-none font-bold text-white"
                          placeholder="Enter custom amount (e.g. €25,000)"
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Timeline</label>
                  <input 
                    type="text" 
                    value={brief.timeline}
                    onChange={(e) => handleBriefChange('timeline', e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-realize-blue outline-none font-bold text-white"
                    placeholder="e.g. Q3 2026, Christmas Campaign..."
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white tracking-tight">Creative Direction</h3>
                <button 
                  onClick={suggestCreative}
                  className="px-4 py-2 bg-realize-purple/20 border border-realize-purple/30 rounded-xl text-[9px] font-black text-realize-purple uppercase tracking-widest hover:bg-realize-purple/30 transition-all flex items-center gap-2"
                >
                  <Star className="w-3 h-3" /> Suggest with AI
                </button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Tone of Voice / Creativity</label>
                  <textarea 
                    value={brief.creativeDirection}
                    onChange={(e) => handleBriefChange('creativeDirection', e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-realize-blue outline-none font-medium text-zinc-300 resize-none"
                    placeholder="How should the influencers talk about the brand?"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Key Messages</label>
                  <textarea 
                    value={brief.keyMessages}
                    onChange={(e) => handleBriefChange('keyMessages', e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-realize-blue outline-none font-medium text-zinc-300 resize-none"
                    placeholder="What are the must-say points?"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Main Competitors</label>
                  <input 
                    type="text" 
                    value={brief.competitors}
                    onChange={(e) => handleBriefChange('competitors', e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-realize-blue outline-none font-bold text-white"
                    placeholder="Who are we competing with?"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 className="text-5xl font-black text-zinc-900 tracking-tighter mb-4">
            {step === 'review' ? <>Your <span className="text-realize-blue">Shortlist</span></> : <>Build your <span className="text-realize-purple">Brief</span></>}
          </h1>
          <p className="text-zinc-400 font-medium text-lg">
            {step === 'review' 
              ? "Review your selected talents before defining the campaign details." 
              : "Guide Realize Networks with a detailed brief to ensure the best campaign execution."}
          </p>
        </div>
        <div className="bg-zinc-50 px-8 py-4 rounded-[2rem] border border-zinc-100 flex items-center gap-4">
          <div className="text-right">
            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Selected</p>
            <p className="text-2xl font-black text-realize-purple">{items.length} Talents</p>
          </div>
          <div className="w-px h-8 bg-zinc-200" />
          <div className="text-right">
            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Step</p>
            <p className="text-2xl font-black text-realize-blue">{step === 'review' ? '01' : `02.${briefStep}`}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column: Talent List (Always visible but smaller in brief mode) */}
        <div className={cn("space-y-6 transition-all duration-500", step === 'review' ? "lg:col-span-7" : "lg:col-span-4 opacity-50 pointer-events-none")}>
          <AnimatePresence mode="popLayout">
            {items.map(inf => (
              <motion.div 
                key={inf.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all duration-500"
              >
                <img src={inf.avatar_url} className="w-20 h-20 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h3 className="text-lg font-black text-zinc-900 tracking-tight mb-1">{inf.name}</h3>
                  <div className="flex gap-2">
                    {inf.verticals.slice(0, 2).map((v: string) => (
                      <span key={v} className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{v}</span>
                    ))}
                  </div>
                </div>
                {step === 'review' && (
                  <button 
                    onClick={() => removeItem(inf.id)}
                    className="p-4 text-zinc-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="text-center py-32 bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-200">
              <Star className="w-16 h-16 text-zinc-200 mx-auto mb-6" />
              <p className="text-zinc-400 font-bold uppercase tracking-widest">No talents selected yet</p>
              <Link to="/influencers" className="text-realize-purple font-black text-xs mt-4 inline-block underline underline-offset-8">Browse Talents</Link>
            </div>
          )}

          {recentBriefs.length > 0 && step === 'review' && (
            <div className="pt-16">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-8">Recent Briefs</h3>
              <div className="space-y-4">
                {recentBriefs.slice(0, 3).map(b => (
                  <div key={b.id} className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all">
                    <div>
                      <p className="text-sm font-black text-zinc-900">{b.campaign_name}</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{b.brand_name} • {new Date(b.created_at).toLocaleDateString()}</p>
                    </div>
                    <button className="p-3 bg-white rounded-xl text-realize-purple opacity-0 group-hover:opacity-100 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Guided Brief Builder */}
        <div className={cn("transition-all duration-500", step === 'review' ? "lg:col-span-5" : "lg:col-span-8")}>
          <div className="bg-realize-dark p-10 rounded-[3rem] text-white shadow-2xl sticky top-32 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-4">
                <Briefcase className="w-6 h-6 text-realize-yellow" /> 
                {step === 'review' ? 'Campaign Review' : 'Brief Builder'}
              </h2>
              {step === 'brief' && (
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={cn("w-8 h-1 rounded-full transition-all", i <= briefStep ? "bg-realize-blue" : "bg-white/10")} />
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              {step === 'review' ? (
                <div className="space-y-8">
                  <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem]">
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                      You have selected <span className="text-white font-bold">{items.length} talents</span> for your campaign. 
                      The next step is to define the strategic brief to help Realize Networks understand your goals.
                    </p>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-realize-blue">
                      <Check className="w-4 h-4" /> Talents Selected
                      <div className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span className="text-zinc-500">Brief Pending</span>
                    </div>
                  </div>
                  
                  <button 
                    disabled={items.length === 0}
                    onClick={() => setStep('brief')}
                    className="w-full bg-linear-to-r from-realize-purple to-realize-blue text-white font-black uppercase tracking-[0.2em] py-6 rounded-2xl hover:shadow-xl hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                  >
                    Start Brief Builder <ChevronRight className="w-5 h-5" />
                  </button>

                  <button 
                    onClick={triggerQuickEmail}
                    className="w-full bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] py-6 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 mt-4"
                  >
                    <Mail className="w-5 h-5" /> Quick Email Brief
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {renderBriefStep()}
                  
                  <div className="flex items-center gap-4 pt-8">
                    {briefStep > 1 ? (
                      <button 
                        onClick={() => setBriefStep(prev => prev - 1)}
                        className="px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        Back
                      </button>
                    ) : (
                      <button 
                        onClick={() => setStep('review')}
                        className="px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                    )}
                    
                    {briefStep < 4 ? (
                      <button 
                        onClick={() => setBriefStep(prev => prev + 1)}
                        className="flex-1 bg-white text-realize-dark font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-realize-yellow transition-all flex items-center justify-center gap-2"
                      >
                        Next Step <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => setShowPreview(true)}
                        className="flex-1 bg-linear-to-r from-realize-purple to-realize-blue text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:shadow-xl hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        Review & Send Brief <Mail className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] text-center">
                Direct Submission to <span className="text-realize-yellow">info@realizenetworks.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-realize-dark/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-realize-purple flex items-center justify-center text-white">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">Final Brief Review</h3>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ready to send to Realize Networks</p>
                  </div>
                </div>
                <button onClick={() => setShowPreview(false)} className="p-3 hover:bg-zinc-200 rounded-full transition-colors">
                  <X className="w-6 h-6 text-zinc-500" />
                </button>
              </div>
              <div className="p-10 max-h-[60vh] overflow-y-auto font-mono text-xs text-zinc-600 whitespace-pre-wrap leading-relaxed bg-zinc-50/50">
                <div className="mb-8 pb-6 border-b border-zinc-100">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2">Recipient</p>
                  <p className="text-sm font-bold text-realize-purple">info@realizenetworks.com</p>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mt-4 mb-2">Subject</p>
                  <p className="text-sm font-bold text-zinc-900">{generateEmail().subject}</p>
                </div>
                {generateEmail().body}
              </div>
              <div className="p-8 bg-white border-t border-zinc-100 flex gap-4">
                <button 
                  onClick={() => setShowPreview(false)}
                  className="px-8 py-5 bg-zinc-100 text-zinc-500 font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-200 transition-all"
                >
                  Edit Brief
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="flex-1 bg-realize-dark text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-realize-purple transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-3"
                >
                  <Check className="w-5 h-5" /> Copy & Send Brief
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const App = () => {
  const { user, setUser, isLoading, setIsLoading } = useAuthStore();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-realize-dark">
      <div className="w-12 h-12 border-4 border-realize-purple border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen bg-white font-sans selection:bg-realize-purple/20 selection:text-realize-purple">
        <Navbar />
        <Routes>
          <Route path="/" element={user ? <Navigate to="/influencers" /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/influencers" /> : <LoginPage />} />
          <Route path="/signup" element={user ? <Navigate to="/influencers" /> : <SignupPage />} />
          <Route path="/influencers" element={user ? <InfluencerListPage /> : <Navigate to="/login" />} />
          <Route path="/influencers/:id" element={user ? <InfluencerDetailPage /> : <Navigate to="/login" />} />
          <Route path="/shortlist" element={user ? <ShortlistPage /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
