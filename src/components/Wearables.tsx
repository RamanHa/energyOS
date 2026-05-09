import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, RefreshCw, AlertCircle, Watch, Moon, Heart, Zap, Footprints } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { fetchGoogleFitData } from '../lib/googleFit';
import { connectGoogleFit } from '../lib/firebase';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

export default function Wearables() {
  const { t } = useLanguage();
  
  const [fitToken, setFitToken] = useState<string | null>(sessionStorage.getItem('fitToken'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (fitToken) {
      loadData(fitToken);
    }
  }, [fitToken]);

  const loadData = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGoogleFitData(token);
      parseFitData(data);
    } catch (err: any) {
      if (err.message.includes('403') || err.message.includes('401')) {
        setError(t.wearables.permissionError);
        sessionStorage.removeItem('fitToken');
        setFitToken(null);
      } else {
        setError(t.wearables.fetchError + ': ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setError(null);
    setLoading(true);
    try {
      const credential = await connectGoogleFit();
      if (credential?.accessToken) {
        sessionStorage.setItem('fitToken', credential.accessToken);
        setFitToken(credential.accessToken);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    sessionStorage.removeItem('fitToken');
    setFitToken(null);
    setChartData([]);
  };

  const parseFitData = (data: any) => {
    if (!data || !data.bucket) return;
    
    const parsed = data.bucket.map((bucket: any) => {
      const date = new Date(parseInt(bucket.startTimeMillis));
      const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
      
      let sleepHours = 0;
      let hr = 0;
      let steps = 0;
      let cardio = 0;

      const sleepDataset = bucket.dataset?.find((d: any) => d.dataSourceId?.includes('sleep'));
      const hrDataset = bucket.dataset?.find((d: any) => d.dataSourceId?.includes('heart_rate'));
      const stepsDataset = bucket.dataset?.find((d: any) => d.dataSourceId?.includes('step_count'));
      const cardioDataset = bucket.dataset?.find((d: any) => d.dataSourceId?.includes('heart_minutes'));

      if (sleepDataset?.point?.length > 0) {
        let totalSleepMs = 0;
        sleepDataset.point.forEach((p: any) => {
          const start = parseInt(p.startTimeNanos || '0');
          const end = parseInt(p.endTimeNanos || '0');
          if (start && end) {
            totalSleepMs += (end - start) / 1000000;
          }
        });
        sleepHours = parseFloat((totalSleepMs / (1000 * 60 * 60)).toFixed(1));
      }

      if (hrDataset?.point?.length > 0) {
        const pointVal = hrDataset.point[0]?.value?.[0];
        const rawHr = pointVal?.fpVal || pointVal?.intVal || pointVal?.mapVal || 0;
        hr = Math.round(rawHr);
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

      return {
        day: dayName,
        sleep: sleepHours,
        hr: hr,
        steps: steps,
        cardio: cardio
      };
    });

    setChartData(parsed);
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tighter uppercase">{t.wearables.title}</h2>
        <p className="text-white/40">{t.wearables.subTitle}</p>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}

      {!fitToken ? (
        <div className="bg-[#0a0a0a] border border-white/5 p-12 rounded-3xl text-center max-w-xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
            <Watch size={32} />
          </div>
          <h3 className="text-xl font-bold uppercase tracking-widest mb-3">Google Fit</h3>
          <p className="text-white/40 text-sm mb-8 max-w-sm">
            {t.wearables.subTitle}
          </p>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="bg-white text-black px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin shrink-0" size={16} /> : <Activity size={16} />}
            {loading ? t.wearables.connecting : t.wearables.connect}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-end gap-4">
            <button
               onClick={() => loadData(fitToken)}
               disabled={loading}
               className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
             {loading ? t.wearables.syncing : t.wearables.sync}
            </button>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-all"
            >
              {t.wearables.disconnect}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Steps Chart */}
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Footprints size={20} />
                </div>
                <h3 className="font-bold uppercase tracking-widest text-sm text-white/80">
                  {t.wearables.stepsTitle}
                </h3>
              </div>
              <div className="h-64">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                      />
                      <Bar dataKey="steps" fill="#10b981" radius={[4, 4, 0, 0]} name={t.wearables.steps} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-white/30 text-xs">
                    {t.wearables.noData}
                  </div>
                )}
              </div>
            </div>

            {/* Heart Points Chart */}
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Zap size={20} />
                </div>
                <h3 className="font-bold uppercase tracking-widest text-sm text-white/80">
                  {t.wearables.cardioTitle}
                </h3>
              </div>
              <div className="h-64">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                      />
                      <Bar dataKey="cardio" fill="#f59e0b" radius={[4, 4, 0, 0]} name={t.wearables.points} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-white/30 text-xs">
                    {t.wearables.noData}
                  </div>
                )}
              </div>
            </div>

            {/* Sleep Chart */}
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Moon size={20} />
                </div>
                <h3 className="font-bold uppercase tracking-widest text-sm text-white/80">
                  {t.wearables.sleepTitle}
                </h3>
              </div>
              <div className="h-64">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                      />
                      <Bar dataKey="sleep" fill="#6366f1" radius={[4, 4, 0, 0]} name={t.wearables.hours} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-white/30 text-xs">
                    {t.wearables.noData}
                  </div>
                )}
              </div>
            </div>

            {/* HR Chart */}
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                  <Heart size={20} />
                </div>
                <h3 className="font-bold uppercase tracking-widest text-sm text-white/80">
                  {t.wearables.hrTitle}
                </h3>
              </div>
              <div className="h-64">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="hr" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorHr)" name={t.wearables.bpm} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                   <div className="h-full flex items-center justify-center text-white/30 text-xs">
                    {t.wearables.noData}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
