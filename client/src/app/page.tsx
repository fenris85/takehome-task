"use client";

import { USER_ADDRESS } from "@/constants";
import { apiConfig } from "@/config/api";
import { useEffect, useState } from "react";

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

interface Transfer {
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

export default function Home() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [hypeBalance, setHypeBalance] = useState<string>('Loading...');
  const [usdt0Balance, setUsdt0Balance] = useState<string>('Loading...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch balances and transfers in parallel
        const [hypeBalanceRes, usdt0BalanceRes, transfersRes] = await Promise.all([
          fetch(apiConfig.endpoints.balance.hype(USER_ADDRESS)),
          fetch(apiConfig.endpoints.balance.usdt0(USER_ADDRESS)),
          fetch(apiConfig.endpoints.transfers(USER_ADDRESS))
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

    fetchData();
  }, []);

  const shortAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderRow = (transfer: Transfer) => {
    const isIncoming = transfer.to.toLowerCase() === USER_ADDRESS.toLowerCase();
    
    return (
      <tr 
        key={transfer.id} 
        className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
      >
        <td className="py-3 px-4 text-sm text-gray-700">
          {formatDate(transfer.timestamp)}
        </td>
        <td className={`py-3 px-4 text-sm font-medium ${
          isIncoming ? 'text-green-600' : 'text-red-600'
        }`}>
          {isIncoming ? '+' : '-'}{parseFloat(transfer.value).toFixed(4)}
        </td>
        <td className="py-3 px-4 text-sm text-gray-600 font-mono">
          {shortAddress(transfer.from)}
        </td>
        <td className="py-3 px-4 text-sm text-gray-600 font-mono">
          {shortAddress(transfer.to)}
        </td>
      </tr>
    );
  };

  const filteredTransfers = input 
    ? transfers.filter((transfer) => 
        transfer.from.toLowerCase().includes(input.toLowerCase()) || 
        transfer.to.toLowerCase().includes(input.toLowerCase())
      )
    : transfers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Wallet Dashboard
              </h1>
              <p className="text-gray-600 font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg inline-block">
                {shortAddress(USER_ADDRESS)}
              </p>
            </div>
          </div>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center space-x-3 shadow-sm">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Balance Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HYPE Balance Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                HYPE Balance
              </h2>
              <div className="bg-purple-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <p className={`text-3xl font-bold ${
                isLoading ? 'text-gray-400 animate-pulse' : 
                hypeBalance === 'Error' ? 'text-red-500' : 'text-gray-900'
              }`}>
                {hypeBalance}
              </p>
              <p className="text-sm text-gray-500">
                {hypeBalance !== 'Loading...' && hypeBalance !== 'Error' && 'HYPE'}
              </p>
            </div>
          </div>

          {/* USDT0 Balance Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                USDT0 Balance
              </h2>
              <div className="bg-green-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <p className={`text-3xl font-bold ${
                isLoading ? 'text-gray-400 animate-pulse' : 
                usdt0Balance === 'Error' ? 'text-red-500' : 'text-gray-900'
              }`}>
                {usdt0Balance}
              </p>
              <p className="text-sm text-gray-500">
                {usdt0Balance !== 'Loading...' && usdt0Balance !== 'Error' && 'USDT0'}
              </p>
            </div>
          </div>
        </section>

        {/* Transfer History Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>USDT0 Transfer History</span>
              </h2>
              {transfers.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {transfers.length} transfers
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Search Input */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by address..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
                {input && (
                  <button
                    onClick={() => setInput('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600 font-medium">Loading transfer history...</span>
                </div>
              </div>
            ) : (
              /* Transfer Table */
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          From
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          To
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTransfers.length > 0 ? (
                        filteredTransfers.map((transfer) => renderRow(transfer))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center space-y-3">
                              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                              <p className="text-gray-500 font-medium">
                                {transfers.length === 0 ? 'No transfer history found' : 'No transfers match your search'}
                              </p>
                              {transfers.length === 0 && (
                                <p className="text-gray-400 text-sm">
                                  Transfer data will appear here once transactions are made
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
