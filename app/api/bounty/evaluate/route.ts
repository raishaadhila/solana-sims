/**
 * API Route: POST /api/bounty/evaluate
 * Submits a bounty for zkML-based evaluation
 */

import { NextRequest, NextResponse } from 'next/server';
import { bountyEvaluator } from '@/lib/zkml/bountyEvaluator';
import { ReviewRequest, ReviewResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const reviewRequest: ReviewRequest = body;

    // Validate required fields
    if (!reviewRequest.bountyId || !reviewRequest.submissionContent) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: bountyId, submissionContent',
        },
        { status: 400 }
      );
    }

    // Get evaluator address from headers or use default
    const evaluatorAddress = request.headers.get('x-evaluator-address') || 'default-evaluator';

    // Execute evaluation
    const evaluation = await bountyEvaluator.evaluateBounty(
      reviewRequest,
      evaluatorAddress
    );

    // Prepare response
    const response: ReviewResponse = {
      success: true,
      bountyId: reviewRequest.bountyId,
      evaluation,
      message: evaluation.approved
        ? 'Bounty approved! All criteria met.'
        : 'Bounty rejected. Some criteria did not meet thresholds.',
    };

    // Generate audit report
    const auditReport = bountyEvaluator.generateAuditReport(evaluation);

    // Return response with audit report in header
    const responseObj = NextResponse.json(response, { status: 200 });
    responseObj.headers.set('x-audit-report', encodeURIComponent(auditReport));

    return responseObj;
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}

/**
 * API Route: GET /api/bounty/evaluate
 * Retrieves evaluation history
 */
export async function GET(request: NextRequest) {
  try {
    const history = bountyEvaluator.getEvaluationHistory();

    // Convert Map to object for JSON serialization
    const historyObj: Record<string, any> = {};
    history.forEach((value, key) => {
      historyObj[key] = value;
    });

    return NextResponse.json(
      {
        success: true,
        evaluationCount: history.size,
        evaluations: historyObj,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('History retrieval error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve evaluation history',
      },
      { status: 500 }
    );
  }
}
