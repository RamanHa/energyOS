import { useState, ChangeEvent } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Zap, Brain, Coffee, Activity, ChevronRight, Check, AlertCircle, Sparkles, Loader2, Camera } from 'lucide-react';
import { LogType, StateLogData, MealLogData, EventLogData, LogEntry } from '../types';
import { useLanguage } from '../lib/LanguageContext';
import { getImmediateLogFeedback } from '../services/geminiService';
import { extractSleepFromImage } from '../services/sleepExtractionService';

interface LoggerProps {
  onComplete: () => void;
}

export default function Logger({ onComplete }: LoggerProps) {
  const [type, setType] = useState<LogType>('state');
  const [subType, setSubType] = useState<'morning' | 'interval'>('interval');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { t } = useLanguage();

  // Form State
  const [energy, setEnergy] = useState(5);
  const [focus, setFocus] = useState(3);
  const [sleepDist, setSleepDist] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [remSleep, setRemSleep] = useState(1.5);
  const [deepSleep, setDeepSleep] = useState(1.0);
  const [lightSleep, setLightSleep] = useState(4.5);
  const [rhr, setRhr] = useState(60);
  const [sequence, setSequence] = useState({ veggies: false, protein: false, carbs: false });
  const [hydration, setHydration] = useState(true);
  const [notes, setNotes] = useState('');

  const gutTags = ['Good Digestion', 'Bloated', 'Heavy', 'Gas'];
  const moodTags = ['Calm', 'Anxious', 'Stressed', 'Hangry', 'Energized'];
  const [selectedGut, setSelectedGut] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string[]>([]);

  const toggleTag = (tag: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(tag)) {
      setList(list.filter(t => t !== tag));
    } else {
      setList([...list, tag]);
    }
  };

  const handleSleepImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const extracted = await extractSleepFromImage(base64, file.type);
        if (extracted) {
          setSleepDist(extracted.sleepDuration);
          setSleepQuality(extracted.sleepQuality);
          setRemSleep(extracted.remSleep);
          setDeepSleep(extracted.deepSleep);
          setLightSleep(extracted.lightSleep);
          setRhr(extracted.rhr);
        }
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsScanning(false);
    }
  };

  const handleLog = async () => {
    if (!auth.currentUser) return;
    setLoading(true);

    let data: any = {};
    if (type === 'state') {
      data = {
        category: subType,
        energy,
        focus,
        moodTags: selectedMood,
        gutTags: selectedGut,
        ...(subType === 'morning' ? { 
          sleepDuration: sleepDist, 
          sleepQuality, 
          remSleep, 
          deepSleep, 
          lightSleep, 
          rhr 
        } : {})
      };
    } else if (type === 'meal') {
      data = {
        foodSequencing: sequence,
        hydrationContext: hydration,
        notes
      };
    }

    try {
      const logRef = await addDoc(collection(db, 'logs'), {
        userId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        type,
        data
      });
      
      setSuccess(true);
      
      setTimeout(() => {
        setShowAi(true);
      }, 1500);
      
      // Get AI Feedback
      setAiLoading(true);
      const feedback = await getImmediateLogFeedback({ type, data } as any);
      setAiFeedback(feedback);
      setAiLoading(false);
      
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'logs');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 max-w-lg mx-auto text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/40"
        >
          <Check className="text-black w-8 h-8" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold tracking-tight text-white"
        >
          {t.logger.success}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/40 mt-2 font-light italic text-xs uppercase tracking-widest"
        >
          {t.logger.successSub}
        </motion.p>

        {showAi && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 48 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="p-8 bg-white/5 border border-white/10 rounded-[2rem] w-full relative group overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={48} className="text-emerald-500" />
             </div>
             
             <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.4em] mb-4">{t.logger.aiFeedbackTitle}</h4>
             
             {aiLoading ? (
               <div className="flex items-center justify-center py-4 gap-3 text-white/20">
                 <Loader2 size={16} className="animate-spin" />
                 <span className="text-[10px] uppercase font-mono tracking-widest">{t.logger.aiSynthesizing}</span>
               </div>
             ) : (
               <p className="text-sm text-white/80 leading-relaxed font-light italic">
                 "{aiFeedback || t.logger.aiFallback}"
               </p>
             )}
          </motion.div>
        )}

        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={onComplete}
          className="mt-12 text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-[0.3em] transition-colors"
        >
          {t.logger.returnButton}
        </motion.button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h2 className="text-2xl font-bold tracking-tighter uppercase text-white">{t.logger.title}</h2>
        <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.2em]">{t.logger.subTitle}</p>
      </header>

      {/* Type Selector */}
      <div className="flex p-1 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
        {(['state', 'meal', 'event'] as const).map((tValue) => (
          <button
            key={tValue}
            onClick={() => setType(tValue)}
            className={`flex-1 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              type === tValue ? 'bg-white/10 text-emerald-400 border border-white/10 shadow-lg' : 'text-white/40 hover:text-white/80'
            }`}
          >
            {(t.logger.types as any)[tValue] || tValue}
          </button>
        ))}
      </div>

      <motion.div 
        key={type}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/40 border border-white/10 rounded-2xl p-8 space-y-8 backdrop-blur-xl"
      >
        {type === 'state' && (
          <>
            <div className="flex gap-4">
              <button 
                onClick={() => setSubType('morning')}
                className={`px-4 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest border transition-all ${
                  subType === 'morning' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'border-white/10 text-white/30 hover:border-white/20'
                }`}
              >{t.logger.protocols.morning}</button>
              <button 
                onClick={() => setSubType('interval')}
                className={`px-4 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest border transition-all ${
                  subType === 'interval' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'border-white/10 text-white/30 hover:border-white/20'
                }`}
              >{t.logger.protocols.interval}</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] uppercase font-mono text-white/40 tracking-wider">
                    <span>{t.logger.labels.energy}</span>
                    <span className="text-emerald-400 font-bold">{energy}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" value={energy} 
                    onChange={e => setEnergy(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] uppercase font-mono text-white/40 tracking-wider">
                    <span>{t.logger.labels.focus}</span>
                    <span className="text-blue-400 font-bold">{focus}/5</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" value={focus} 
                    onChange={e => setFocus(parseInt(e.target.value))}
                    className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
               </div>
            </div>

            {subType === 'morning' && (
              <div className="space-y-6 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] uppercase font-mono text-white/40 tracking-widest">Sleep Analysis Extraction</h4>
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:bg-emerald-500/20 transition-all">
                    <input type="file" accept="image/*" className="hidden" onChange={handleSleepImageUpload} disabled={isScanning} />
                    {isScanning ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                    {isScanning ? t.logger.labels.scanning : t.logger.labels.uploadSleep}
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase font-mono text-white/40">{t.logger.labels.sleep}</label>
                     <input type="number" step="0.5" value={sleepDist} onChange={e => setSleepDist(parseFloat(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-emerald-500/50 outline-none transition-colors text-white" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase font-mono text-white/40">{t.logger.labels.hr}</label>
                     <input type="number" value={rhr} onChange={e => setRhr(parseInt(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-emerald-500/50 outline-none transition-colors text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] uppercase font-mono text-white/40 tracking-wider">
                    <span>{t.logger.labels.sleepQuality}</span>
                    <span className="text-purple-400 font-bold">{sleepQuality}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" value={sleepQuality} 
                    onChange={e => setSleepQuality(parseInt(e.target.value))}
                    className="w-full accent-purple-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 pb-2">
                  <div className="space-y-2">
                     <label className="text-[9px] uppercase font-mono text-white/40 tracking-tighter">{t.logger.labels.rem}</label>
                     <input type="number" step="0.1" value={remSleep} onChange={e => setRemSleep(parseFloat(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs focus:border-blue-500/50 outline-none transition-colors text-white" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] uppercase font-mono text-white/40 tracking-tighter">{t.logger.labels.deep}</label>
                     <input type="number" step="0.1" value={deepSleep} onChange={e => setDeepSleep(parseFloat(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs focus:border-purple-500/50 outline-none transition-colors text-white" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] uppercase font-mono text-white/40 tracking-tighter">{t.logger.labels.light}</label>
                     <input type="number" step="0.1" value={lightSleep} onChange={e => setLightSleep(parseFloat(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs focus:border-emerald-500/50 outline-none transition-colors text-white" />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6 pt-6 border-t border-white/10">
               <h4 className="text-[10px] uppercase font-mono text-white/40 tracking-widest">{t.logger.labels.gut}</h4>
               <div className="flex flex-wrap gap-2">
                 {gutTags.map(tag => (
                   <button
                     key={tag}
                     onClick={() => toggleTag(tag, selectedGut, setSelectedGut)}
                     className={`px-4 py-2 rounded-xl text-xs transition-all border ${
                       selectedGut.includes(tag) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10'
                     }`}
                   >
                     {tag}
                   </button>
                 ))}
               </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-[10px] uppercase font-mono text-white/40 tracking-widest">{t.logger.labels.mood}</h4>
               <div className="flex flex-wrap gap-2">
                 {moodTags.map(tag => (
                   <button
                     key={tag}
                     onClick={() => toggleTag(tag, selectedMood, setSelectedMood)}
                     className={`px-4 py-2 rounded-xl text-xs transition-all border ${
                       selectedMood.includes(tag) ? 'bg-blue-500/10 text-blue-400 border-blue-500/50' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10'
                     }`}
                   >
                     {tag}
                   </button>
                 ))}
               </div>
            </div>
          </>
        )}

        {type === 'meal' && (
          <div className="space-y-8">
            <div className="space-y-4">
               <h4 className="text-[10px] uppercase font-mono text-white/40 tracking-widest">{t.logger.labels.sequence}</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {([['veggies', 'Veggies'], ['protein', 'Protein'], ['carbs', 'Carbs']] as const).map(([key, label]) => (
                   <button
                     key={key}
                     onClick={() => setSequence({...sequence, [key]: !sequence[key]})}
                     className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                       sequence[key] ? 'border-emerald-500/40 bg-emerald-500/10 text-white' : 'border-white/10 bg-white/5 text-white/40 hover:border-white/20'
                     }`}
                   >
                     <span className="text-xs font-bold uppercase tracking-tight">{label}</span>
                     {sequence[key] && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                   </button>
                 ))}
               </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
               <div className="flex items-center gap-3">
                  <Activity size={18} className="text-blue-400" />
                  <span className="text-xs uppercase font-bold tracking-widest text-white/80">{t.logger.labels.hydration}</span>
               </div>
               <button 
                 onClick={() => setHydration(!hydration)}
                 className={`w-12 h-6 rounded-full relative transition-colors ${hydration ? 'bg-emerald-500' : 'bg-white/10'}`}
               >
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${hydration ? 'translate-x-7' : 'translate-x-1'}`} />
               </button>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] uppercase font-mono text-white/40 tracking-widest">{t.logger.labels.context}</label>
               <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                placeholder={t.logger.placeholders.notes}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-emerald-500/40 outline-none resize-none font-light italic text-white"
               />
            </div>
          </div>
        )}

        {type === 'event' && (
          <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] uppercase font-mono text-white/40 tracking-widest">{t.logger.labels.stressor}</label>
               <input type="text" placeholder={t.logger.placeholders.stress} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-emerald-500/40 text-white" />
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-center text-[10px] uppercase font-mono text-white/40">
                 <span>{t.logger.labels.intensity}</span>
               </div>
               <input type="range" className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
            </div>
          </div>
        )}

        <button
          onClick={handleLog}
          disabled={loading}
          className="w-full bg-emerald-500 text-black py-4 rounded-xl font-bold uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-30"
        >
          {loading ? t.logger.submitting : t.logger.submit}
        </button>
      </motion.div>

      <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-emerald-300 font-light italic text-[10px] uppercase tracking-widest">
         <Sparkles size={18} className="shrink-0 text-emerald-400" />
         <p>{t.logger.footer}</p>
      </div>
    </div>
  );
}
