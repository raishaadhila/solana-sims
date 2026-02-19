/**
 * Example test cases for zkML Bounty Review System
 * 
 * These demonstrate how to test evaluations and verify proofs
 * Can be integrated with Jest or other testing frameworks
 */

import { BountyEvaluator } from '@/lib/zkml/bountyEvaluator';
import { EvaluationCircuit, DEFAULT_CRITERIA } from '@/lib/circuits/evaluationCircuit';
import { ReviewRequest } from '@/types';

describe('zkML Bounty Review System', () => {
  let evaluator: BountyEvaluator;
  let circuit: EvaluationCircuit;

  beforeEach(() => {
    evaluator = new BountyEvaluator();
    circuit = new EvaluationCircuit(DEFAULT_CRITERIA);
  });

  describe('Evaluation Circuit', () => {
    test('should execute circuit and generate proof', async () => {
      const scores = {
        codeQuality: 75,
        completeness: 80,
        documentation: 70,
        performance: 85,
        security: 90,
      };

      const output = await circuit.executeCircuit(scores, 'test-evaluator');

      expect(output.commitment).toBeDefined();
      expect(output.commitment.length).toBe(64);
      expect(output.proof).toMatch(/^0x/);
      expect(output.publicInputs).toHaveLength(2);
    });

    test('should validate scores against criteria', async () => {
      const scores = {
        codeQuality: 200, // Should be clamped to 100
        completeness: -50, // Should be clamped to 0
        documentation: 75,
        performance: 50,
        security: 60,
      };

      const output = await circuit.executeCircuit(scores, 'test-evaluator');
      const isValid = await circuit.verifyCircuit(output);

      expect(isValid).toBe(true);
    });

    test('should verify circuit output', async () => {
      const scores = {
        codeQuality: 70,
        completeness: 75,
        documentation: 65,
        performance: 80,
        security: 85,
      };

      const output = await circuit.executeCircuit(scores, 'test-evaluator');
      const isValid = await circuit.verifyCircuit(output);

      expect(isValid).toBe(true);
    });

    test('should reject invalid circuit output', async () => {
      const invalidOutput = {
        commitment: 'invalid',
        publicInputs: [],
        privateInputs: [],
        proof: 'invalid-proof',
      };

      const isValid = await circuit.verifyCircuit(invalidOutput);
      expect(isValid).toBe(false);
    });
  });

  describe('Bounty Evaluator', () => {
    test('should approve high-quality bounty', async () => {
      const request: ReviewRequest = {
        bountyId: 'test-001',
        submissionContent: `
          High-quality implementation with:
          - Security audit completed
          - Performance benchmarks
          - Comprehensive documentation
          - Vulnerability assessment
        `,
        deliverables: [
          'Feature A',
          'Feature B',
          'Documentation',
          'Security Report',
        ],
        metrics: {
          codeQuality: 80,
          completeness: 85,
          documentation: 80,
          performance: 75,
          security: 85,
        },
      };

      const evaluation = await evaluator.evaluateBounty(
        request,
        'test-evaluator'
      );

      expect(evaluation.approved).toBe(true);
      expect(evaluation.weightedScore).toBeGreaterThanOrEqual(65);
      expect(evaluation.zkProof).toBeDefined();
    });

    test('should reject low-quality bounty', async () => {
      const request: ReviewRequest = {
        bountyId: 'test-002',
        submissionContent: 'Quick implementation',
        deliverables: ['Implementation'],
      };

      const evaluation = await evaluator.evaluateBounty(
        request,
        'test-evaluator'
      );

      expect(evaluation.approved).toBe(false);
    });

    test('should maintain evaluation history', async () => {
      const request1: ReviewRequest = {
        bountyId: 'test-003',
        submissionContent: 'Test submission 1',
        deliverables: ['Feature 1'],
      };

      const request2: ReviewRequest = {
        bountyId: 'test-004',
        submissionContent: 'Test submission 2',
        deliverables: ['Feature 2'],
      };

      await evaluator.evaluateBounty(request1, 'test-evaluator');
      await evaluator.evaluateBounty(request2, 'test-evaluator');

      const history = evaluator.getEvaluationHistory();
      expect(history.size).toBe(2);
      expect(history.has('test-003')).toBe(true);
      expect(history.has('test-004')).toBe(true);
    });

    test('should verify evaluation with proof', async () => {
      const request: ReviewRequest = {
        bountyId: 'test-005',
        submissionContent: `
          Security implementation with:
          - Security audit
          - Vulnerability fixes
        `,
        deliverables: ['Security Module'],
        metrics: {
          codeQuality: 70,
          completeness: 70,
          documentation: 60,
          performance: 65,
          security: 90,
        },
      };

      const evaluation = await evaluator.evaluateBounty(
        request,
        'test-evaluator'
      );

      const isValid = await evaluator.verifyEvaluation(evaluation);
      expect(isValid).toBe(true);
    });

    test('should generate audit report', async () => {
      const request: ReviewRequest = {
        bountyId: 'test-006',
        submissionContent: 'Test submission',
        deliverables: ['Feature'],
      };

      const evaluation = await evaluator.evaluateBounty(
        request,
        'test-evaluator'
      );

      const report = evaluator.generateAuditReport(evaluation);
      expect(report).toContain('AUDIT REPORT');
      expect(report).toContain('test-006');
      expect(report).toContain('Weighted Score');
      expect(report).toContain('ZERO-KNOWLEDGE PROOF');
    });

    test('should handle custom metrics', async () => {
      const request: ReviewRequest = {
        bountyId: 'test-007',
        submissionContent: 'Test submission',
        deliverables: ['Feature'],
        metrics: {
          codeQuality: 90,
          completeness: 95,
          documentation: 85,
          performance: 88,
          security: 92,
        },
      };

      const evaluation = await evaluator.evaluateBounty(
        request,
        'test-evaluator'
      );

      expect(evaluation.scores.codeQuality).toBe(90);
      expect(evaluation.scores.completeness).toBe(95);
      expect(evaluation.weightedScore).toBeGreaterThan(85);
    });
  });

  describe('Integration Tests', () => {
    test('end-to-end evaluation flow', async () => {
      const request: ReviewRequest = {
        bountyId: 'e2e-001',
        submissionContent: `
          Complete implementation with:
          - Full security audit
          - Performance optimization
          - Comprehensive documentation
          - Vulnerability assessment completed
        `,
        deliverables: [
          'Core Implementation',
          'Security Audit',
          'Documentation',
          'Performance Report',
        ],
      };

      // Step 1: Evaluate
      const evaluation = await evaluator.evaluateBounty(
        request,
        'e2e-evaluator'
      );
      expect(evaluation).toBeDefined();
      expect(evaluation.zkProof).toBeDefined();

      // Step 2: Verify proof
      const isValid = await evaluator.verifyEvaluation(evaluation);
      expect(isValid).toBe(true);

      // Step 3: Generate audit report
      const report = evaluator.generateAuditReport(evaluation);
      expect(report).toContain(evaluation.bountyId);

      // Step 4: Retrieve from history
      const history = evaluator.getEvaluationHistory();
      const storedEvaluation = history.get('e2e-001');
      expect(storedEvaluation).toBeDefined();
      expect(storedEvaluation?.zkProof).toBe(evaluation.zkProof);
    });

    test('multiple concurrent evaluations', async () => {
      const requests: ReviewRequest[] = [];

      for (let i = 0; i < 5; i++) {
        requests.push({
          bountyId: `concurrent-${i}`,
          submissionContent: `Submission ${i}`,
          deliverables: [`Feature ${i}`],
        });
      }

      const evaluations = await Promise.all(
        requests.map(req => evaluator.evaluateBounty(req, 'test-evaluator'))
      );

      expect(evaluations).toHaveLength(5);
      evaluations.forEach(eval => {
        expect(eval.zkProof).toBeDefined();
        expect(eval.circuitOutput).toBeDefined();
      });

      const history = evaluator.getEvaluationHistory();
      expect(history.size).toBe(5);
    });
  });
});

// Export test utilities
export const testUtils = {
  createTestBounty: (overrides?: Partial<ReviewRequest>): ReviewRequest => ({
    bountyId: 'test-bounty',
    submissionContent: 'Test content',
    deliverables: ['Feature'],
    ...overrides,
  }),

  createHighQualityBounty: (): ReviewRequest => ({
    bountyId: 'high-quality',
    submissionContent: 'High-quality implementation with security audit and documentation',
    deliverables: ['Feature 1', 'Feature 2', 'Documentation', 'Security'],
    metrics: {
      codeQuality: 85,
      completeness: 90,
      documentation: 85,
      performance: 80,
      security: 90,
    },
  }),

  createLowQualityBounty: (): ReviewRequest => ({
    bountyId: 'low-quality',
    submissionContent: 'Basic implementation',
    deliverables: ['Implementation'],
    metrics: {
      codeQuality: 40,
      completeness: 35,
      documentation: 20,
      performance: 30,
      security: 25,
    },
  }),
};
