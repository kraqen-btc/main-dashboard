import { useState } from 'react';
import type { Account } from '../types';

type AccountFormData = Omit<Account, 'id' | 'stakeBalance' | 'polymBalance' | 'totalBalance'>;

interface AccountFormProps {
  onSave: (account: AccountFormData) => void;
  onCancel: () => void;
}

export function AccountForm({ onSave, onCancel }: AccountFormProps) {
  const [name, setName] = useState('');
  const [stakeDepositNetwork, setStakeDepositNetwork] = useState('');
  const [stakeDepositAddress, setStakeDepositAddress] = useState('');
  const [polymDepositNetwork, setPolymDepositNetwork] = useState('');
  const [polymDepositAddress, setPolymDepositAddress] = useState('');
  const [stakeWithdrawNetwork, setStakeWithdrawNetwork] = useState('');
  const [stakeWithdrawAddress, setStakeWithdrawAddress] = useState('');
  const [polymWithdrawNetwork, setPolymWithdrawNetwork] = useState('');
  const [polymWithdrawAddress, setPolymWithdrawAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      stakeDeposit: { network: stakeDepositNetwork, address: stakeDepositAddress },
      polymDeposit: { network: polymDepositNetwork, address: polymDepositAddress },
      stakeWithdraw: { network: stakeWithdrawNetwork, address: stakeWithdrawAddress },
      polymWithdraw: { network: polymWithdrawNetwork, address: polymWithdrawAddress },
    });
  };

  const inputClass = "w-full bg-[#0d1117] border border-gray-700 rounded px-2.5 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161b22] border border-gray-800 rounded-lg w-full max-w-md">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Yeni Hesap</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Hesap Adi</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Ana Hesap"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">STAKE Deposit</label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                value={stakeDepositNetwork}
                onChange={(e) => setStakeDepositNetwork(e.target.value)}
                className={inputClass}
                placeholder="TRC20"
                required
              />
              <input
                type="text"
                value={stakeDepositAddress}
                onChange={(e) => setStakeDepositAddress(e.target.value)}
                className={`${inputClass} col-span-3`}
                placeholder="Adres"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">POLYM Deposit</label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                value={polymDepositNetwork}
                onChange={(e) => setPolymDepositNetwork(e.target.value)}
                className={inputClass}
                placeholder="TRC20"
                required
              />
              <input
                type="text"
                value={polymDepositAddress}
                onChange={(e) => setPolymDepositAddress(e.target.value)}
                className={`${inputClass} col-span-3`}
                placeholder="Adres"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">STAKE Withdraw</label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                value={stakeWithdrawNetwork}
                onChange={(e) => setStakeWithdrawNetwork(e.target.value)}
                className={inputClass}
                placeholder="TRC20"
                required
              />
              <input
                type="text"
                value={stakeWithdrawAddress}
                onChange={(e) => setStakeWithdrawAddress(e.target.value)}
                className={`${inputClass} col-span-3`}
                placeholder="Adres"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">POLYM Withdraw</label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                value={polymWithdrawNetwork}
                onChange={(e) => setPolymWithdrawNetwork(e.target.value)}
                className={inputClass}
                placeholder="TRC20"
                required
              />
              <input
                type="text"
                value={polymWithdrawAddress}
                onChange={(e) => setPolymWithdrawAddress(e.target.value)}
                className={`${inputClass} col-span-3`}
                placeholder="Adres"
                required
              />
            </div>
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
              className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
