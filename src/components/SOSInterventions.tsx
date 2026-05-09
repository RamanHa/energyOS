import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LifeBuoy, Wind, Coffee, Zap, Droplets, Footprints, Moon, Timer, Check } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '../lib/LanguageContext';

interface SOSHack {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  suggestions: string[];
  duration?: number;
}

export default function SOSInterventions() {
  const [selected, setSelected] = useState<SOSHack | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { t } = useLanguage();

  const HACKS: SOSHack[] = [
    {
      id: 'brain-fog',
      title: t.sos.protocols.brainFog.title,
      description: t.sos.protocols.brainFog.desc,
      icon: Droplets,
      color: 'orange',
      suggestions: [
        t.sos.protocols.brainFog.s1,
        t.sos.protocols.brainFog.s2,
        t.sos.protocols.brainFog.s3
      ]
    },
    {
      id: 'stress',
      title: t.sos.protocols.stress.title,
      description: t.sos.protocols.stress.desc,
      icon: Wind,
      color: 'red',
      suggestions: [
        t.sos.protocols.stress.s1,
        t.sos.protocols.stress.s2,
        t.sos.protocols.stress.s3
      ],
      duration: 60
    },
    {
      id: 'fatigue',
      title: t.sos.protocols.fatigue.title,
      description: t.sos.protocols.fatigue.desc,
      icon: Footprints,
      color: 'blue',
      suggestions: [
        t.sos.protocols.fatigue.s1,
        t.sos.protocols.fatigue.s2,
        t.sos.protocols.fatigue.s3
      ],
      duration: 600
    }
  ];

  const logIntervention = async (hack: SOSHack) => {
    if (!auth.currentUser) return;
    await addDoc(collection(db, 'logs'), {
      userId: auth.currentUser.uid,
      timestamp: serverTimestamp(),
      type: 'sos',
      data: {
        issue: hack.id,
        intervention: hack.title
      }
    });
  };

  const startTimer = (duration: number) => {
    setTimeLeft(duration);
    setTimerActive(true);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/10">
            <LifeBuoy size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tighter uppercase text-white">{t.sos.title}</h2>
        </div>
        <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.2em] ml-13">{t.sos.subTitle}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {HACKS.map(hack => (
          <button
            key={hack.id}
            onClick={() => {
              setSelected(hack);
              logIntervention(hack);
            }}
            className={`p-8 rounded-2xl border text-left transition-all backdrop-blur-xl relative overflow-hidden group ${
              selected?.id === hack.id 
              ? 'bg-white/10 border-emerald-500/40 shadow-2xl shadow-emerald-500/10' 
              : 'bg-black/40 border-white/5 hover:border-white/10'
            }`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 -translate-x-4 -translate-y-4 rounded-full transition-colors ${
              hack.color === 'orange' ? 'bg-orange-500' :
              hack.color === 'red' ? 'bg-rose-500' :
              'bg-blue-500'
            }`} />
            
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner transition-transform group-hover:scale-110 ${
              hack.color === 'orange' ? 'bg-orange-500/10 text-orange-400' :
              hack.color === 'red' ? 'bg-rose-500/10 text-rose-400' :
              'bg-blue-500/10 text-blue-400'
            }`}>
              <hack.icon size={28} />
            </div>
            <h3 className="font-bold text-white mb-3 leading-tight tracking-tight">{hack.title}</h3>
            <p className="text-[10px] text-white/30 uppercase font-mono leading-relaxed tracking-widest">{hack.description}</p>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl"
          >
            <div className="p-10 md:p-16 space-y-12">
              <div className="flex items-start justify-between gap-8">
                 <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-emerald-400 mb-1">{t.sos.recommended}</p>
                    <h3 className="text-4xl font-bold tracking-tighter text-white uppercase">{selected.title}</h3>
                 </div>
                 {selected.duration && !timerActive && (
                   <button 
                     onClick={() => startTimer(selected.duration!)}
                     className="flex items-center gap-2 bg-emerald-500 text-black px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-95"
                   >
                     <Timer size={16} />
                     {t.sos.activate} ({selected.duration / 60}m)
                   </button>
                 )}
              </div>

              <div className="grid grid-cols-1 gap-6">
                {selected.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 items-center hover:bg-white/10 transition-colors">
                     <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-bold font-mono">
                        0{i + 1}
                     </div>
                     <p className="text-sm font-light text-white/70 leading-relaxed italic">"{s}"</p>
                  </div>
                ))}
              </div>

              {timerActive && (
                <div className="bg-black/60 backdrop-blur-3xl p-10 rounded-[2rem] flex flex-col items-center border border-emerald-500/20 shadow-inner">
                  <div className="text-7xl font-mono font-bold tracking-tighter text-emerald-400 tabular-nums">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  <p className="mt-6 text-[10px] uppercase font-bold tracking-[0.4em] text-white/20 animate-pulse">{t.sos.bioReset}</p>
                </div>
              )}

              <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-3 text-emerald-400/60">
                    <Check size={20} />
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]">{t.sos.logged}</span>
                 </div>
                 <button 
                  onClick={() => setSelected(null)}
                  className="px-6 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest text-white/30 border border-white/10 hover:text-white hover:border-white/30 transition-all"
                 >{t.sos.terminate}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selected && (
        <div className="py-24 text-center space-y-6">
           <Zap className="w-16 h-16 text-white/5 mx-auto animate-pulse" />
           <p className="text-[10px] uppercase font-mono tracking-[0.4em] text-white/10">{t.sos.standby}</p>
        </div>
      )}
    </div>
  );
}
