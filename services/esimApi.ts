import type {
  ApiResponse,
  EsimAccessBalance,
  EsimAccessOrder,
  EsimAccessStatus,
} from '@/types';

const API_BASE_URL = 'https://api.esimaccess.com/api/v1/open';
const API_KEY = process.env.EXPO_PUBLIC_ESIM_ACCESS_API_KEY || '';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

const makeRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'RT-AccessCode': API_KEY,
      ...options.headers,
    };

    const response = await fetch(url, {
      method: options.method || 'POST',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || (data.errorCode && data.errorCode !== '0' && data.errorCode !== '000000')) {
      throw new Error(data.errorMsg || data.message || 'API request failed');
    }

    return {
      success: true,
      data: data.obj || data.data || data as T,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const esimAccessApi = {
  // 1. Query current USD balance
  async queryBalance(): Promise<ApiResponse<EsimAccessBalance>> {
    return makeRequest<EsimAccessBalance>('/balance/query', {
      method: 'POST',
      body: {},
    });
  },

  async getPackageList(locationCode?: string) {
    const response = await makeRequest('/package/list', {
      method: 'POST',
      body: locationCode ? { locationCode } : {},
    });

    if (response.success && response.data) {
      const rawData = response.data as any;
      if (rawData.packageList && Array.isArray(rawData.packageList)) {
        const transformedPackages = rawData.packageList.map((pkg: any) => ({
          packageCode: pkg.packageCode || pkg.slug,
          packageName: pkg.name,
          locationCode: pkg.locationCode,
          locationName: pkg.location,
          dataAmount: pkg.volume,
          validity: pkg.duration,
          price: pkg.price,
          retailPrice: pkg.retailPrice,
          currency: pkg.currencyCode,
          description: pkg.description,
        }));
        return {
          success: true,
          data: transformedPackages,
        };
      }
    }

    return response;
  },

  async getAllPackages() {
    const response = await makeRequest('/package/list', {
      method: 'POST',
      body: {},
    });

    if (response.success && response.data) {
      const rawData = response.data as any;
      if (rawData.packageList && Array.isArray(rawData.packageList)) {
        const transformedPackages = rawData.packageList.map((pkg: any) => ({
          packageCode: pkg.packageCode || pkg.slug,
          packageName: pkg.name,
          locationCode: pkg.locationCode,
          locationName: pkg.location,
          dataAmount: pkg.volume,
          validity: pkg.duration,
          price: pkg.price,
          retailPrice: pkg.retailPrice,
          currency: pkg.currencyCode,
          description: pkg.description,
        }));
        return {
          success: true,
          data: transformedPackages,
        };
      }
    }

    return response;
  },

  async getTopupPackages(iccid: string) {
    const response = await makeRequest('/package/list', {
      method: 'POST',
      body: { iccid, type: 'topup' },
    });

    if (response.success && response.data) {
      const rawData = response.data as any;
      if (rawData.packageList && Array.isArray(rawData.packageList)) {
        const transformedPackages = rawData.packageList.map((pkg: any) => ({
          packageCode: pkg.packageCode || pkg.slug,
          packageName: pkg.name,
          locationCode: pkg.locationCode,
          locationName: pkg.location,
          dataAmount: pkg.volume,
          validity: pkg.duration,
          price: pkg.price,
          retailPrice: pkg.retailPrice,
          currency: pkg.currencyCode,
          description: pkg.description,
        }));
        return {
          success: true,
          data: transformedPackages,
        };
      }
    }

    return response;
  },

  // 3. Place an eSIM order
  async orderEsim(packageCode: string, count: number = 1): Promise<ApiResponse<EsimAccessOrder>> {
    return makeRequest<EsimAccessOrder>('/order', {
      method: 'POST',
      body: {
        packageCode,
        count,
      },
    });
  },

  // 4. Query eSIM status and details
  // Pass either orderNo or iccid to get details
  async queryEsimStatus(
    orderNo?: string,
    iccid?: string
  ): Promise<ApiResponse<EsimAccessStatus>> {
    const body: any = {};
    if (orderNo) body.orderNo = orderNo;
    if (iccid) body.iccid = iccid;

    return makeRequest<EsimAccessStatus>('/esim/query', {
      method: 'POST',
      body,
    });
  },

  // 5. Add data to existing eSIM (top-up)
  async topupEsim(iccid: string, packageCode: string) {
    return makeRequest('/esim/topup', {
      method: 'POST',
      body: {
        iccid,
        packageCode,
      },
    });
  },

  // 6. Optional: Suspend an eSIM (pause temporarily)
  async suspendEsim(iccid: string) {
    return makeRequest('/esim/suspend', {
      method: 'POST',
      body: { iccid },
    });
  },

  // 7. Optional: Unsuspend an eSIM (resume)
  async unsuspendEsim(iccid: string) {
    return makeRequest('/esim/unsuspend', {
      method: 'POST',
      body: { iccid },
    });
  },

  // 8. Optional: Revoke an eSIM (cancel permanently)
  async revokeEsim(iccid: string) {
    return makeRequest('/esim/revoke', {
      method: 'POST',
      body: { iccid },
    });
  },

  // 9. Optional: Cancel an unused order (refund)
  async cancelOrder(iccid: string) {
    return makeRequest('/esim/revoke', {
      method: 'POST',
      body: { iccid },
    });
  },
};
