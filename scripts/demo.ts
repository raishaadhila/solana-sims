#!/usr/bin/env node

/**
 * Demo Script for zkML Bounty Review System
 * 
 * This script demonstrates the full evaluation flow without needing to run the Next.js server
 * Usage: npx ts-node scripts/demo.ts
 */

import { BountyEvaluator } from '../lib/zkml/bountyEvaluator';
import { ReviewRequest } from '../types';

async function runDemo() {
  console.log('🚀 zkML Bounty Review System - PoC Demo\n');
  console.log('=' .repeat(60));

  const evaluator = new BountyEvaluator();

  // Demo Bounty 1: High-quality submission
  const highQualitySubmission: ReviewRequest = {
    bountyId: 'bounty-high-001',
    submissionContent: `
      This is a high-quality submission demonstrating excellent code quality
      and comprehensive implementation.
      
      # Implementation Details
      - Complete authentication system with security audit
      - Performance benchmarks showing 95% efficiency improvement
      - Comprehensive documentation and API reference
      - Security vulnerability assessment and fixes
      - Unit tests with 99% code coverage
      - Performance optimization techniques applied
      
      The code follows best practices and industry standards.
    `,
    deliverables: [
      'Authentication System - Complete',
      'Database Layer - Optimized',
      'API Documentation - Full',
      'Security Audit Report',
      'Performance Benchmarks',
      'Unit Test Suite',
    ],
  };

  // Demo Bounty 2: Medium-quality submission
  const mediumQualitySubmission: ReviewRequest = {
    bountyId: 'bounty-medium-001',
    submissionContent: `
      This submission includes the requested features with basic documentation.
      
      Features Implemented:
      - User authentication module
      - Data persistence layer
      - Basic API endpoints
      
      Documentation is available in README.md
    `,
    deliverables: [
      'Authentication Module',
      'Database Layer',
      'API Endpoints',
    ],
  };

  // Demo Bounty 3: Low-quality submission (will be rejected)
  const lowQualitySubmission: ReviewRequest = {
    bountyId: 'bounty-low-001',
    submissionContent: `
      Quick implementation of the requested features.
      Code is functional but needs review.
    `,
    deliverables: [
      'Basic implementation',
    ],
  };

  const evaluatorAddress = 'zkml-demo-evaluator-001';

  try {
    // Evaluate high-quality submission
    console.log('\n📊 Evaluating High-Quality Submission...\n');
    const highQualityEval = await evaluator.evaluateBounty(
      highQualitySubmission,
      evaluatorAddress
    );
    displayEvaluation(highQualityEval);
    console.log(evaluator.generateAuditReport(highQualityEval));

    // Evaluate medium-quality submission
    console.log('\n📊 Evaluating Medium-Quality Submission...\n');
    const mediumQualityEval = await evaluator.evaluateBounty(
      mediumQualitySubmission,
      evaluatorAddress
    );
    displayEvaluation(mediumQualityEval);
    console.log(evaluator.generateAuditReport(mediumQualityEval));

    // Evaluate low-quality submission
    console.log('\n📊 Evaluating Low-Quality Submission...\n');
    const lowQualityEval = await evaluator.evaluateBounty(
      lowQualitySubmission,
      evaluatorAddress
    );
    displayEvaluation(lowQualityEval);
    console.log(evaluator.generateAuditReport(lowQualityEval));

    // Verify proofs
    console.log('\n' + '='.repeat(60));
    console.log('🔐 Verifying Zero-Knowledge Proofs...\n');

    const verifications = [
      {
        name: 'High-Quality Submission',
        eval: highQualityEval,
      },
      {
        name: 'Medium-Quality Submission',
        eval: mediumQualityEval,
      },
      {
        name: 'Low-Quality Submission',
        eval: lowQualityEval,
      },
    ];

    for (const { name, eval: evaluation } of verifications) {
      const isValid = await evaluator.verifyEvaluation(evaluation);
      console.log(`✓ ${name}: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }

    // Show statistics
    console.log('\n' + '='.repeat(60));
    console.log('📈 Evaluation Statistics\n');
    const history = evaluator.getEvaluationHistory();
    const approved = Array.from(history.values()).filter(e => e.approved).length;
    const rejected = history.size - approved;
    const avgScore = Array.from(history.values()).reduce((sum, e) => sum + e.weightedScore, 0) / history.size;

    console.log(`Total Evaluations: ${history.size}`);
    console.log(`Approved: ${approved} (${((approved / history.size) * 100).toFixed(1)}%)`);
    console.log(`Rejected: ${rejected} (${((rejected / history.size) * 100).toFixed(1)}%)`);
    console.log(`Average Score: ${avgScore.toFixed(2)}/100`);

    console.log('\n' + '='.repeat(60));
    console.log('✨ Demo completed successfully!\n');
  } catch (error) {
    console.error('❌ Error during demo:', error);
    process.exit(1);
  }
}

function displayEvaluation(evaluation: any) {
  console.log(`Bounty ID: ${evaluation.bountyId}`);
  console.log(`Status: ${evaluation.approved ? '✅ APPROVED' : '❌ REJECTED'}`);
  console.log(`Weighted Score: ${evaluation.weightedScore.toFixed(2)}/100\n`);
  console.log('Detailed Scores:');
  console.log(`  Code Quality: ${evaluation.scores.codeQuality}/100`);
  console.log(`  Completeness: ${evaluation.scores.completeness}/100`);
  console.log(`  Documentation: ${evaluation.scores.documentation}/100`);
  console.log(`  Performance: ${evaluation.scores.performance}/100`);
  console.log(`  Security: ${evaluation.scores.security}/100\n`);
  console.log(`Zero-Knowledge Proof: ${evaluation.zkProof.substring(0, 50)}...`);
  console.log(`Commitment Hash: ${evaluation.circuitOutput.commitment.substring(0, 50)}...\n`);
}

// Run the demo
runDemo();
