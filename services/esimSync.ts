import { esimAccessApi } from './esimApi';
import { supabase } from './supabase';
import type { EsimAccessStatus } from '@/types';

let pollInterval: any = null;

export const esimSync = {
  startPolling(userId: string, interval: number = 30 * 60 * 1000) {
    if (pollInterval) {
      clearInterval(pollInterval);
    }

    pollInterval = setInterval(async () => {
      await this.syncUserEsims(userId);
    }, interval);
  },

  stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  },

  async syncUserEsims(userId: string) {
    try {
      const { data: esims } = await supabase
        .from('esims')
        .select('id, iccid, order_no')
        .eq('user_id', userId);

      if (!esims || esims.length === 0) {
        return { success: true, updated: 0 };
      }

      let updateCount = 0;

      for (const esim of esims) {
        const response = await esimAccessApi.queryEsimStatus(undefined, esim.iccid);

        if (response.success && response.data) {
          const data = response.data;

          await supabase
            .from('esims')
            .update({
              data_used: data.usedData,
              data_total: data.dataAmount,
              expiry_date: data.expiredTime,
              status: this.mapOrderStatus(data.orderStatus),
              updated_at: new Date().toISOString(),
            })
            .eq('iccid', esim.iccid);

          updateCount++;
        }
      }

      return { success: true, updated: updateCount };
    } catch (error) {
      return {
        success: false,
        updated: 0,
        error: error instanceof Error ? error.message : 'Sync failed',
      };
    }
  },

  async syncSingleEsim(iccid: string) {
    try {
      const response = await esimAccessApi.queryEsimStatus(undefined, iccid);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query failed',
      };
    }
  },

  mapOrderStatus(orderStatus: string): 'active' | 'inactive' | 'expired' {
    if (orderStatus === 'GOT_RESOURCE') {
      return 'active';
    } else if (orderStatus === 'SUSPEND') {
      return 'inactive';
    } else if (orderStatus === 'EXPIRED' || orderStatus === 'REVOKED') {
      return 'expired';
    }
    return 'inactive';
  },

  async handleOrderReady(orderNo: string): Promise<boolean> {
    try {
      const response = await esimAccessApi.queryEsimStatus(orderNo, undefined);

      if (!response.success || !response.data) {
        return false;
      }

      const esimData = response.data;

      const { data: order } = await supabase
        .from('orders')
        .select('id, user_id')
        .eq('order_no', orderNo)
        .single();

      if (order) {
        await supabase.from('esims').insert({
          user_id: order.user_id,
          order_no: orderNo,
          iccid: esimData.iccid,
          country_id: null,
          package_id: null,
          activation_code: esimData.activationCode,
          qr_code: esimData.qrCode,
          status: 'active',
          data_used: 0,
          data_total: esimData.dataAmount,
          purchase_date: new Date().toISOString(),
          expiry_date: esimData.expiredTime,
        });

        await supabase
          .from('orders')
          .update({ status: 'completed' })
          .eq('order_no', orderNo);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error handling order ready webhook:', error);
      return false;
    }
  },

  async handleLowDataUsage(iccid: string): Promise<void> {
    try {
      const { data: esim } = await supabase
        .from('esims')
        .select('user_id')
        .eq('iccid', iccid)
        .maybeSingle();

      if (esim) {
        await supabase.from('notifications').insert({
          user_id: esim.user_id,
          type: 'low_data',
          message: `Your eSIM is running low on data.`,
          related_iccid: iccid,
          read: false,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error handling low data webhook:', error);
    }
  },

  async handleLowValidity(iccid: string): Promise<void> {
    try {
      const { data: esim } = await supabase
        .from('esims')
        .select('user_id')
        .eq('iccid', iccid)
        .maybeSingle();

      if (esim) {
        await supabase.from('notifications').insert({
          user_id: esim.user_id,
          type: 'expiring_soon',
          message: `Your eSIM expires in 1 day.`,
          related_iccid: iccid,
          read: false,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error handling low validity webhook:', error);
    }
  },
};
