import { useState } from 'react';
import type { Account } from '../types';

interface BalanceFormProps {
  account: Account;
  onSave: (id: string, balances: { stakeBalance: number; polymBalance: number; totalBalance: number }) => void;
  onCancel: () => void;
}

export function BalanceForm({ account, onSave, onCancel }: BalanceFormProps) {
  const [stakeBalance, setStakeBalance] = useState(account.stakeBalance.toString());
  const [polymBalance, setPolymBalance] = useState(account.polymBalance.toString());
  const [totalBalance, setTotalBalance] = useState(account.totalBalance.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(account.id, {
      stakeBalance: parseFloat(stakeBalance) || 0,
      polymBalance: parseFloat(polymBalance) || 0,
      totalBalance: parseFloat(totalBalance) || 0,
    });
  };

  const inputClass = "w-full bg-[#0d1117] border border-gray-700 rounded px-2.5 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161b22] border border-gray-800 rounded-lg w-full max-w-sm">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Bakiye Duzenle - {account.name}</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">STAKE Bakiye</label>
            <input
              type="number"
              step="0.01"
              value={stakeBalance}
              onChange={(e) => setStakeBalance(e.target.value)}
              className={inputClass}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">POLYM Bakiye</label>
            <input
              type="number"
              step="0.01"
              value={polymBalance}
              onChange={(e) => setPolymBalance(e.target.value)}
              className={inputClass}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Toplam Bakiye</label>
            <input
              type="number"
              step="0.01"
              value={totalBalance}
              onChange={(e) => setTotalBalance(e.target.value)}
              className={inputClass}
              placeholder="0.00"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-3 py-1.5 border border-gray-700 text-gray-400 text-sm rounded hover:bg-gray-800 transition-colors"
            >
              Iptal
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
