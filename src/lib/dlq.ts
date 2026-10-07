import { prisma } from './prisma';

export interface DLQJob {
  id: string;
  jobType: 'EMAIL_DISPATCH' | 'WEBHOOK_DISPATCH' | 'ERP_SYNC';
  payload: any;
  errorReason: string;
  attempts: number;
  maxAttempts: number;
  nextRetryAt: string;
  status: 'PENDING_RETRY' | 'FAILED_PERMANENTLY' | 'RESOLVED';
  createdAt: string;
}

// In-memory queue fallback if DB queue table is busy
const inMemoryDLQ: DLQJob[] = [];

/**
 * Push a failed email/webhook dispatch to the Dead Letter Queue
 */
export async function enqueueDeadLetterJob(
  jobType: 'EMAIL_DISPATCH' | 'WEBHOOK_DISPATCH' | 'ERP_SYNC',
  payload: any,
  errorReason: string
) {
  const job: DLQJob = {
    id: `dlq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    jobType,
    payload,
    errorReason,
    attempts: 1,
    maxAttempts: 5,
    nextRetryAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Retry in 5 minutes
    status: 'PENDING_RETRY',
    createdAt: new Date().toISOString(),
  };

  inMemoryDLQ.push(job);

  try {
    // Record in AuditLog for permanent persistence
    await prisma.auditLog.create({
      data: {
        action: `DLQ_ENQUEUED:${jobType}`,
        actorEmail: payload?.email || payload?.to || 'system',
        entityType: 'DeadLetterQueue',
        entityRef: job.id,
        details: JSON.stringify({
          errorReason,
          nextRetryAt: job.nextRetryAt,
          payload: typeof payload === 'object' ? payload : { raw: payload },
        }),
      },
    });
  } catch (err) {
    console.error('Failed to log DLQ job to AuditLog:', err);
  }

  console.warn(`[DLQ System] Job ${job.id} enqueued for retry in 5 minutes due to: ${errorReason}`);
  return job;
}

/**
 * Retrieve active Dead Letter Queue jobs
 */
export function getDeadLetterJobs() {
  return inMemoryDLQ;
}

/**
 * Retry all pending Dead Letter Queue jobs
 */
export async function processDeadLetterQueue(retryFn: (job: DLQJob) => Promise<boolean>) {
  const pendingJobs = inMemoryDLQ.filter(j => j.status === 'PENDING_RETRY');
  let processed = 0;

  for (const job of pendingJobs) {
    try {
      job.attempts += 1;
      const success = await retryFn(job);
      if (success) {
        job.status = 'RESOLVED';
        processed++;
      } else if (job.attempts >= job.maxAttempts) {
        job.status = 'FAILED_PERMANENTLY';
      } else {
        job.nextRetryAt = new Date(Date.now() + Math.pow(2, job.attempts) * 60 * 1000).toISOString();
      }
    } catch (err: any) {
      if (job.attempts >= job.maxAttempts) {
        job.status = 'FAILED_PERMANENTLY';
      }
    }
  }

  return { processed, remaining: inMemoryDLQ.filter(j => j.status === 'PENDING_RETRY').length };
}
