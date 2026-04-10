import { useState } from 'react';
import type { Snapshot, SnapshotStats } from '../types';

interface SnapshotHistoryProps {
  snapshots: Snapshot[];
  stats: SnapshotStats | null;
  onClose: () => void;
}

export function SnapshotHistory({ snapshots, stats, onClose }: SnapshotHistoryProps) {
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatMoney = (value: number) => {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatChange = (change: number, percent: number | null) => {
    const sign = change >= 0 ? '+' : '';
    const percentStr = percent !== null ? ` (${sign}${percent.toFixed(2)}%)` : '';
    return `${sign}$${formatMoney(change)}${percentStr}`;
  };

  const ChangeCard = ({ label, data }: { label: string; data: { change: number; changePercent: number | null } | null }) => {
    if (!data) return (
      <div className="bg-[#1c2128] rounded p-3 text-center">
        <div className="text-[10px] text-gray-500 mb-1">{label}</div>
        <div className="text-xs text-gray-600">Veri yok</div>
      </div>
    );

    const isPositive = data.change >= 0;
    return (
      <div className="bg-[#1c2128] rounded p-3 text-center">
        <div className="text-[10px] text-gray-500 mb-1">{label}</div>
        <div className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {formatChange(data.change, data.changePercent)}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161b22] border border-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-medium text-white">Gun Sonu Kayitlari</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* İstatistikler */}
          {stats?.latest && (
            <div className="mb-6">
              <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-3">Degisim Ozeti</h3>
              <div className="grid grid-cols-3 gap-3">
                <ChangeCard label="Onceki Gune Gore" data={stats.daily} />
                <ChangeCard label="Haftalik" data={stats.weekly} />
                <ChangeCard label="Aylik" data={stats.monthly} />
              </div>
              {stats.latest && (
                <div className="mt-3 bg-[#1c2128] rounded p-3">
                  <div className="text-[10px] text-gray-500 mb-2">Son Kayit ({formatDate(stats.latest.date)})</div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-[10px] text-gray-500">STAKE</div>
                      <div className="text-sm font-medium text-green-400">${formatMoney(stats.latest.totalStakeBalance)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">POLYM</div>
                      <div className="text-sm font-medium text-purple-400">${formatMoney(stats.latest.totalPolymBalance)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">TOPLAM</div>
                      <div className="text-sm font-medium text-white">${formatMoney(stats.latest.grandTotal)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Geçmiş Kayıtlar */}
          <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-3">Gecmis Kayitlar</h3>
          {snapshots.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              Henuz kayit yok
            </div>
          ) : (
            <div className="space-y-2">
              {snapshots.map((snapshot, index) => {
                const prevSnapshot = snapshots[index + 1];
                const change = prevSnapshot ? snapshot.grandTotal - prevSnapshot.grandTotal : 0;
                const isPositive = change >= 0;

                return (
                  <div
                    key={snapshot.id}
                    className="bg-[#1c2128] rounded p-3 cursor-pointer hover:bg-[#252b33] transition-colors"
                    onClick={() => setSelectedSnapshot(selectedSnapshot?.id === snapshot.id ? null : snapshot)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-white">{formatDate(snapshot.date)}</span>
                        {prevSnapshot && (
                          <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{formatMoney(change)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-green-400">${formatMoney(snapshot.totalStakeBalance)}</span>
                        <span className="text-purple-400">${formatMoney(snapshot.totalPolymBalance)}</span>
                        <span className="text-white font-medium">${formatMoney(snapshot.grandTotal)}</span>
                        <svg
                          className={`w-4 h-4 text-gray-500 transition-transform ${selectedSnapshot?.id === snapshot.id ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Detay */}
                    {selectedSnapshot?.id === snapshot.id && snapshot.accountsData && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="text-[10px] text-gray-500 mb-2">Hesap Detaylari</div>
                        <div className="space-y-1">
                          {snapshot.accountsData.map((acc) => (
                            <div key={acc.id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">{acc.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-green-400">${formatMoney(acc.stakeBalance)}</span>
                                <span className="text-purple-400">${formatMoney(acc.polymBalance)}</span>
                                <span className="text-white">${formatMoney(acc.totalBalance)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
