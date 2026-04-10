import { useState } from 'react';
import type { Account } from '../types';

interface AccountCardProps {
  account: Account;
  onEditBalance: (account: Account) => void;
}

export function AccountCard({ account, onEditBalance }: AccountCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const formatBalance = (value: number) => {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const Row = ({ label, value, network, field }: { label: string; value: string; network: string; field: string }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0 text-xs">
      <span className="text-gray-500 shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0">
          {network}
        </span>
        <code className="text-gray-300 font-mono truncate" title={value}>
          {value.length > 16 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value}
        </code>
        <button
          onClick={() => copyToClipboard(value, field)}
          className={`shrink-0 transition-colors ${copiedField === field ? 'text-green-400' : 'text-gray-600 hover:text-blue-400'}`}
          title="Kopyala"
        >
          {copiedField === field ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="border border-gray-800 rounded bg-[#161b22] overflow-hidden">
      {/* Header */}
      <div className="bg-[#1c2128] px-3 py-2 border-b border-gray-800">
        <h3 className="text-sm font-medium text-white">{account.name}</h3>
      </div>

      {/* Bakiyeler */}
      <div className="px-3 py-2 border-b border-gray-800 bg-[#1c2128]/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Bakiyeler</span>
          <button
            onClick={() => onEditBalance(account)}
            className="text-gray-500 hover:text-blue-400 transition-colors"
            title="Bakiye Duzenle"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] text-gray-500 mb-0.5">STAKE</div>
            <div className="text-sm font-medium text-green-400">${formatBalance(account.stakeBalance)}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-0.5">POLYM</div>
            <div className="text-sm font-medium text-purple-400">${formatBalance(account.polymBalance)}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 mb-0.5">TOPLAM</div>
            <div className="text-sm font-medium text-white">${formatBalance(account.totalBalance)}</div>
          </div>
        </div>
      </div>

      {/* Adresler */}
      <div className="px-3 py-2">
        <Row label="STAKE Deposit" value={account.stakeDeposit.address} network={account.stakeDeposit.network} field="stakeDeposit" />
        <Row label="POLYM Deposit" value={account.polymDeposit.address} network={account.polymDeposit.network} field="polymDeposit" />
        <Row label="STAKE Withdraw" value={account.stakeWithdraw.address} network={account.stakeWithdraw.network} field="stakeWithdraw" />
        <Row label="POLYM Withdraw" value={account.polymWithdraw.address} network={account.polymWithdraw.network} field="polymWithdraw" />
      </div>
    </div>
  );
}
