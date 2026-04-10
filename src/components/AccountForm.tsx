import { useState } from 'react';
import type { Account } from '../types';

type AccountFormData = Omit<Account, 'id' | 'stakeBalance' | 'polymBalance' | 'totalBalance'>;

interface AccountFormProps {
  onSave: (account: AccountFormData) => void;
  onCancel: () => void;
}

export function AccountForm({ onSave, onCancel }: AccountFormProps) {
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    stakeDeposit: { network: '', address: '' },
    polymDeposit: { network: '', address: '' },
    stakeWithdraw: { network: '', address: '' },
    polymWithdraw: { network: '', address: '' },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = "w-full bg-[#0d1117] border border-gray-700 rounded px-2.5 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500";

  const AddressField = ({
    label,
    value,
    onChange
  }: {
    label: string;
    value: { network: string; address: string };
    onChange: (val: { network: string; address: string }) => void;
  }) => (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <div className="grid grid-cols-4 gap-2">
        <input
          type="text"
          value={value.network}
          onChange={(e) => onChange({ ...value, network: e.target.value })}
          className={inputClass}
          placeholder="TRC20"
          required
        />
        <input
          type="text"
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          className={`${inputClass} col-span-3`}
          placeholder="Adres"
          required
        />
      </div>
    </div>
  );

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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
              placeholder="Ana Hesap"
              required
            />
          </div>

          <AddressField
            label="STAKE Deposit"
            value={formData.stakeDeposit}
            onChange={(val) => setFormData({ ...formData, stakeDeposit: val })}
          />

          <AddressField
            label="POLYM Deposit"
            value={formData.polymDeposit}
            onChange={(val) => setFormData({ ...formData, polymDeposit: val })}
          />

          <AddressField
            label="STAKE Withdraw"
            value={formData.stakeWithdraw}
            onChange={(val) => setFormData({ ...formData, stakeWithdraw: val })}
          />

          <AddressField
            label="POLYM Withdraw"
            value={formData.polymWithdraw}
            onChange={(val) => setFormData({ ...formData, polymWithdraw: val })}
          />

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
