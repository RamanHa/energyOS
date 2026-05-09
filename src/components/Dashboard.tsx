import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { LogEntry } from '../types';
import { motion } from 'motion/react';
import { Brain, Zap, Activity, TrendingUp, Sparkles, Clock, ChevronRight, LifeBuoy, Moon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { getHealthInsights } from '../services/geminiService';
import { useLanguage } from '../lib/LanguageContext';

export default function Dashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'logs'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LogEntry));
      setLogs(data);
    });

    return unsub;
  }, []);

  const generateInsights = async () => {
    if (logs.length < 3) return;
    setAnalyzing(true);
    const newInsights = await getHealthInsights(logs);
    setInsights(newInsights);
    setAnalyzing(false);
  };

  const chartData = logs
    .filter(l => l.type === 'state')
    .slice(0, 14)
    .reverse()
    .map(l => ({
      time: format(l.timestamp?.toDate ? l.timestamp.toDate() : l.timestamp, 'HH:mm'),
      energy: (l.data as any).energy,
      focus: (l.data as any).focus,
    }));

  return (
    <div className="space-y-10">
      {/* Header Stat Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-12 h-12 text-emerald-400" />
          </div>
          <p className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-2">{t.dashboard.energy}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-emerald-400">{logs.find(l => (l.data as any).energy)?.data && (logs.find(l => l.type === 'state')?.data as any).energy || '--'}</h3>
            <span className="text-sm text-white/30">/ 10</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-green-400">
            <TrendingUp className="w-3 h-3" />
            <span>Optimal Baseline</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Brain className="w-12 h-12 text-blue-500" />
          </div>
          <p className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-2">{t.dashboard.focus}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-blue-400">{logs.find(l => (l.data as any).focus)?.data && (logs.find(l => l.type === 'state')?.data as any).focus || '--'}</h3>
            <span className="text-sm text-white/30">/ 5</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-blue-400">
            <Sparkles className="w-3 h-3" />
            <span>Neural Ready</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Moon className="w-12 h-12 text-purple-500" />
          </div>
          <p className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-2">{t.dashboard.recovery}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-white">
              {logs.find(l => (l.data as any).sleepDuration)?.data && (logs.find(l => (l.data as any).sleepDuration)?.data as any).sleepDuration || '--'}
            </h3>
            <span className="text-sm text-white/30">h</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-purple-400">
              <Sparkles className="w-3 h-3" />
              <span>{t.dashboard.sleepQuality}: {(logs.find(l => (l.data as any).sleepQuality)?.data as any)?.sleepQuality || '--'}/10</span>
            </div>
          </div>
          {logs.find(l => (l.data as any).remSleep) && (
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
              <div className="text-center">
                <p className="text-[8px] uppercase text-white/20 font-bold tracking-tighter">REM</p>
                <p className="text-[10px] text-white/60 font-mono">{(logs.find(l => (l.data as any).remSleep)?.data as any).remSleep}h</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] uppercase text-white/20 font-bold tracking-tighter">Deep</p>
                <p className="text-[10px] text-white/60 font-mono">{(logs.find(l => (l.data as any).deepSleep)?.data as any).deepSleep}h</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] uppercase text-white/20 font-bold tracking-tighter">Light</p>
                <p className="text-[10px] text-white/60 font-mono">{(logs.find(l => (l.data as any).lightSleep)?.data as any).lightSleep}h</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Energy Visualization */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">{t.dashboard.timelineTitle}</h2>
            <p className="text-xs text-white/40 italic">{t.dashboard.timelineSub}</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-tighter bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t.dashboard.energy}
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-tighter bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-blue-400">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {t.dashboard.focus}
            </div>
          </div>
        </div>
        
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#ffffff20" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#ffffff20" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                domain={[0, 10]}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="energy" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 0 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="focus" 
                stroke="#3B82F6" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ r: 0 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Middle Row: Insights & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Insights */}
        <section className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-white/80">{t.dashboard.insightEngine}</h3>
             </div>
             <button 
                onClick={generateInsights}
                disabled={analyzing || logs.length < 3}
                className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-full transition-all hover:bg-emerald-500/20 disabled:opacity-30"
             >
                {analyzing ? t.dashboard.calibrating : t.dashboard.syncEngine}
             </button>
          </div>
          <div className="p-6 space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className={cn(
                    "p-4 rounded-xl border-l-2 backdrop-blur-sm",
                    insight.category === 'Metabolic' ? "bg-emerald-500/5 border-emerald-500" :
                    insight.category === 'Neurochemical' ? "bg-blue-500/5 border-blue-500" :
                    "bg-orange-500/5 border-orange-500"
                  )}
                >
                  <p className={cn(
                    "text-[10px] font-semibold italic mb-1",
                    insight.category === 'Metabolic' ? "text-emerald-400" :
                    insight.category === 'Neurochemical' ? "text-blue-400" :
                    "text-orange-400"
                  )}>{insight.title}</p>
                  <p className="text-sm text-white/70 leading-relaxed font-light">{insight.insight}</p>
                  <p className="text-[9px] mt-2 text-white/20 font-mono tracking-tighter uppercase">{insight.category} {t.dashboard.analysis}</p>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 opacity-30">
                <Sparkles className="w-10 h-10 mx-auto mb-4" />
                <p className="text-xs uppercase tracking-widest">{t.dashboard.awaitingData}</p>
              </div>
            )}
          </div>
        </section>

        {/* Recent Timeline */}
        <section className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
           <div className="p-6 border-b border-white/10">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-white/80">{t.dashboard.feedTitle}</h3>
           </div>
           <div className="max-h-[400px] overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="p-4 border-b border-white/5 flex items-start gap-4 hover:bg-white/[0.02] transition-colors group">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5",
                      log.type === 'state' ? "bg-blue-500/10 text-blue-500" :
                      log.type === 'meal' ? "bg-emerald-500/10 text-emerald-500" :
                      log.type === 'sos' ? "bg-red-500/10 text-red-500" :
                      "bg-white/5 text-white/40"
                    )}>
                      {log.type === 'state' ? <Activity size={18} /> :
                       log.type === 'meal' ? <Zap size={18} /> :
                       log.type === 'sos' ? <LifeBuoy size={18} /> :
                       <TrendingUp size={18} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                         <h5 className="text-[10px] uppercase font-bold tracking-widest text-white/80 group-hover:text-emerald-400 transition-colors">{(t.logger.types as any)[log.type] || log.type} {t.dashboard.log}</h5>
                         <span className="text-[9px] text-white/20 font-mono">
                           {format(log.timestamp?.toDate ? log.timestamp.toDate() : log.timestamp, 'HH:mm')}
                         </span>
                      </div>
                      <p className="text-xs text-white/40 font-light italic">
                        {log.type === 'meal' ? `Meal context: ${(log.data as any).notes || 'Standard protocol'}` :
                         log.type === 'state' ? (
                           (log.data as any).category === 'morning' 
                           ? `Recovery: ${(log.data as any).sleepDuration}h / ${(log.data as any).sleepQuality}q (R:${(log.data as any).remSleep} D:${(log.data as any).deepSleep} L:${(log.data as any).lightSleep})`
                           : `Output: ${(log.data as any).energy}e / ${(log.data as any).focus}f`
                         ) :
                         `SOS Intervention Recorded`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-white/10 uppercase tracking-widest text-[10px]">
                   {t.dashboard.awaitingCheckin}
                </div>
              )}
           </div>
        </section>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
