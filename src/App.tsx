/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth, loginWithGoogle, logout, db } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Activity, 
  BarChart2, 
  PlusCircle, 
  FlaskConical, 
  LifeBuoy, 
  LogOut, 
  User as UserIcon,
  ChevronRight,
  TrendingUp,
  Brain,
  Zap,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import Logger from './components/Logger';
import LabVault from './components/LabVault';
import SOSInterventions from './components/SOSInterventions';
import Profile from './components/Profile';
import Synthesis from './components/Synthesis';
import Wearables from './components/Wearables';
import Onboarding from './components/Onboarding';
import { UserProfile } from './types';
import { useLanguage } from './lib/LanguageContext';

type Page = 'dashboard' | 'logs' | 'labs' | 'sos' | 'synthesis' | 'wearables' | 'profile';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        
        let currentProfile: UserProfile;
        if (!docSnap.exists()) {
          currentProfile = {
            email: u.email!,
            displayName: u.displayName || 'User',
            createdAt: serverTimestamp(),
            biomarkerGoals: {},
            onboardingCompleted: false
          };
          await setDoc(docRef, currentProfile);
          setShowOnboarding(true);
        } else {
          currentProfile = docSnap.data() as UserProfile;
          if (currentProfile.onboardingCompleted === false) {
            setShowOnboarding(true);
          }
        }
        setProfile(currentProfile);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setActivePage('logs');
    // Refresh profile locally
    setProfile(prev => prev ? { ...prev, onboardingCompleted: true } : null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white">
        <div className="glow-bg">
          <div className="glow-top-left" />
          <div className="glow-bottom-right" />
        </div>
        <motion.div
           animate={{ scale: [1, 1.2, 1] }}
           transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap className="w-12 h-12 text-emerald-500" />
        </motion.div>
        <p className="mt-4 font-mono text-[10px] tracking-[0.2em] uppercase opacity-30">{t.dashboard.calibrating}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-[#e5e7eb] p-6 relative overflow-hidden">
        <div className="glow-bg">
          <div className="glow-top-left" />
          <div className="glow-bottom-right" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center z-10"
        >
          <div className="flex justify-center mb-8">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white/80 transition-all"
            >
              <Globe size={12} />
              {language === 'en' ? 'EN / DE' : 'DE / EN'}
            </button>
          </div>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <div className="w-8 h-8 bg-emerald-500 rounded-sm rotate-45 flex items-center justify-center">
              <div className="w-4 h-4 bg-black rounded-sm"></div>
            </div>
          </div>
          <h1 className="text-6xl font-sans font-bold tracking-tighter mb-4 uppercase">EnergyOS <span className="text-emerald-400">v2.1</span></h1>
          <p className="text-white/60 mb-12 text-lg font-light tracking-tight">
            Your N=1 biological tracker for peak cognitive and metabolic performance.
          </p>
          
          <button 
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-emerald-500 text-black py-4 px-6 rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20 active:scale-95"
          >
            <UserIcon className="w-5 h-5 fill-current" />
            Connect Biological Identity
          </button>
        </motion.div>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'logs': return <Logger onComplete={() => setActivePage('dashboard')} />;
      case 'labs': return <LabVault />;
      case 'sos': return <SOSInterventions />;
      case 'synthesis': return <Synthesis />;
      case 'wearables': return <Wearables />;
      case 'profile': return <Profile />;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: Activity, label: t.nav.systems },
    { id: 'logs', icon: Brain, label: t.nav.logData },
    { id: 'labs', icon: FlaskConical, label: t.nav.biomarkers },
    { id: 'sos', icon: LifeBuoy, label: t.nav.interventions },
    { id: 'synthesis', icon: TrendingUp, label: t.nav.synthesis },
    { id: 'wearables', icon: Activity, label: t.nav.wearables },
    { id: 'profile', icon: UserIcon, label: t.nav.profile },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-[#e5e7eb] font-sans selection:bg-emerald-500/30 overflow-hidden">
      <div className="glow-bg">
        <div className="glow-top-left" />
        <div className="glow-bottom-right" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
        </AnimatePresence>
        {/* Sidebar - visible on desktop */}
        <nav className="hidden md:flex flex-col w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between mb-12 px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-sm rotate-45 flex items-center justify-center">
                <div className="w-4 h-4 bg-black rounded-sm"></div>
              </div>
              <span className="font-bold text-xl tracking-tighter uppercase text-white">EnergyOS</span>
            </div>
            <button 
              onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
              className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all transition-colors"
              title={language === 'en' ? 'Switch to German' : 'Auf Englisch umstellen'}
            >
              <Globe size={18} />
            </button>
          </div>
          
          <div className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id as Page)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activePage === item.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium tracking-tight whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <button 
              onClick={() => setActivePage('profile')}
              className={`w-full flex items-center gap-3 px-2 py-3 rounded-xl mb-3 transition-all ${
                activePage === 'profile' ? 'bg-white/5' : 'hover:bg-white/5'
              }`}
            >
              <div className="h-8 w-8 shrink-0 rounded-full border border-white/20 bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-[10px] font-bold text-black">
                {profile?.displayName?.[0] || 'U'}
              </div>
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-sm font-semibold truncate text-white">{profile?.displayName}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.1em] font-mono">{t.nav.entityConnected}</p>
              </div>
            </button>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2 text-white/40 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs uppercase font-bold tracking-widest">{t.nav.disconnect}</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative pb-24 md:pb-6">
          <header className="sticky top-0 z-30 flex items-center justify-between p-6 bg-[#050505]/60 backdrop-blur-md md:hidden border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded-sm rotate-45 flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-sm"></div>
              </div>
              <h1 className="font-bold tracking-tighter uppercase">EnergyOS</h1>
            </div>
            <button 
              onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
              className="flex items-center gap-2 text-white/40"
            >
               <Globe size={16} />
               <span className="text-[10px] font-bold">{language.toUpperCase()}</span>
            </button>
          </header>

          <div className="p-6 md:p-10 max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-10 border-t border-white/10 flex items-center px-8 justify-between bg-black text-[10px] font-mono text-white/30 uppercase tracking-widest shrink-0 hidden md:flex">
        <div className="flex space-x-6">
          <span className="flex items-center gap-2">{t.common.active}: <span className="text-emerald-500">Active</span></span>
          <span>Hardware: {t.common.syncing}</span>
          <span className="text-emerald-500/60 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {t.common.optimized}</span>
        </div>
        <div>
          {t.common.user}: {profile?.email?.split('@')[0] || 'bio_hacker_772'}
        </div>
      </footer>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-1 left-4 right-4 z-40 bg-black/60 backdrop-blur-xl border border-white/10 flex justify-around p-4 shadow-2xl rounded-2xl mb-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id as Page)}
            className={`flex flex-col items-center gap-1 transition-all ${
              activePage === item.id ? 'text-emerald-400' : 'text-white/40'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold font-mono whitespace-nowrap">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

