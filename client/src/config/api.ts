// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const apiConfig = {
  baseUrl: API_BASE_URL,
  endpoints: {
    balance: {
      hype: (address: string) => `${API_BASE_URL}/api/v1/balance/hype/${address}`,
      usdt0: (address: string) => `${API_BASE_URL}/api/v1/balance/usdt0/${address}`,
    },
    transfers: (address: string) => `${API_BASE_URL}/api/v1/transfers/${address}`,
  },
};

export default apiConfig; 