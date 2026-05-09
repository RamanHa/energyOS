import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { 
  Zap, 
  Activity, 
  Brain, 
  LifeBuoy, 
  FlaskConical, 
  ChevronRight, 
  Sparkles,
  Database
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    icon: Sparkles,
    color: 'text-emerald-400'
  },
  {
    id: 'feed',
    icon: Activity,
    color: 'text-blue-400'
  },
  {
    id: 'logger',
    icon: Brain,
    color: 'text-purple-400'
  },
  {
    id: 'sos',
    icon: LifeBuoy,
    color: 'text-rose-400'
  },
  {
    id: 'vault',
    icon: FlaskConical,
    color: 'text-amber-400'
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsFinishing(true);
      if (auth.currentUser) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userRef, { onboardingCompleted: true });
        } catch (error) {
          console.error("Error finalizing onboarding:", error);
        }
      }
      onComplete();
    }
  };

  const step = STEPS[currentStep];
  const Icon = step.icon;

  const getStepTitle = () => {
    if (step.id === 'welcome') return t.onboarding.welcome;
    if (step.id === 'feed') return t.onboarding.step1;
    if (step.id === 'logger') return t.onboarding.step2;
    if (step.id === 'sos') return t.onboarding.step3;
    if (step.id === 'vault') return t.onboarding.step4;
    return '';
  };

  const getStepDesc = () => {
    if (step.id === 'welcome') return t.onboarding.welcomeSub;
    if (step.id === 'feed') return t.onboarding.step1Desc;
    if (step.id === 'logger') return t.onboarding.step2Desc;
    if (step.id === 'sos') return t.onboarding.step3Desc;
    if (step.id === 'vault') return t.onboarding.step4Desc;
    return '';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-neutral-900 border border-white/10 rounded-[3rem] p-12 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className={`w-24 h-24 mx-auto rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center ${step.color} shadow-2xl`}>
              <Icon size={48} />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter text-white uppercase">{getStepTitle()}</h2>
              <p className="text-sm text-white/40 leading-relaxed font-light font-mono uppercase tracking-wider">
                {getStepDesc()}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex flex-col gap-6">
          <div className="flex justify-center gap-2">
            {STEPS.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1 rounded-full transition-all duration-500 ${
                  idx === currentStep ? 'w-8 bg-emerald-500' : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={isFinishing}
            className="w-full bg-white text-black py-5 rounded-2xl text-xs font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {currentStep === STEPS.length - 1 ? t.onboarding.startFirstLog : t.onboarding.next}
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 opacity-20">
          <Database size={12} className="text-white" />
          <p className="text-[8px] font-mono uppercase tracking-[0.2em] font-bold text-white">N=1 Biological Model Initialized</p>
        </div>
      </motion.div>
    </div>
  );
}
