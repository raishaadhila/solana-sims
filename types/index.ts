/**
 * Core types for the zkML Bounty Review System
 */

export interface Bounty {
  id: string;
  title: string;
  description: string;
  submitterAddress: string;
  submissionDate: number;
  deliverables: string[];
  metadata: Record<string, any>;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
}

export interface EvaluationCriteria {
  codeQuality: {
    weight: number;
    threshold: number;
  };
  completeness: {
    weight: number;
    threshold: number;
  };
  documentation: {
    weight: number;
    threshold: number;
  };
  performance: {
    weight: number;
    threshold: number;
  };
  security: {
    weight: number;
    threshold: number;
  };
}

export interface EvaluationResult {
  bountyId: string;
  scores: {
    codeQuality: number;
    completeness: number;
    documentation: number;
    performance: number;
    security: number;
  };
  weightedScore: number;
  zkProof: string;
  circuitOutput: CircuitOutput;
  approved: boolean;
  timestamp: number;
}

export interface CircuitOutput {
  commitment: string;
  publicInputs: string[];
  privateInputs: string[];
  proof: string;
}

export interface ZkMLEvaluation {
  criteria: EvaluationCriteria;
  inputs: EvaluationInputs;
  output: EvaluationResult;
}

export interface EvaluationInputs {
  submissionContent: string;
  metrics: Record<string, number>;
  evaluatorAddress: string;
}

export interface ReviewRequest {
  bountyId: string;
  submissionContent: string;
  deliverables: string[];
  metrics?: Record<string, number>;
}

export interface ReviewResponse {
  success: boolean;
  bountyId: string;
  evaluation: EvaluationResult;
  message: string;
}
