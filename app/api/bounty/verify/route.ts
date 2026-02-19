/**
 * API Route: POST /api/bounty/verify
 * Verifies a previous evaluation using its zero-knowledge proof
 */

import { NextRequest, NextResponse } from 'next/server';
import { bountyEvaluator } from '@/lib/zkml/bountyEvaluator';
import { EvaluationResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const evaluation: EvaluationResult = body.evaluation;

    if (!evaluation || !evaluation.bountyId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid evaluation object',
        },
        { status: 400 }
      );
    }

    // Verify the evaluation
    const isValid = await bountyEvaluator.verifyEvaluation(evaluation);

    return NextResponse.json(
      {
        success: true,
        bountyId: evaluation.bountyId,
        isValid,
        message: isValid ? 'Proof verification successful' : 'Proof verification failed',
        zkProof: evaluation.zkProof,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
