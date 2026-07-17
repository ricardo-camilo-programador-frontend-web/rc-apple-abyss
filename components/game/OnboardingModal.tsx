'use client';

import { ChevronRight, X } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import Modal from '@/components/Modal';
import { analytics } from '@/lib/analytics';
import type { GameEngine } from '@/lib/game/engine';

interface OnboardingModalProps {
  isOpen: boolean;
  engine: GameEngine;
  t: (key: string, params?: Record<string, string | number>) => string;
  onClose: () => void;
}

const ONBOARDING_STEPS = [
  { titleKey: 'onboarding_step1_title', descriptionKey: 'onboarding_step1_description' },
  { titleKey: 'onboarding_step2_title', descriptionKey: 'onboarding_step2_description' },
  { titleKey: 'onboarding_step3_title', descriptionKey: 'onboarding_step3_description' },
] as const;

export default function OnboardingModal({ isOpen, engine, t, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = React.useState(0);

  // Sync currentStep with engine state on mount
  React.useEffect(() => {
    if (isOpen) {
      const onboardingState = engine.getOnboardingState();
      const nextStep = Math.max(0, onboardingState.completedStep + 1);
      if (nextStep < ONBOARDING_STEPS.length) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time initialization from engine state
        setCurrentStep(nextStep);
      } else {
        // Already completed — close
        onClose();
        return;
      }
    }
  }, [isOpen, engine, onClose]);

  // Track onboarding start
  const hasTrackedStart = React.useRef(false);
  React.useEffect(() => {
    if (isOpen && !hasTrackedStart.current) {
      hasTrackedStart.current = true;
      analytics.onboardingStarted();
      analytics.onboardingStepViewed(currentStep);
    }
  }, [isOpen, currentStep]);

  const handleNext = () => {
    engine.completeOnboardingStep(currentStep);

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      analytics.onboardingStepViewed(nextStep);
    } else {
      engine.completeOnboarding();
      analytics.onboardingCompleted(false);
      onClose();
    }
  };

  const handleSkip = () => {
    engine.skipOnboarding();
    analytics.onboardingSkipped();
    analytics.onboardingCompleted(true);
    onClose();
  };

  if (!isOpen || currentStep >= ONBOARDING_STEPS.length) return null;

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} title={t('onboarding_title')}>
      <div className="space-y-4">
        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-4">
          {ONBOARDING_STEPS.map((stepDef, index) => (
            <div
              key={stepDef.titleKey}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-amber-500 scale-125'
                  : index < currentStep
                    ? 'bg-amber-300'
                    : 'bg-stone-300 dark:bg-stone-600'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-2">
            {t(step.titleKey)}
          </h3>
          <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
            {t(step.descriptionKey)}
          </p>
        </motion.div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 flex items-center gap-1"
            aria-label={t('onboarding_skip')}
          >
            <X className="w-4 h-4" />
            {t('onboarding_skip')}
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
            aria-label={
              currentStep < ONBOARDING_STEPS.length - 1
                ? t('onboarding_next')
                : t('onboarding_start')
            }
          >
            {currentStep < ONBOARDING_STEPS.length - 1
              ? t('onboarding_next')
              : t('onboarding_start')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
