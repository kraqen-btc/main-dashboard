import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

const app = express();
app.use(cors());
app.use(express.json());

// Production'da frontend'i serve et
app.use(express.static(join(__dirname, '../dist')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Tablo oluştur
async function initDB() {
  // Accounts tablosu
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      stake_deposit_network VARCHAR(50),
      stake_deposit_address TEXT,
      polym_deposit_network VARCHAR(50),
      polym_deposit_address TEXT,
      stake_withdraw_network VARCHAR(50),
      stake_withdraw_address TEXT,
      polym_withdraw_network VARCHAR(50),
      polym_withdraw_address TEXT,
      stake_balance DECIMAL(20, 2) DEFAULT 0,
      polym_balance DECIMAL(20, 2) DEFAULT 0,
      total_balance DECIMAL(20, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Snapshots tablosu
  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_snapshots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      snapshot_date DATE NOT NULL,
      total_stake_balance DECIMAL(20, 2) DEFAULT 0,
      total_polym_balance DECIMAL(20, 2) DEFAULT 0,
      grand_total DECIMAL(20, 2) DEFAULT 0,
      accounts_data JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Mevcut tabloya yeni kolonları ekle
  try {
    await pool.query(`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS stake_balance DECIMAL(20, 2) DEFAULT 0`);
    await pool.query(`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS polym_balance DECIMAL(20, 2) DEFAULT 0`);
    await pool.query(`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS total_balance DECIMAL(20, 2) DEFAULT 0`);
  } catch (err) {
    // Kolon zaten varsa hata yoksay
  }

  console.log('Database initialized');
}

const mapRow = (row) => ({
  id: row.id,
  name: row.name,
  stakeDeposit: { network: row.stake_deposit_network, address: row.stake_deposit_address },
  polymDeposit: { network: row.polym_deposit_network, address: row.polym_deposit_address },
  stakeWithdraw: { network: row.stake_withdraw_network, address: row.stake_withdraw_address },
  polymWithdraw: { network: row.polym_withdraw_network, address: row.polym_withdraw_address },
  stakeBalance: parseFloat(row.stake_balance) || 0,
  polymBalance: parseFloat(row.polym_balance) || 0,
  totalBalance: parseFloat(row.total_balance) || 0,
});

// Tüm hesapları getir
app.get('/api/accounts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM accounts ORDER BY created_at DESC');
    const accounts = result.rows.map(mapRow);
    res.json(accounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Yeni hesap ekle
app.post('/api/accounts', async (req, res) => {
  const { name, stakeDeposit, polymDeposit, stakeWithdraw, polymWithdraw } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO accounts (name, stake_deposit_network, stake_deposit_address, polym_deposit_network, polym_deposit_address, stake_withdraw_network, stake_withdraw_address, polym_withdraw_network, polym_withdraw_address, stake_balance, polym_balance, total_balance)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 0, 0)
       RETURNING *`,
      [name, stakeDeposit.network, stakeDeposit.address, polymDeposit.network, polymDeposit.address, stakeWithdraw.network, stakeWithdraw.address, polymWithdraw.network, polymWithdraw.address]
    );
    res.json(mapRow(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Bakiye güncelle
app.patch('/api/accounts/:id/balance', async (req, res) => {
  const { id } = req.params;
  const { stakeBalance, polymBalance, totalBalance } = req.body;
  try {
    const result = await pool.query(
      `UPDATE accounts SET stake_balance=$1, polym_balance=$2, total_balance=$3 WHERE id=$4 RETURNING *`,
      [stakeBalance, polymBalance, totalBalance, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(mapRow(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ============ SNAPSHOT ENDPOINTS ============

// Tüm snapshot'ları getir
app.get('/api/snapshots', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM daily_snapshots ORDER BY snapshot_date DESC');
    const snapshots = result.rows.map(row => ({
      id: row.id,
      date: row.snapshot_date,
      totalStakeBalance: parseFloat(row.total_stake_balance) || 0,
      totalPolymBalance: parseFloat(row.total_polym_balance) || 0,
      grandTotal: parseFloat(row.grand_total) || 0,
      accountsData: row.accounts_data,
      createdAt: row.created_at,
    }));
    res.json(snapshots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Yeni snapshot oluştur (Gün Sonu)
app.post('/api/snapshots', async (req, res) => {
  try {
    // Tüm hesapları al
    const accountsResult = await pool.query('SELECT * FROM accounts');
    const accounts = accountsResult.rows;

    // Toplamları hesapla
    let totalStakeBalance = 0;
    let totalPolymBalance = 0;
    let grandTotal = 0;

    const accountsData = accounts.map(acc => {
      const stake = parseFloat(acc.stake_balance) || 0;
      const polym = parseFloat(acc.polym_balance) || 0;
      const total = parseFloat(acc.total_balance) || 0;

      totalStakeBalance += stake;
      totalPolymBalance += polym;
      grandTotal += total;

      return {
        id: acc.id,
        name: acc.name,
        stakeBalance: stake,
        polymBalance: polym,
        totalBalance: total,
      };
    });

    // Bugünün tarihini al
    const today = new Date().toISOString().split('T')[0];

    // Bugün için zaten snapshot var mı kontrol et
    const existingSnapshot = await pool.query(
      'SELECT id FROM daily_snapshots WHERE snapshot_date = $1',
      [today]
    );

    let result;
    if (existingSnapshot.rows.length > 0) {
      // Güncelle
      result = await pool.query(
        `UPDATE daily_snapshots
         SET total_stake_balance = $1, total_polym_balance = $2, grand_total = $3, accounts_data = $4, created_at = NOW()
         WHERE snapshot_date = $5
         RETURNING *`,
        [totalStakeBalance, totalPolymBalance, grandTotal, JSON.stringify(accountsData), today]
      );
    } else {
      // Yeni oluştur
      result = await pool.query(
        `INSERT INTO daily_snapshots (snapshot_date, total_stake_balance, total_polym_balance, grand_total, accounts_data)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [today, totalStakeBalance, totalPolymBalance, grandTotal, JSON.stringify(accountsData)]
      );
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      date: row.snapshot_date,
      totalStakeBalance: parseFloat(row.total_stake_balance) || 0,
      totalPolymBalance: parseFloat(row.total_polym_balance) || 0,
      grandTotal: parseFloat(row.grand_total) || 0,
      accountsData: row.accounts_data,
      createdAt: row.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// İstatistikler (değişim hesaplamaları)
app.get('/api/snapshots/stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM daily_snapshots ORDER BY snapshot_date DESC');
    const snapshots = result.rows;

    if (snapshots.length === 0) {
      return res.json({
        latest: null,
        daily: null,
        weekly: null,
        monthly: null,
      });
    }

    const latest = {
      date: snapshots[0].snapshot_date,
      totalStakeBalance: parseFloat(snapshots[0].total_stake_balance) || 0,
      totalPolymBalance: parseFloat(snapshots[0].total_polym_balance) || 0,
      grandTotal: parseFloat(snapshots[0].grand_total) || 0,
    };

    // Bir önceki gün
    const previous = snapshots[1] ? {
      date: snapshots[1].snapshot_date,
      grandTotal: parseFloat(snapshots[1].grand_total) || 0,
    } : null;

    // 7 gün önce
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklySnapshot = snapshots.find(s => new Date(s.snapshot_date) <= weekAgo);

    // 30 gün önce
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthlySnapshot = snapshots.find(s => new Date(s.snapshot_date) <= monthAgo);

    const calcChange = (current, past) => {
      if (!past || past === 0) return null;
      return ((current - past) / past) * 100;
    };

    res.json({
      latest,
      daily: previous ? {
        previousTotal: previous.grandTotal,
        change: latest.grandTotal - previous.grandTotal,
        changePercent: calcChange(latest.grandTotal, previous.grandTotal),
      } : null,
      weekly: weeklySnapshot ? {
        previousTotal: parseFloat(weeklySnapshot.grand_total) || 0,
        change: latest.grandTotal - (parseFloat(weeklySnapshot.grand_total) || 0),
        changePercent: calcChange(latest.grandTotal, parseFloat(weeklySnapshot.grand_total)),
      } : null,
      monthly: monthlySnapshot ? {
        previousTotal: parseFloat(monthlySnapshot.grand_total) || 0,
        change: latest.grandTotal - (parseFloat(monthlySnapshot.grand_total) || 0),
        changePercent: calcChange(latest.grandTotal, parseFloat(monthlySnapshot.grand_total)),
      } : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// SPA fallback - tüm diğer route'ları index.html'e yönlendir
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});
