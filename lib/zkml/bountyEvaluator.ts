/**
 * zkML Bounty Evaluator
 * Main service for evaluating bounty submissions using zero-knowledge machine learning
 */

import { EvaluationCircuit, DEFAULT_CRITERIA } from '@/lib/circuits/evaluationCircuit';
import {
  Bounty,
  EvaluationResult,
  EvaluationInputs,
  ReviewRequest,
  CircuitOutput,
} from '@/types';

export class BountyEvaluator {
  private circuit: EvaluationCircuit;
  private evaluationHistory: Map<string, EvaluationResult> = new Map();

  constructor() {
    this.circuit = new EvaluationCircuit(DEFAULT_CRITERIA);
  }

  /**
   * Main evaluation method: submits bounty for zkML-based review
   */
  async evaluateBounty(
    request: ReviewRequest,
    evaluatorAddress: string
  ): Promise<EvaluationResult> {
    // Step 1: Analyze submission content
    const scores = await this.analyzeSubmission(
      request.submissionContent,
      request.deliverables,
      request.metrics
    );

    // Step 2: Execute evaluation circuit (generates zk-proof)
    const circuitOutput = await this.circuit.executeCircuit(scores, evaluatorAddress);

    // Step 3: Verify circuit output
    const isValid = await this.circuit.verifyCircuit(circuitOutput);
    if (!isValid) {
      throw new Error('Circuit verification failed');
    }

    // Step 4: Calculate final score
    const weightedScore = parseFloat(circuitOutput.publicInputs[1]);
    const approved = this.determineApproval(scores, weightedScore);

    // Step 5: Create evaluation result with proof
    const evaluation: EvaluationResult = {
      bountyId: request.bountyId,
      scores,
      weightedScore,
      zkProof: circuitOutput.proof,
      circuitOutput,
      approved,
      timestamp: Date.now(),
    };

    // Store for auditing
    this.evaluationHistory.set(request.bountyId, evaluation);

    return evaluation;
  }

  /**
   * Analyzes submission content using AI-based metrics
   * In production, would integrate with actual AI models
   */
  private async analyzeSubmission(
    content: string,
    deliverables: string[],
    metrics?: Record<string, number>
  ): Promise<{
    codeQuality: number;
    completeness: number;
    documentation: number;
    performance: number;
    security: number;
  }> {
    // If metrics are provided (e.g., from AI analysis), use them
    if (metrics && Object.keys(metrics).length > 0) {
      return {
        codeQuality: metrics.codeQuality ?? 0,
        completeness: metrics.completeness ?? 0,
        documentation: metrics.documentation ?? 0,
        performance: metrics.performance ?? 0,
        security: metrics.security ?? 0,
      };
    }

    // Otherwise, use heuristic-based scoring for PoC
    return this.generateHeuristicScores(content, deliverables);
  }

  /**
   * Generates heuristic-based scores for PoC demonstration
   */
  private generateHeuristicScores(
    content: string,
    deliverables: string[]
  ): {
    codeQuality: number;
    completeness: number;
    documentation: number;
    performance: number;
    security: number;
  } {
    const contentLength = content.length;
    const deliverablesCount = deliverables.length;

    // Code Quality: Based on content length and structure
    const codeQuality = Math.min(
      100,
      (contentLength / 1000) * 50 + (deliverablesCount > 0 ? 30 : 0)
    );

    // Completeness: Based on number of deliverables
    const completeness = Math.min(100, deliverablesCount * 20);

    // Documentation: Based on content indicators
    const hasDocumentation =
      content.toLowerCase().includes('documentation') ||
      content.toLowerCase().includes('readme') ||
      content.toLowerCase().includes('api');
    const documentation = hasDocumentation ? 75 : 40;

    // Performance: Based on performance-related keywords
    const hasPerformanceMetrics =
      content.toLowerCase().includes('performance') ||
      content.toLowerCase().includes('benchmark') ||
      content.toLowerCase().includes('optimization');
    const performance = hasPerformanceMetrics ? 70 : 50;

    // Security: Based on security-related keywords
    const hasSecurityMeasures =
      content.toLowerCase().includes('security') ||
      content.toLowerCase().includes('audit') ||
      content.toLowerCase().includes('vulnerability');
    const security = hasSecurityMeasures ? 80 : 45;

    return {
      codeQuality: Math.round(codeQuality),
      completeness: Math.round(completeness),
      documentation: Math.round(documentation),
      performance: Math.round(performance),
      security: Math.round(security),
    };
  }

  /**
   * Determines if bounty should be approved based on scores
   */
  private determineApproval(
    scores: Record<string, number>,
    weightedScore: number
  ): boolean {
    // Approval criteria: weighted score >= 65 and all critical criteria >= threshold
    const criticalCriteria = ['security', 'completeness'];
    const allCriticalMet = criticalCriteria.every(
      criterion => scores[criterion] >= DEFAULT_CRITERIA[criterion as keyof typeof DEFAULT_CRITERIA].threshold
    );

    return weightedScore >= 65 && allCriticalMet;
  }

  /**
   * Retrieves evaluation history (for auditing)
   */
  getEvaluationHistory(): Map<string, EvaluationResult> {
    return this.evaluationHistory;
  }

  /**
   * Verifies a previous evaluation using its zk-proof
   */
  async verifyEvaluation(evaluation: EvaluationResult): Promise<boolean> {
    return this.circuit.verifyCircuit(evaluation.circuitOutput);
  }

  /**
   * Generates audit report for an evaluation
   */
  generateAuditReport(evaluation: EvaluationResult): string {
    return `
BOUNTY EVALUATION AUDIT REPORT
================================
Bounty ID: ${evaluation.bountyId}
Timestamp: ${new Date(evaluation.timestamp).toISOString()}
Status: ${evaluation.approved ? 'APPROVED' : 'REJECTED'}
Weighted Score: ${evaluation.weightedScore.toFixed(2)}/100

SCORES:
-------
Code Quality: ${evaluation.scores.codeQuality}/100
Completeness: ${evaluation.scores.completeness}/100
Documentation: ${evaluation.scores.documentation}/100
Performance: ${evaluation.scores.performance}/100
Security: ${evaluation.scores.security}/100

ZERO-KNOWLEDGE PROOF:
--------------------
Commitment: ${evaluation.circuitOutput.commitment}
Proof: ${evaluation.zkProof}

This evaluation was conducted using zero-knowledge machine learning (zkML)
to ensure objective, tamper-proof, and auditable results. The proof can be
independently verified without revealing the underlying scoring logic.
    `.trim();
  }
}

// Singleton instance
export const bountyEvaluator = new BountyEvaluator();
