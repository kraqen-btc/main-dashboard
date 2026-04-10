import { useState, useEffect } from 'react';
import type { Account, ExternalLink, Snapshot, SnapshotStats } from './types';
import { LinkCard } from './components/LinkCard';
import { AccountCard } from './components/AccountCard';
import { AccountForm } from './components/AccountForm';
import { BalanceForm } from './components/BalanceForm';
import { SnapshotHistory } from './components/SnapshotHistory';

const API_URL = '/api';

const externalLinks: ExternalLink[] = [
  { name: 'BETRAGE', url: 'http://68.183.211.46:8000/' },
  { name: 'BLOFIN BOT', url: 'http://46.101.231.124:9999/' },
];

function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBalanceAccount, setEditingBalanceAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  // Snapshot state
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [snapshotStats, setSnapshotStats] = useState<SnapshotStats | null>(null);
  const [savingSnapshot, setSavingSnapshot] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_URL}/accounts`);
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (account: Omit<Account, 'id' | 'stakeBalance' | 'polymBalance' | 'totalBalance'>) => {
    try {
      const res = await fetch(`${API_URL}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      });
      const newAccount = await res.json();
      setAccounts([newAccount, ...accounts]);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save account:', err);
    }
  };

  const handleBalanceUpdate = async (id: string, balances: { stakeBalance: number; polymBalance: number; totalBalance: number }) => {
    try {
      const res = await fetch(`${API_URL}/accounts/${id}/balance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(balances),
      });
      const updatedAccount = await res.json();
      setAccounts(accounts.map(a => a.id === id ? updatedAccount : a));
      setEditingBalanceAccount(null);
    } catch (err) {
      console.error('Failed to update balance:', err);
    }
  };

  // Gün Sonu - Snapshot kaydet
  const handleEndOfDay = async () => {
    setSavingSnapshot(true);
    try {
      await fetch(`${API_URL}/snapshots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      alert('Gun sonu kaydi basariyla olusturuldu!');
    } catch (err) {
      console.error('Failed to create snapshot:', err);
      alert('Kayit olusturulamadi!');
    } finally {
      setSavingSnapshot(false);
    }
  };

  // Snapshot geçmişini göster
  const handleShowSnapshots = async () => {
    try {
      const [snapshotsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/snapshots`),
        fetch(`${API_URL}/snapshots/stats`),
      ]);
      const snapshotsData = await snapshotsRes.json();
      const statsData = await statsRes.json();
      setSnapshots(snapshotsData);
      setSnapshotStats(statsData);
      setShowSnapshots(true);
    } catch (err) {
      console.error('Failed to fetch snapshots:', err);
    }
  };

  // Toplam bakiyeleri hesapla
  const totals = accounts.reduce(
    (acc, account) => ({
      stake: acc.stake + account.stakeBalance,
      polym: acc.polym + account.polymBalance,
      total: acc.total + account.totalBalance,
    }),
    { stake: 0, polym: 0, total: 0 }
  );

  const formatMoney = (value: number) => {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-300">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#161b22]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white">Dashboard</h1>
          <div className="flex gap-2">
            {externalLinks.map((link) => (
              <LinkCard key={link.name} link={link} />
            ))}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Toplam Bakiye Kartı */}
        {accounts.length > 0 && (
          <div className="mb-4 bg-[#161b22] border border-gray-800 rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Toplam Bakiye</span>
              <div className="flex gap-2">
                <button
                  onClick={handleShowSnapshots}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Gecmis Kayitlar
                </button>
                <button
                  onClick={handleEndOfDay}
                  disabled={savingSnapshot}
                  className="flex items-center gap-1.5 px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {savingSnapshot ? (
                    'Kaydediliyor...'
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Gun Sonu
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">STAKE</div>
                <div className="text-lg font-medium text-green-400">${formatMoney(totals.stake)}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">POLYM</div>
                <div className="text-lg font-medium text-purple-400">${formatMoney(totals.polym)}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">TOPLAM</div>
                <div className="text-lg font-medium text-white">${formatMoney(totals.total)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Accounts Section */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Hesaplar</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ekle
          </button>
        </div>

        {loading ? (
          <div className="border border-gray-800 rounded bg-[#161b22] p-8 text-center">
            <p className="text-gray-500 text-sm">Yukleniyor...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="border border-gray-800 rounded bg-[#161b22] p-8 text-center">
            <p className="text-gray-500 text-sm">Henuz hesap yok</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEditBalance={setEditingBalanceAccount}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <AccountForm
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingBalanceAccount && (
        <BalanceForm
          account={editingBalanceAccount}
          onSave={handleBalanceUpdate}
          onCancel={() => setEditingBalanceAccount(null)}
        />
      )}

      {showSnapshots && (
        <SnapshotHistory
          snapshots={snapshots}
          stats={snapshotStats}
          onClose={() => setShowSnapshots(false)}
        />
      )}
    </div>
  );
}

export default App;
