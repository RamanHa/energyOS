import React, { useState, useEffect } from 'react';
import { db, auth, connectGoogleFit } from '../lib/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { User, Target, Save, CheckCircle2, AlertCircle, Activity, Loader2, Sparkles, X, Plus } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { UserProfile } from '../types';
import { fetchGoogleFitData } from '../lib/googleFit';

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
  const [lifestyleGoals, setLifestyleGoals] = useState<string[]>([]);
  const [newLifestyleGoal, setNewLifestyleGoal] = useState('');
  
  const [fitConnected, setFitConnected] = useState(!!sessionStorage.getItem('fitToken'));
  const [fitToken, setFitToken] = useState<string | null>(sessionStorage.getItem('fitToken'));
  const [syncingFit, setSyncingFit] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);

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
          setLifestyleGoals(data.lifestyleGoals || []);
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
        lifestyleGoals,
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

  const handleAddLifestyleGoal = () => {
    if (newLifestyleGoal.trim() !== '') {
      setLifestyleGoals(prev => [...prev, newLifestyleGoal.trim()]);
      setNewLifestyleGoal('');
    }
  };

  const handleRemoveLifestyleGoal = (index: number) => {
    setLifestyleGoals(prev => prev.filter((_, i) => i !== index));
  };

  const handleConnectFit = async () => {
    try {
      const credential = await connectGoogleFit();
      if (credential?.accessToken) {
        setFitToken(credential.accessToken);
        setFitConnected(true);
        sessionStorage.setItem('fitToken', credential.accessToken);
        setMessage({ type: 'success', text: t.profile.connectedGoogleFit });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Google Fit Connection Failed: ' + err.message });
    }
  };

  const handleSyncFit = async () => {
    if (!fitToken || !auth.currentUser) return;
    setSyncingFit(true);
    setLastSyncResult(null);
    try {
      const data = await fetchGoogleFitData(fitToken);
      let sleepDurationHours = 0;
      let steps = 0;
      let cardio = 0;

      if (data && data.bucket && data.bucket.length > 0) {
          const latestBucket = data.bucket[data.bucket.length - 1];
          const sleepDataset = latestBucket.dataset?.find((d: any) => d.dataSourceId?.includes('sleep'));
          const stepsDataset = latestBucket.dataset?.find((d: any) => d.dataSourceId?.includes('step_count'));
          const cardioDataset = latestBucket.dataset?.find((d: any) => d.dataSourceId?.includes('heart_minutes'));
          
          if (sleepDataset?.point?.length > 0) {
            let totalSleepMs = 0;
            sleepDataset.point.forEach((p: any) => {
              const start = parseInt(p.startTimeNanos || '0');
              const end = parseInt(p.endTimeNanos || '0');
              if (start && end) {
                totalSleepMs += (end - start) / 1000000;
              }
            });
            sleepDurationHours = parseFloat((totalSleepMs / (1000 * 60 * 60)).toFixed(1));
          }

          if (stepsDataset?.point?.length > 0) {
             stepsDataset.point.forEach((p: any) => {
               const val = p.value?.[0]?.intVal || 0;
               steps += val;
             });
          }

          if (cardioDataset?.point?.length > 0) {
             cardioDataset.point.forEach((p: any) => {
               const val = p.value?.[0]?.fpVal || 0;
               cardio += val;
             });
             cardio = Math.round(cardio);
          }
      }

      await addDoc(collection(db, 'logs'), {
        userId: auth.currentUser.uid,
        type: 'state',
        data: {
          moodTags: ['WEARABLE_SYNC'],
          sleepDuration: sleepDurationHours,
          steps: steps,
          cardio: cardio,
          sleepQuality: 8,
          energy: 7,
          focus: 4
        },
        timestamp: serverTimestamp()
      });
      const resultText = `Gespeichert: ${sleepDurationHours}h Schlaf, ${steps} Schritte, ${cardio} Kardiopunkte.`;
      setLastSyncResult(resultText);
      setMessage({ type: 'success', text: resultText });
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      if (err.message.includes('403') || err.message.includes('401')) {
          sessionStorage.removeItem('fitToken');
          setFitToken(null);
          setFitConnected(false);
          setMessage({ type: 'error', text: 'Token abgelaufen oder fehlende Berechtigung. Bitte neu verbinden.' });
      } else {
        setMessage({ type: 'error', text: 'Sync failed: ' + err.message });
      }
    } finally {
      setSyncingFit(false);
    }
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

        {/* Lifestyle Goals */}
        <section className="space-y-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
              <Sparkles size={18} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-pink-400">Lifestyle Goals</h3>
          </div>
          
          <div className="p-8 bg-gradient-to-br from-pink-500/5 to-transparent border border-pink-500/20 rounded-[2rem] space-y-6">
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight mb-2">Proactive AI Tracking</h4>
              <p className="text-xs text-white/50 max-w-xl leading-relaxed">
                Set specific lifestyle or habit goals (e.g., "Improve sleep consistency", "Reduce caffeine after 2PM"). The AI Coach will actively monitor your logs against these objectives and provide targeted feedback.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Enter a new lifestyle or health goal..."
                value={newLifestyleGoal}
                onChange={e => setNewLifestyleGoal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddLifestyleGoal()}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-pink-500/50 text-white font-medium"
              />
              <button
                onClick={handleAddLifestyleGoal}
                disabled={!newLifestyleGoal.trim()}
                className="bg-pink-500 text-black px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-pink-400 transition-all disabled:opacity-50 disabled:hover:bg-pink-500 whitespace-nowrap flex items-center gap-2"
              >
                <Plus size={16} /> Add Goal
              </button>
            </div>

            {lifestyleGoals.length > 0 && (
               <div className="flex flex-wrap gap-3 mt-4">
                 {lifestyleGoals.map((goal, idx) => (
                   <div key={idx} className="flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 text-pink-200 px-4 py-2 rounded-xl text-sm">
                     <span>{goal}</span>
                     <button onClick={() => handleRemoveLifestyleGoal(idx)} className="text-pink-400 hover:text-pink-300 ml-2">
                       <X size={14} />
                     </button>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </section>

        {/* Wearable Sync */}
        <section className="space-y-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Activity size={18} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">{t.profile.integrations}</h3>
          </div>

          <div className="p-8 bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/20 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-sm font-bold text-white mb-2 tracking-tight">Google Fit Connection</h4>
              <p className="text-xs text-white/50 max-w-sm leading-relaxed">
                Automatically import sleep stages, HRV, and RHR data. The AI uses this objective biological data to correlate with your subjective logs.
              </p>
            </div>
            
            <div className="flex-shrink-0 flex flex-col items-end gap-2">
              {!fitConnected ? (
                <button
                  onClick={handleConnectFit}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                >
                  {t.profile.connectGoogleFit}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSyncFit}
                    disabled={syncingFit}
                    className="bg-emerald-500 text-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                  >
                    {syncingFit ? (
                      <><Loader2 size={16} className="animate-spin" /> {t.profile.syncingGoogleFit}</>
                    ) : (
                      <><Activity size={16} /> {t.profile.syncGoogleFit}</>
                    )}
                  </button>
                  {lastSyncResult && (
                    <p className="text-[10px] text-emerald-400 font-mono">{lastSyncResult}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
