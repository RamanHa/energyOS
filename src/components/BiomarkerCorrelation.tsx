import React, { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { LabResult } from '../types';
import { useLanguage } from '../lib/LanguageContext';
import { motion } from 'motion/react';
import { BarChart2, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface BiomarkerCorrelationProps {
  labs: LabResult[];
}

export default function BiomarkerCorrelation({ labs }: BiomarkerCorrelationProps) {
  const { t } = useLanguage();
  const [markerX, setMarkerX] = useState<string>('');
  const [markerY, setMarkerY] = useState<string>('');

  const uniqueMarkers = useMemo(() => {
    const set = new Set<string>();
    labs.forEach(l => set.add(l.marker));
    return Array.from(set).sort();
  }, [labs]);

  // Data pairing logic: Find pairs recorded within 30 days of each other
  const pairedData = useMemo(() => {
    if (!markerX || !markerY || markerX === markerY) return [];

    const xLabs = labs.filter(l => l.marker === markerX)
      .sort((a, b) => new Date(a.date.toDate ? a.date.toDate() : a.date).getTime() - new Date(b.date.toDate ? b.date.toDate() : b.date).getTime());
    const yLabs = labs.filter(l => l.marker === markerY)
      .sort((a, b) => new Date(a.date.toDate ? a.date.toDate() : a.date).getTime() - new Date(b.date.toDate ? b.date.toDate() : b.date).getTime());

    const pairs: { x: number; y: number; date: string }[] = [];

    xLabs.forEach(xl => {
      const xDate = xl.date.toDate ? xl.date.toDate() : new Date(xl.date);
      
      // Find closest Y lab within 30 days
      let closestY: LabResult | null = null;
      let minDiff = 31;

      yLabs.forEach(yl => {
        const yDate = yl.date.toDate ? yl.date.toDate() : new Date(yl.date);
        const diff = Math.abs(differenceInDays(xDate, yDate));
        if (diff < minDiff) {
          minDiff = diff;
          closestY = yl;
        }
      });

      if (closestY) {
        pairs.push({
          x: xl.value,
          y: (closestY as LabResult).value,
          date: format(xDate, 'MMM yyyy')
        });
      }
    });

    return pairs;
  }, [labs, markerX, markerY]);

  const correlation = useMemo(() => {
    if (pairedData.length < 2) return null;
    
    // Simple Pearson correlation
    const n = pairedData.length;
    const sumX = pairedData.reduce((acc, p) => acc + p.x, 0);
    const sumY = pairedData.reduce((acc, p) => acc + p.y, 0);
    const sumXY = pairedData.reduce((acc, p) => acc + p.x * p.y, 0);
    const sumX2 = pairedData.reduce((acc, p) => acc + p.x * p.x, 0);
    const sumY2 = pairedData.reduce((acc, p) => acc + p.y * p.y, 0);

    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;
    return numerator / denominator;
  }, [pairedData]);

  const getCorrelationStrength = (r: number) => {
    const absR = Math.abs(r);
    if (absR < 0.3) return { label: t.vault.weak, color: 'text-white/20' };
    if (absR < 0.7) return { label: t.vault.moderate, color: 'text-blue-400' };
    return { label: t.vault.strong, color: 'text-emerald-400' };
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-8 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">{t.vault.correlationExplorer}</h3>
          <p className="text-[10px] text-white/30 uppercase font-mono mt-1">{t.vault.correlationSub}</p>
        </div>
        <BarChart2 size={24} className="text-white/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[9px] uppercase font-bold text-white/40 tracking-widest">{t.vault.selectX}</label>
          <select 
            value={markerX}
            onChange={e => setMarkerX(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500/50"
          >
            <option value="" className="bg-neutral-900">Marker A...</option>
            {uniqueMarkers.map(m => <option key={m} value={m} className="bg-neutral-900">{m}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] uppercase font-bold text-white/40 tracking-widest">{t.vault.selectY}</label>
          <select 
            value={markerY}
            onChange={e => setMarkerY(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500/50"
          >
            <option value="" className="bg-neutral-900">Marker B...</option>
            {uniqueMarkers.map(m => <option key={m} value={m} className="bg-neutral-900">{m}</option>)}
          </select>
        </div>
      </div>

      <div className="h-64 mt-8 relative">
        {pairedData.length >= 2 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                type="number" 
                dataKey="x" 
                name={markerX} 
                stroke="#ffffff40" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              >
                <Label value={markerX} position="bottom" offset={0} style={{ fill: '#ffffff20', fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold' }} />
              </XAxis>
              <YAxis 
                type="number" 
                dataKey="y" 
                name={markerY} 
                stroke="#ffffff40" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              >
                <Label value={markerY} angle={-90} position="left" offset={0} style={{ fill: '#ffffff20', fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold' }} />
              </YAxis>
              <ZAxis type="category" dataKey="date" name="Date" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                contentStyle={{ backgroundColor: '#000000', border: '1px solid #ffffff20', borderRadius: '12px' }}
                itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase' }}
                labelStyle={{ display: 'none' }}
              />
              <Scatter name="Biomarkers" data={pairedData} fill="#10b981" />
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 rounded-2xl border border-dashed border-white/5 space-y-4">
            <Activity size={32} className="text-white/5 animate-pulse" />
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{t.vault.minPairs}</p>
          </div>
        )}
      </div>

      {correlation !== null && (
        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-white/5 ${getCorrelationStrength(correlation).color}`}>
              {correlation > 0.3 ? <TrendingUp size={20} /> : correlation < -0.3 ? <TrendingDown size={20} /> : <Minus size={20} />}
            </div>
            <div>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{t.vault.correlationStrength}</p>
              <p className={`text-xs font-bold uppercase tracking-widest ${getCorrelationStrength(correlation).color}`}>
                {getCorrelationStrength(correlation).label} ({correlation.toFixed(2)})
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
