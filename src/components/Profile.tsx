import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { User, Target, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { UserProfile } from '../types';

const COMMON_MARKERS = [
  { name: 'Fasting Insulin', unit: 'uIU/mL' },
  { name: 'HbA1c', unit: '%' },
  { name: 'hs-CRP', unit: 'mg/L' },
  { name: 'ApoB', unit: 'mg/dL' },
  { name: 'Vitamin D', unit: 'ng/mL' },
  { name: 'Ferritin', unit: 'ng/mL' }
];

export default function Profile() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [goals, setGoals] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchProfile() {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          setDisplayName(data.displayName || '');
          setGoals(data.biomarkerGoals || {});
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    setMessage(null);
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(docRef, {
        displayName,
        biomarkerGoals: goals,
        updatedAt: new Date()
      });
      setMessage({ type: 'success', text: t.profile.success });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Update failed. Check permissions.' });
    } finally {
      setSaving(false);
    }
  };

  const updateGoal = (marker: string, value: string) => {
    const numValue = parseFloat(value);
    setGoals(prev => ({
      ...prev,
      [marker]: isNaN(numValue) ? 0 : numValue
    }));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter uppercase text-white">{t.profile.title}</h2>
          <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.2em]">{t.profile.subTitle}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50"
        >
          {saving ? t.profile.saving : <><Save size={14} /> {t.profile.save}</>}
        </button>
      </header>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <p className="text-xs font-bold uppercase tracking-widest">{message.text}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Info */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
              <User size={18} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">{t.profile.personal}</h3>
          </div>
          
          <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono text-white/40 tracking-wider font-bold">{t.profile.labels.name}</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-emerald-500/50 text-white font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono text-white/40 tracking-wider font-bold">{t.profile.labels.email}</label>
              <div className="w-full bg-white/2 border border-white/5 rounded-xl p-4 text-sm text-white/40 font-mono">
                {profile?.email}
              </div>
            </div>
          </div>
        </section>

        {/* Biomarker Goals */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
              <Target size={18} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">{t.profile.goals}</h3>
          </div>

          <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-8">
            <div className="grid grid-cols-1 gap-6">
              {COMMON_MARKERS.map(marker => (
                <div key={marker.name} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">{marker.name}</p>
                    <p className="text-[9px] text-white/20 font-mono uppercase tracking-tighter">{t.profile.labels.goalFor} ({marker.unit})</p>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={goals[marker.name] || ''}
                    onChange={e => updateGoal(marker.name, e.target.value)}
                    className="w-24 bg-white/5 border border-white/10 rounded-xl p-3 text-right text-sm outline-none focus:border-emerald-500/50 text-white font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
