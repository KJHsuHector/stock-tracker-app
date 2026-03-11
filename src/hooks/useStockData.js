import { useState, useEffect } from 'react';

const STORAGE_KEY = 'stock_tracker_data';

export const useStockData = () => {
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved).sort((a, b) => b.timestamp - a.timestamp); // newest first
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

  const addRecord = (newRecord) => {
    // Calculate total values
    const twTotalNtd = newRecord.twStocks + newRecord.bankCash + newRecord.settlement;
    const usTotalNtd = newRecord.usStocksUsd * newRecord.exchangeRate;
    const totalNtd = twTotalNtd + usTotalNtd;

    const recordWithTotals = {
      ...newRecord,
      id: Date.now().toString(),
      twTotalNtd,
      usTotalNtd,
      totalNtd,
    };

    setRecords(prev => {
      const updated = [...prev, recordWithTotals];
      return updated.sort((a, b) => b.timestamp - a.timestamp);
    });
  };

  const deleteRecord = (id) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  /**
   * Calculate summary metrics comparing the latest record to the previous one
   */
  const getSummary = () => {
    if (records.length === 0) return null;

    const latest = records[0];
    const previous = records.length > 1 ? records[1] : null;

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
        usAssets: latest.usTotalNtd,
        exchangeRate: latest.exchangeRate,
        date: latest.timestamp,
      },
      pl: {
        total: calculateDiff(latest.totalNtd, previous?.totalNtd),
        tw: calculateDiff(latest.twTotalNtd, previous?.twTotalNtd),
        us: calculateDiff(latest.usTotalNtd, previous?.usTotalNtd),
      }
    };
  };

  return {
    records,
    addRecord,
    deleteRecord,
    summary: getSummary()
  };
};
