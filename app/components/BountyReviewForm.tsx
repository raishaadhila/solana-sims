'use client';

import { useState } from 'react';
import { ReviewRequest, ReviewResponse, EvaluationResult } from '@/types';

export function BountyReviewForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bountyId: 'bounty-001',
    submissionContent: '',
    deliverables: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const reviewRequest: ReviewRequest = {
        bountyId: formData.bountyId,
        submissionContent: formData.submissionContent,
        deliverables: formData.deliverables
          .split('\n')
          .filter(d => d.trim()),
      };

      const response = await fetch('/api/bounty/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-evaluator-address': 'poc-evaluator',
        },
        body: JSON.stringify(reviewRequest),
      });

      if (!response.ok) {
        throw new Error('Evaluation failed');
      }

      const data: ReviewResponse = await response.json();
      setResult(data.evaluation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">zkML Bounty Review</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Bounty ID</label>
          <input
            type="text"
            value={formData.bountyId}
            onChange={e => setFormData({ ...formData, bountyId: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., bounty-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Submission Content</label>
          <textarea
            value={formData.submissionContent}
            onChange={e =>
              setFormData({ ...formData, submissionContent: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-48"
            placeholder="Paste submission content here..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Deliverables (one per line)</label>
          <textarea
            value={formData.deliverables}
            onChange={e =>
              setFormData({ ...formData, deliverables: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
            placeholder="Feature 1&#10;Feature 2&#10;Documentation"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
        >
          {loading ? 'Evaluating...' : 'Submit for zkML Evaluation'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {result && <EvaluationResultCard evaluation={result} />}
    </div>
  );
}

function EvaluationResultCard({ evaluation }: { evaluation: EvaluationResult }) {
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [showProof, setShowProof] = useState(false);

  const handleGenerateAudit = async () => {
    try {
      const response = await fetch('/api/bounty/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluation }),
      });

      const data = await response.json();
      setAuditReport(data.auditReport);
    } catch (err) {
      console.error('Failed to generate audit report', err);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className={`p-6 rounded-lg border-2 ${
        evaluation.approved
          ? 'bg-green-50 border-green-300'
          : 'bg-red-50 border-red-300'
      }`}>
        <h2 className="text-2xl font-bold mb-4">
          {evaluation.approved ? '✓ APPROVED' : '✗ REJECTED'}
        </h2>
        <p className="text-lg font-semibold mb-4">
          Weighted Score: {evaluation.weightedScore.toFixed(2)}/100
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded border">
            <p className="text-xs text-gray-600 uppercase">Code Quality</p>
            <p className="text-2xl font-bold">{evaluation.scores.codeQuality}</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <p className="text-xs text-gray-600 uppercase">Completeness</p>
            <p className="text-2xl font-bold">{evaluation.scores.completeness}</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <p className="text-xs text-gray-600 uppercase">Documentation</p>
            <p className="text-2xl font-bold">{evaluation.scores.documentation}</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <p className="text-xs text-gray-600 uppercase">Performance</p>
            <p className="text-2xl font-bold">{evaluation.scores.performance}</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <p className="text-xs text-gray-600 uppercase">Security</p>
            <p className="text-2xl font-bold">{evaluation.scores.security}</p>
          </div>
          <div className="bg-white p-4 rounded border">
            <p className="text-xs text-gray-600 uppercase">Bounty ID</p>
            <p className="text-sm font-mono break-all">{evaluation.bountyId}</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGenerateAudit}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
          >
            Generate Audit Report
          </button>

          <button
            onClick={() => setShowProof(!showProof)}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded transition"
          >
            {showProof ? 'Hide' : 'Show'} ZK Proof
          </button>
        </div>
      </div>

      {showProof && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-bold mb-3">Zero-Knowledge Proof</h3>
          <div className="space-y-2 text-xs font-mono">
            <div>
              <p className="text-gray-600">Commitment:</p>
              <p className="break-all bg-white p-2 rounded border">
                {evaluation.circuitOutput.commitment}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Proof:</p>
              <p className="break-all bg-white p-2 rounded border">
                {evaluation.zkProof}
              </p>
            </div>
          </div>
        </div>
      )}

      {auditReport && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-bold mb-3">Audit Report</h3>
          <pre className="bg-white p-4 rounded border text-xs overflow-auto max-h-64">
            {auditReport}
          </pre>
        </div>
      )}
    </div>
  );
}
