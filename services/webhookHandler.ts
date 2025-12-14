import { esimSync } from './esimSync';
import { supabase } from './supabase';

interface WebhookPayload {
  event: 'ORDER_STATUS' | 'DATA_USAGE' | 'VALIDITY_USAGE';
  [key: string]: any;
}

export const webhookHandler = {
  async handleWebhook(payload: WebhookPayload): Promise<boolean> {
    try {
      await this.logWebhook(payload);

      switch (payload.event) {
        case 'ORDER_STATUS':
          return await this.handleOrderStatus(payload as any);

        case 'DATA_USAGE':
          return await this.handleDataUsage(payload as any);

        case 'VALIDITY_USAGE':
          return await this.handleValidityUsage(payload as any);

        default:
          console.warn(`Unknown webhook event: ${payload.event}`);
          return false;
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      await this.logWebhookError(payload, error);
      return false;
    }
  },

  async handleOrderStatus(payload: {
    event: 'ORDER_STATUS';
    orderNo: string;
    orderStatus: string;
  }): Promise<boolean> {
    const { orderNo, orderStatus } = payload;

    if (orderStatus !== 'GOT_RESOURCE') {
      return true;
    }

    const result = await esimSync.handleOrderReady(orderNo);

    if (result) {
      await this.notifyOrderReady(orderNo);
    }

    return result;
  },

  async handleDataUsage(payload: {
    event: 'DATA_USAGE';
    iccid: string;
    remain: number;
  }): Promise<boolean> {
    const { iccid } = payload;
    await esimSync.handleLowDataUsage(iccid);
    return true;
  },

  async handleValidityUsage(payload: {
    event: 'VALIDITY_USAGE';
    iccid: string;
    remainDays: number;
  }): Promise<boolean> {
    const { iccid } = payload;
    await esimSync.handleLowValidity(iccid);
    return true;
  },

  async logWebhook(payload: WebhookPayload): Promise<void> {
    try {
      await supabase.from('webhook_logs').insert({
        event_type: payload.event,
        payload,
        processed: false,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log webhook:', error);
    }
  },

  async logWebhookError(payload: WebhookPayload, error: any): Promise<void> {
    try {
      await supabase.from('webhook_logs').insert({
        event_type: payload.event,
        payload,
        processed: false,
        error: error instanceof Error ? error.message : String(error),
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }
  },

  async notifyOrderReady(orderNo: string): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('user_id, email')
        .eq('order_no', orderNo)
        .maybeSingle();

      if (order) {
        await supabase.from('notifications').insert({
          user_id: order.user_id,
          type: 'order_ready',
          message: `Your eSIM order ${orderNo} is ready!`,
          related_order_no: orderNo,
          read: false,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to notify order ready:', error);
    }
  },
};
