import { webhookHandler } from '@/services/webhookHandler';

const SECRET_KEY = process.env.ESIM_ACCESS_SECRET_KEY || '';

async function validateSignature(
  request: Request,
  body: string
): Promise<boolean> {
  if (!SECRET_KEY) {
    console.warn('ESIM_ACCESS_SECRET_KEY not configured');
    return true;
  }

  const signature = request.headers.get('x-signature') ||
                   request.headers.get('signature') ||
                   request.headers.get('rt-signature');

  if (!signature) {
    console.warn('No signature header found in webhook request');
    return false;
  }

  try {
    const crypto = await import('crypto');
    const hash = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(body)
      .digest('hex');

    return hash === signature;
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const body = JSON.parse(bodyText);

    const isValid = await validateSignature(request, bodyText);

    if (!isValid && SECRET_KEY) {
      console.error('Webhook signature validation failed');
      return Response.json(
        { success: false, message: 'Invalid signature' },
        { status: 401 }
      );
    }

    const result = await webhookHandler.handleWebhook(body);

    if (result) {
      return Response.json({ success: true, message: 'Webhook processed' });
    } else {
      return Response.json(
        { success: false, message: 'Webhook processing failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Webhook endpoint error:', error);
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
