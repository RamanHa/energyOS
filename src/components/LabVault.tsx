import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { LabResult, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { FlaskConical, Plus, Calendar, Activity, Info, Trash2, Target, BarChart2, LayoutGrid, ArrowLeft, TrendingUp, TrendingDown, Minus, Upload, Camera, Loader2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../lib/LanguageContext';
import { doc, getDoc } from 'firebase/firestore';
import BiomarkerCorrelation from './BiomarkerCorrelation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { extractLabsFromImage, ExtractedLabResult } from '../services/labExtractionService';

const BIOMARKER_METADATA: Record<string, { unit: string, refRange: string, desc: string }> = {
  'Fasting Insulin': { unit: 'uIU/mL', refRange: '2.0 - 5.0 (Optimal)', desc: 'Key marker for insulin sensitivity and metabolic longevity.' },
  'Vitamin D3': { unit: 'ng/mL', refRange: '50.0 - 80.0 (Optimal)', desc: 'Steroid hormone precursor essential for immune function and bone health.' },
  'Vitamin B12': { unit: 'pg/mL', refRange: '700 - 1000 (Optimal)', desc: 'Critical for neurological function and methylation processes.' },
  'HbA1c': { unit: '%', refRange: '4.5 - 5.3 (Optimal)', desc: 'Gold standard for long-term glycemic control analysis.' },
  'Ferritin': { unit: 'ng/mL', refRange: '100 - 200 (Optimal for High Performers)', desc: 'Primary iron storage protein; proxy for cellular energy capacity.' },
  'hs-CRP': { unit: 'mg/L', refRange: '< 0.5 (Optimal)', desc: 'Indicator of systemic low-grade inflammation.' },
  'Triglycerides': { unit: 'mg/dL', refRange: '< 100 (Optimal)', desc: 'Measure of fat in the blood; indicator of metabolic efficiency.' },
};

const COMMON_MARKERS = Object.entries(BIOMARKER_METADATA).map(([name, meta]) => ({
  name,
  ...meta
}));

export default function LabVault() {
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [goals, setGoals] = useState<Record<string, number>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [marker, setMarker] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [view, setView] = useState<'list' | 'correlation'>('list');
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ExtractedLabResult[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'labs'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('date', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setLabs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LabResult)));
    });

    // Fetch goals
    const fetchGoals = async () => {
      const docRef = doc(db, 'users', auth.currentUser!.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setGoals((docSnap.data() as UserProfile).biomarkerGoals || {});
      }
    };
    fetchGoals();

    return unsub;
  }, []);

  const handleAdd = async () => {
    if (!auth.currentUser || !marker || !value) return;
    await addDoc(collection(db, 'labs'), {
      userId: auth.currentUser.uid,
      marker,
      value: parseFloat(value),
      unit,
      date: new Date(date),
      createdAt: serverTimestamp()
    });
    setShowAdd(false);
    setMarker('');
    setValue('');
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const extracted = await extractLabsFromImage(base64, file.type);
        setScanResults(extracted);
        setIsScanning(false);
        setShowAdd(true);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsScanning(false);
    }
  };

  const handleCommitScan = async () => {
    if (!auth.currentUser || scanResults.length === 0) return;
    
    for (const res of scanResults) {
      await addDoc(collection(db, 'labs'), {
        userId: auth.currentUser.uid,
        marker: res.marker,
        value: res.value,
        unit: res.unit,
        date: new Date(res.date),
        createdAt: serverTimestamp()
      });
    }
    
    setScanResults([]);
    setShowAdd(false);
  };

  const selectedMarkerLabs = useMemo(() => {
    if (!selectedMarker) return [];
    return labs
      .filter(l => l.marker === selectedMarker)
      .sort((a, b) => new Date(a.date.toDate ? a.date.toDate() : a.date).getTime() - new Date(b.date.toDate ? b.date.toDate() : b.date).getTime());
  }, [labs, selectedMarker]);

  const trendData = useMemo(() => {
    return selectedMarkerLabs.map(l => ({
      date: format(l.date.toDate ? l.date.toDate() : new Date(l.date), 'MMM d, yy'),
      value: l.value
    }));
  }, [selectedMarkerLabs]);

  if (selectedMarker) {
    const meta = BIOMARKER_METADATA[selectedMarker];
    const latest = selectedMarkerLabs[selectedMarkerLabs.length - 1];
    const previous = selectedMarkerLabs[selectedMarkerLabs.length - 2];
    const change = previous ? latest.value - previous.value : 0;

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
        <button 
          onClick={() => setSelectedMarker(null)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={14} />
          {t.vault.labels.back}
        </button>

        <header className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <FlaskConical size={20} />
               </div>
               <h2 className="text-3xl font-bold tracking-tighter uppercase text-white">{selectedMarker}</h2>
            </div>
            <p className="text-white/40 text-xs font-light italic max-w-xl">{meta?.desc}</p>
          </div>
          {latest && (
            <div className="text-right">
               <div className="flex items-baseline gap-2 justify-end">
                  <span className="text-5xl font-bold text-white tabular-nums">{latest.value}</span>
                  <span className="text-sm text-white/20 uppercase font-mono">{latest.unit}</span>
               </div>
               <div className={`flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-widest mt-2 ${change < 0 ? 'text-blue-400' : change > 0 ? 'text-rose-400' : 'text-white/20'}`}>
                  {change > 0 ? <TrendingUp size={12} /> : change < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                  {change !== 0 ? Math.abs(change).toFixed(2) : '--'} from last
               </div>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              {/* Trend Chart */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 h-80">
                 <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-8">{t.vault.labels.trend}</h3>
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                       <XAxis 
                        dataKey="date" 
                        stroke="#ffffff20" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        dy={10}
                       />
                       <YAxis 
                        stroke="#ffffff20" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        dx={-10}
                       />
                       <Tooltip 
                        contentStyle={{ backgroundColor: '#000000', border: '1px solid #ffffff10', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase' }}
                        labelStyle={{ display: 'none' }}
                       />
                       <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                       />
                    </LineChart>
                 </ResponsiveContainer>
              </div>

              {/* History Table */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-white/5">
                          <th className="p-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">Date</th>
                          <th className="p-6 text-[10px] font-bold text-white/40 uppercase tracking-widest text-right">Value</th>
                       </tr>
                    </thead>
                    <tbody>
                       {[...selectedMarkerLabs].reverse().map(l => (
                         <tr key={l.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                            <td className="p-6 text-xs text-white/60 font-mono">{format(l.date.toDate ? l.date.toDate() : new Date(l.date), 'MMMM d, yyyy')}</td>
                            <td className="p-6 text-sm text-white font-bold text-right tabular-nums">{l.value} <span className="text-[10px] text-white/20 ml-1 uppercase">{l.unit}</span></td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           <div className="space-y-8">
              {/* Reference Range */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                 <div>
                    <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">{t.vault.labels.refRange}</h3>
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                       <p className="text-xl font-bold text-emerald-400 tabular-nums">{meta?.refRange || 'TBD'}</p>
                    </div>
                 </div>
                 
                 {goals[selectedMarker] && (
                    <div>
                       <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">{t.vault.target}</h3>
                       <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                          <p className="text-xl font-bold text-blue-400 tabular-nums">{goals[selectedMarker]} {meta?.unit}</p>
                       </div>
                    </div>
                 )}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                 <div className="flex items-center gap-3 mb-6">
                    <Activity size={18} className="text-emerald-400" />
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Contextual Note</h3>
                 </div>
                 <p className="text-xs text-white/40 leading-relaxed font-light italic">
                    Values outside the reference range may indicate physiological stress. 
                    Correlation with current nutritional protocols and recovery metrics is advised 
                    before titration of interventions.
                 </p>
              </div>
           </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter uppercase text-white">{t.vault.title}</h2>
          <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.2em]">{t.vault.subTitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="bg-white/5 border border-white/10 text-white/60 p-2.5 rounded-xl cursor-pointer hover:bg-white/10 transition-all flex items-center gap-2 group">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isScanning} />
            {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} className="group-hover:text-emerald-400" />}
            <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">
              {isScanning ? t.vault.extracting : t.vault.uploadImage}
            </span>
          </label>
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center gap-1">
             <button 
               onClick={() => setView('list')}
               className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
             >
               <LayoutGrid size={16} />
             </button>
             <button 
               onClick={() => setView('correlation')}
               className={`p-2 rounded-lg transition-all ${view === 'correlation' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
             >
               <BarChart2 size={16} />
             </button>
          </div>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="bg-emerald-500 text-black px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-400 active:scale-95 transition-all shadow-2xl shadow-emerald-500/20"
          >
            <Plus size={16} />
            {showAdd ? t.vault.cancel : t.vault.register}
          </button>
        </div>
      </header>

      {showAdd && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-xl border border-emerald-500/30 p-8 rounded-2xl space-y-8 shadow-2xl shadow-emerald-500/5"
        >
          {scanResults.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">{t.vault.scanResults}</h3>
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-[9px] font-mono font-bold">AI ASSISTED</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scanResults.map((res, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center group">
                    <div>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Found</p>
                      <p className="text-xs font-bold text-white uppercase">{res.marker}</p>
                      <p className="text-[10px] text-white/40">{res.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">{res.value}</p>
                      <p className="text-[10px] text-white/30 uppercase">{res.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setScanResults([])}
                  className="flex-1 bg-white/5 border border-white/10 text-white/40 py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors"
                >Discard Scan</button>
                <button 
                  onClick={handleCommitScan}
                  className="flex-1 bg-emerald-500 text-black py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={14} />
                  {t.vault.submit}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono text-white/40 tracking-wider">{t.vault.labels.marker}</label>
                <select 
                  value={marker} 
                  onChange={e => {
                    const m = COMMON_MARKERS.find(cm => cm.name === e.target.value);
                    setMarker(e.target.value);
                    if (m) setUnit(m.unit);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm outline-none focus:border-emerald-500/50 text-white transition-colors"
                >
                  <option value="" className="bg-neutral-900">Choose marker...</option>
                  {COMMON_MARKERS.map(cm => <option key={cm.name} value={cm.name} className="bg-neutral-900">{cm.name}</option>)}
                  <option value="custom" className="bg-neutral-900">Custom...</option>
                </select>
             </div>
             {marker === 'custom' && (
               <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono text-white/40 tracking-wider">{t.vault.labels.custom}</label>
                <input type="text" onChange={e => setMarker(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm outline-none focus:border-emerald-500/50 text-white" />
               </div>
             )}
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono text-white/40 tracking-wider">{t.vault.labels.value}</label>
                <div className="flex gap-2">
                  <input type="number" step="0.01" value={value} onChange={e => setValue(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm outline-none focus:border-emerald-500/50 text-white" />
                  <input type="text" placeholder="Unit" value={unit} onChange={e => setUnit(e.target.value)} className="w-24 bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm outline-none focus:border-emerald-500/50 text-white" />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono text-white/40 tracking-wider">{t.vault.labels.date}</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm outline-none focus:border-emerald-500/50 text-white" />
             </div>
           </div>
           <button 
             onClick={handleAdd}
             className="w-full bg-white text-black py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-200 transition-colors shadow-xl"
           >{t.vault.submit}</button>
            </>
          )}
        </motion.div>
      )}

      {view === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labs.length > 0 ? (
            // Group by marker to show latest
            (Object.values(labs.reduce((acc, curr) => {
              const currDate = new Date(curr.date.toDate ? curr.date.toDate() : curr.date);
              const accDate = acc[curr.marker] ? new Date(acc[curr.marker].date.toDate ? acc[curr.marker].date.toDate() : acc[curr.marker].date) : new Date(0);
              
              if (!acc[curr.marker] || currDate > accDate) {
                acc[curr.marker] = curr;
              }
              return acc;
            }, {} as Record<string, LabResult>)) as LabResult[]).map((lab, idx) => (
            <motion.div 
              key={lab.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedMarker(lab.marker)}
              className="bg-white/5 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group relative overflow-hidden cursor-pointer active:scale-95"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-emerald-400/10 transition-colors" />
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                  <FlaskConical size={24} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/20 uppercase font-mono tracking-widest mb-1">{t.vault.labels.observation}</p>
                  <p className="text-[10px] font-bold text-white/60">{format(lab.date.toDate ? lab.date.toDate() : new Date(lab.date), 'MMM d, yyyy')}</p>
                </div>
              </div>
              
              <h4 className="font-bold text-sm text-white tracking-tight relative z-10 mb-1">{lab.marker}</h4>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className="text-3xl font-bold text-white tabular-nums">{lab.value}</span>
                <span className="text-[10px] text-white/30 uppercase font-mono tracking-tighter">{lab.unit}</span>
              </div>

              {goals[lab.marker] && (
                <div className="mt-4 flex items-center gap-2 relative z-10">
                   <Target size={12} className="text-white/20" />
                   <p className="text-[9px] uppercase font-bold tracking-widest text-white/20">
                     {t.vault.target}: <span className="text-white/40">{goals[lab.marker]} {lab.unit}</span>
                   </p>
                </div>
              )}
              
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 relative z-10">
                 <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono uppercase tracking-widest">
                    <Activity size={12} />
                    <span>{t.vault.labels.refValid}</span>
                 </div>
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Trash logic could be here
                  }}
                  className="text-white/20 hover:text-rose-400 transition-colors"
                 >
                    <Trash2 size={14} />
                 </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-24 bg-white/5 border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-white/20">
             <FlaskConical size={48} className="mb-6 opacity-5 animate-pulse" />
             <p className="text-[10px] font-mono uppercase tracking-[0.3em]">{t.vault.noHistory}</p>
          </div>
        )}
      </div>
      ) : (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <BiomarkerCorrelation labs={labs} />
        </motion.div>
      )}

      <div className="bg-blue-500/5 backdrop-blur-xl border border-blue-500/10 p-8 rounded-3xl flex gap-6 mt-12">
        <div className="shrink-0 w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 shadow-inner">
          <Info size={24} />
        </div>
        <div>
           <h5 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">{t.vault.protocolNoteTitle}</h5>
           <p className="text-[11px] text-white/50 leading-relaxed font-light italic">
             {t.vault.protocolNote}
           </p>
        </div>
      </div>
    </div>
  );
}
