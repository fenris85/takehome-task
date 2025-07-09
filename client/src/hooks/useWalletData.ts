import { useState, useEffect } from 'react';
import { apiConfig } from '@/config/api';

// Types for API responses
interface BalanceData {
  address: string;
  balance: string;
  symbol: string;
  decimals: number;
}

interface BalanceResponse {
  success: boolean;
  data: BalanceData;
}

export interface Transfer {
  id: number;
  blockNumber: string;
  transactionHash: string;
  from: string;
  to: string;
  value: string;
  rawValue: string;
  tokenAddress: string;
  symbol: string;
  decimals: number;
  timestamp: string;
  blockTimestamp: string;
}

interface TransferResponse {
  success: boolean;
  data: {
    address: string;
    transfers: Transfer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface WalletData {
  transfers: Transfer[];
  hypeBalance: string;
  usdt0Balance: string;
  isLoading: boolean;
  error: string | null;
}

export const useWalletData = (userAddress: string): WalletData => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [hypeBalance, setHypeBalance] = useState<string>('Loading...');
  const [usdt0Balance, setUsdt0Balance] = useState<string>('Loading...');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch balances and transfers in parallel
        const [hypeBalanceRes, usdt0BalanceRes, transfersRes] = await Promise.all([
          fetch(apiConfig.endpoints.balance.hype(userAddress)),
          fetch(apiConfig.endpoints.balance.usdt0(userAddress)),
          fetch(apiConfig.endpoints.transfers(userAddress))
        ]);

        // Handle HYPE balance
        if (hypeBalanceRes.ok) {
          const hypeData: BalanceResponse = await hypeBalanceRes.json();
          if (hypeData.success) {
            setHypeBalance(parseFloat(hypeData.data.balance).toFixed(4));
          }
        } else {
          console.error('Failed to fetch HYPE balance');
          setHypeBalance('Error');
        }

        // Handle USDT0 balance
        if (usdt0BalanceRes.ok) {
          const usdt0Data: BalanceResponse = await usdt0BalanceRes.json();
          if (usdt0Data.success) {
            setUsdt0Balance(parseFloat(usdt0Data.data.balance).toFixed(2));
          }
        } else {
          console.error('Failed to fetch USDT0 balance');
          setUsdt0Balance('Error');
        }

        // Handle transfers
        if (transfersRes.ok) {
          const transferData: TransferResponse = await transfersRes.json();
          if (transferData.success) {
            setTransfers(transferData.data.transfers);
          }
        } else {
          console.error('Failed to fetch transfer history');
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
        setHypeBalance('Error');
        setUsdt0Balance('Error');
      } finally {
        setIsLoading(false);
      }
    };

    if (userAddress) {
      fetchData();
    }
  }, [userAddress]);

  return {
    transfers,
    hypeBalance,
    usdt0Balance,
    isLoading,
    error
  };
}; 