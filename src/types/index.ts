export interface AddressInfo {
  network: string;
  address: string;
}

export interface Account {
  id: string;
  name: string;
  stakeDeposit: AddressInfo;
  polymDeposit: AddressInfo;
  stakeWithdraw: AddressInfo;
  polymWithdraw: AddressInfo;
  stakeBalance: number;
  polymBalance: number;
  totalBalance: number;
}

export interface ExternalLink {
  name: string;
  url: string;
  description?: string;
}

export interface Snapshot {
  id: string;
  date: string;
  totalStakeBalance: number;
  totalPolymBalance: number;
  grandTotal: number;
  accountsData: {
    id: string;
    name: string;
    stakeBalance: number;
    polymBalance: number;
    totalBalance: number;
  }[];
  createdAt: string;
}

export interface SnapshotStats {
  latest: {
    date: string;
    totalStakeBalance: number;
    totalPolymBalance: number;
    grandTotal: number;
  } | null;
  daily: {
    previousTotal: number;
    change: number;
    changePercent: number | null;
  } | null;
  weekly: {
    previousTotal: number;
    change: number;
    changePercent: number | null;
  } | null;
  monthly: {
    previousTotal: number;
    change: number;
    changePercent: number | null;
  } | null;
}
