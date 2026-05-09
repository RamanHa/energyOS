import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BrainCircuit, Activity, Target, Trophy, Flame, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { db, auth } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { LogEntry } from '../types';
import { generateWeeklySynthesis } from '../services/geminiService';

export default function Synthesis() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [synthesis, setSynthesis] = useState<any>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!auth.currentUser) return;
      // Get the past 7 days of logs basically
      try {
        const q = query(
          collection(db, 'logs'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
        const snapshot = await getDocs(q);
        const fetchedLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LogEntry[];
        setLogs(fetchedLogs);
      } catch (e) {
        console.error(e);
      }
    };
    fetchLogs();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateWeeklySynthesis(logs);
    if (result) {
      setSynthesis(result);
    }
    setLoading(false);
  };

  if (!synthesis && !loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <h2 className="text-2xl font-bold tracking-tighter uppercase text-white">{t.synthesis.title}</h2>
          <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.2em]">{t.synthesis.subTitle}</p>
        </header>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-12 text-center relative overflow-hidden backdrop-blur-xl">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={80} className="text-emerald-500" />
           </div>

           <BrainCircuit size={48} className="mx-auto text-emerald-400 mb-6" />
           <p className="text-white/60 mb-8 max-w-md mx-auto text-sm font-light italic">
             {logs.length > 5 ? 
               "System has sufficient data. Ready to generate neural synthesis based on your latest inputs." :
               t.synthesis.noData
             }
           </p>

           <button
             onClick={handleGenerate}
             disabled={logs.length <= 5}
             className="bg-emerald-500 text-black py-4 px-8 rounded-xl font-bold uppercase tracking-[0.3em] shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 transition-all flex items-center gap-3 mx-auto"
           >
             <Sparkles size={16} />
             {t.synthesis.generateBtn}
           </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
           animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
           transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <BrainCircuit className="w-16 h-16 text-emerald-500 opacity-50" />
        </motion.div>
        <p className="mt-8 font-mono text-[10px] tracking-[0.3em] uppercase text-emerald-400 animate-pulse">
          {t.synthesis.generating}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter uppercase text-white">{t.synthesis.title}</h2>
          <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.2em]">{t.synthesis.subTitle}</p>
        </div>
        <button 
           onClick={() => setSynthesis(null)}
           className="text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white"
        >
          Clear
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Narrative Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-12 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden backdrop-blur-sm"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full mix-blend-screen filter blur-[80px]" />
          <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
            <Sparkles size={14} /> {t.synthesis.summarySection}
          </h3>
          <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed tracking-tight relative z-10">
            "{synthesis.summary}"
          </p>
        </motion.div>

        {/* Wins */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-6 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm"
        >
          <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
            <Trophy size={14} /> {t.synthesis.winsSection}
          </h3>
          <ul className="space-y-4">
            {synthesis.wins?.map((win: string, i: number) => (
              <li key={i} className="flex gap-3 text-sm text-white/80 font-light">
                <ChevronRight size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <span>{win}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Challenges */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-6 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm"
        >
          <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
            <Flame size={14} /> {t.synthesis.challengesSection}
          </h3>
          <ul className="space-y-4">
            {synthesis.challenges?.map((challenge: string, i: number) => (
              <li key={i} className="flex gap-3 text-sm text-white/80 font-light">
                <ChevronRight size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>{challenge}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Mood Vectors */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-4 bg-purple-500/10 border border-purple-500/20 rounded-3xl p-8 backdrop-blur-sm flex flex-col justify-center items-center text-center"
        >
          <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.4em] mb-6 w-full text-left">
             {t.synthesis.moodSection}
          </h3>
          <div className="flex flex-wrap justify-center gap-3 w-full">
             {synthesis.moodVectors?.map((mood: string, i: number) => (
               <div key={i} className="bg-purple-500/20 border border-purple-500/30 text-purple-200 text-xs px-4 py-2 rounded-full uppercase tracking-widest font-bold">
                 {mood}
               </div>
             ))}
          </div>
        </motion.div>

        {/* Game Plan */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-8 bg-gradient-to-br from-emerald-500/20 to-blue-500/10 border border-emerald-500/20 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden"
        >
           <div className="absolute -bottom-10 -right-10 text-emerald-500/10">
              <Target size={180} />
           </div>
           <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.4em] mb-4 flex items-center gap-2 relative z-10">
             <ArrowRight size={14} /> {t.synthesis.gamePlanSection}
           </h3>
           <p className="text-lg text-white/90 font-light leading-relaxed relative z-10">
             {synthesis.gamePlan}
           </p>
        </motion.div>

      </div>
    </div>
  );
}
