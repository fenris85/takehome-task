"use client";

import { USER_ADDRESS } from "@/constants";
import { useEffect, useState } from "react";

const mockData = [
  {
    date: '2021-01-01',
    amount: 123.45,
    from: USER_ADDRESS,
    to: USER_ADDRESS,
  },
  {
    date: '2021-01-02',
    amount: 123.45,
    from: USER_ADDRESS,
    to: USER_ADDRESS,
  },
]

export default function Home() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http:localhost:8080/token-history?address=${USER_ADDRESS}`)
        const data = await response.json()
        setHistory(data);
      } catch (error) {
        console.error(error);
      }
      setIsLoading(false);
    }

    fetchHistory()
  }, []);

  const shortAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  const renderRow = (date: string, amount: number, from: string, to: string) => {
    return (
      <tr key={date}>
        <td>{date}</td>
        <td>{amount}</td>
        <td>{from}</td>
        <td>{to}</td>
      </tr>
    )
  }

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold px-4 pt-4">
        {shortAddress(USER_ADDRESS)}
      </h1>

      <div className="h-px w-full bg-gray-200" />

      <div className="flex gap-x-4 p-4">

        <div className="flex flex-col gap-4 border border-gray-200 rounded-md p-4">
          <h2 className="text-lg font-bold">
            HYPE Balance
          </h2>

          <p>
            1.23
          </p>
        </div>

        <div className="flex flex-col gap-4 border border-gray-200 rounded-md p-4">
          <h2 className="text-lg font-bold">
            USDT0 Balance
          </h2>

          <p>
            123.45
          </p>
        </div>
      </div>


      <div className="h-px w-full bg-gray-200" />

      <div className="flex flex-col gap-4 border border-gray-200 rounded-md p-4 m-4">
        <h2 className="text-lg font-bold">
          USDT0 Transfer History
        </h2>

        <input
          type="text"
          placeholder="Search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>From</th>
              <th>To</th>
            </tr>
          </thead>

          <tbody>
            {input ?
              mockData
                .filter((row) => row.from.includes(input) || row.to.includes(input))
                .map((row) => renderRow(row.date, row.amount, row.from, row.to))
              :
              mockData.map((row) => renderRow(row.date, row.amount, row.from, row.to))
            }
          </tbody>
        </table>
      </div>
    </main>
  );
}
