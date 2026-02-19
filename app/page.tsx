/**
 * Main page component
 */

'use client';

import { BountyReviewForm } from '@/app/components/BountyReviewForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔐 zkML Bounty Review System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered bounty evaluation using Zero-Knowledge Machine Learning (zkML)
            for objective, tamper-proof assessment of contributor work
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <FeatureCard
              icon="🎯"
              title="Objective Evaluation"
              description="AI-driven scoring with predetermined rules and circuits ensures unbiased assessments"
            />
            <FeatureCard
              icon="🔒"
              title="Zero-Knowledge Proofs"
              description="Verify evaluations without revealing scoring logic or sensitive information"
            />
            <FeatureCard
              icon="⚡"
              title="Automated Process"
              description="Significantly reduces review time and eliminates manual assessment bottlenecks"
            />

          <BountyReviewForm />
        </div>
        </div>

        <footer className="text-center text-gray-600 mt-12">
          <p className="mb-2">📊 zkML Bounty Review System - Proof of Concept</p>
          <p className="text-sm">
            Powered by Zero-Knowledge Machine Learning for transparent and trustless evaluation
          </p>
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-700 text-sm">{description}</p>
    </div>
  );
}
