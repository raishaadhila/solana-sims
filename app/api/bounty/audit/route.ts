/**
 * API Route: POST /api/bounty/audit
 * Generates audit report for an evaluation
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

    // Generate audit report
    const auditReport = bountyEvaluator.generateAuditReport(evaluation);

    return NextResponse.json(
      {
        success: true,
        bountyId: evaluation.bountyId,
        auditReport,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Audit report error:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to generate audit report: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
