import { useState, useEffect } from 'react';

const STORAGE_KEY = 'stock_tracker_data';
const BASE_STORAGE_KEY = 'stock_tracker_base';

export const useStockData = () => {
  const [investmentBase, setInvestmentBase] = useState(() => {
    const saved = localStorage.getItem(BASE_STORAGE_KEY);
    return saved ? Number(saved) : 0;
  });

  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old data on the fly to expose separated cash 
        return parsed.map(r => {
          const cashTotalNtd = (r.bankCash || 0) + (r.settlement || 0);
          return {
            ...r,
            cashTotalNtd,
            twTotalNtd: r.twStocks || 0,
            totalNtd: (r.twStocks || 0) + cashTotalNtd + (r.usTotalNtd || 0),
            capitalChange: r.capitalChange || 0
          };
        }).sort((a, b) => b.timestamp - a.timestamp); // newest first
      }
      return [];
    } catch (e) {
      console.error("Error loading data from localStorage", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(BASE_STORAGE_KEY, investmentBase.toString());
  }, [investmentBase]);

  const addRecord = (newRecord) => {
    // Calculate total values
    const cashTotalNtd = newRecord.bankCash + newRecord.settlement;
    const twTotalNtd = newRecord.twStocks;
    const usTotalNtd = newRecord.usStocksUsd * newRecord.exchangeRate;
    const totalNtd = twTotalNtd + cashTotalNtd + usTotalNtd;
    const capitalChange = newRecord.capitalChange || 0;

    const recordWithTotals = {
      ...newRecord,
      id: Date.now().toString(),
      cashTotalNtd,
      twTotalNtd,
      usTotalNtd,
      totalNtd,
      capitalChange
    };

    setRecords(prev => {
      const updated = [...prev, recordWithTotals];
      return updated.sort((a, b) => b.timestamp - a.timestamp);
    });
  };

  const deleteRecord = (id) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const editRecord = (id, updatedRecord) => {
    const cashTotalNtd = updatedRecord.bankCash + updatedRecord.settlement;
    const twTotalNtd = updatedRecord.twStocks;
    const usTotalNtd = updatedRecord.usStocksUsd * updatedRecord.exchangeRate;
    const totalNtd = twTotalNtd + cashTotalNtd + usTotalNtd;
    const capitalChange = updatedRecord.capitalChange || 0;

    const recordWithTotals = {
      ...updatedRecord,
      id, 
      cashTotalNtd,
      twTotalNtd,
      usTotalNtd,
      totalNtd,
      capitalChange
    };

    setRecords(prev => {
      const updated = prev.map(r => r.id === id ? recordWithTotals : r);
      return updated.sort((a, b) => b.timestamp - a.timestamp);
    });
  };

  /**
   * Calculate summary metrics comparing the latest record to the previous one
   */
  const getSummary = () => {
    if (records.length === 0) return null;

    const latest = records[0];
    const previous = records.length > 1 ? records[1] : null;

    // Calculate sum of all historical capital changes
    const totalCapitalChanges = records.reduce((sum, r) => sum + (r.capitalChange || 0), 0);
    
    // Total Profit = Current Assets - Investment Base - Cumulative Injections + Cumulative Withdrawals
    // Since Withdrawal is negative, subtracting the sum works: 
    // Example: Base 1M, injected 50k, withdrew 10k (sum = 40k). Assets 1.2M. Profit = 1.2M - 1M - 40k = 160k.
    const totalProfit = latest.totalNtd - investmentBase - totalCapitalChanges;
    const roiPercentage = investmentBase > 0 ? (totalProfit / investmentBase) * 100 : 0;

    const calculateDiff = (current, prev) => {
      if (!prev) return { value: 0, percent: 0, isPositive: true };
      const diff = current - prev;
      const percent = prev === 0 ? 0 : (diff / prev) * 100;
      return { 
        value: diff, 
        percent, 
        isPositive: diff >= 0 
      };
    };

    return {
      current: {
        totalAssets: latest.totalNtd,
        twAssets: latest.twTotalNtd,
        cashAssets: latest.cashTotalNtd,
        usAssets: latest.usTotalNtd,
        exchangeRate: latest.exchangeRate,
        date: latest.timestamp,
        totalProfit,
        roiPercentage,
        totalCapitalChanges
      },
      pl: {
        total: calculateDiff(latest.totalNtd, previous?.totalNtd),
        tw: calculateDiff(latest.twTotalNtd, previous?.twTotalNtd),
        cash: calculateDiff(latest.cashTotalNtd, previous?.cashTotalNtd),
        us: calculateDiff(latest.usTotalNtd, previous?.usTotalNtd),
      }
    };
  };

  return {
    records,
    investmentBase,
    setInvestmentBase,
    addRecord,
    deleteRecord,
    editRecord,
    summary: getSummary()
  };
};
