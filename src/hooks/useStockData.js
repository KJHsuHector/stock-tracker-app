import { useState, useEffect, useRef } from 'react';
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc } from '../services/firebase';

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


  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const isInitialLocalLoad = useRef(true);

  // 1. Auth Listener & Initial Cloud Pull
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsSyncing(true);
        try {
          const docRef = doc(db, 'users_stock', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Merge cloud records with local records to prevent data loss
            setRecords(prevLocal => {
              const cloudRecords = data.records || [];
              const mergedMap = new Map();
              
              // 1. Keep cloud records as the primary source of truth
              cloudRecords.forEach(r => mergedMap.set(r.id, r));
              
              // 2. Add local records that aren't in the cloud (e.g. added offline)
              prevLocal.forEach(r => {
                if (!mergedMap.has(r.id)) {
                  mergedMap.set(r.id, r);
                }
              });
              
              return Array.from(mergedMap.values()).sort((a, b) => b.timestamp - a.timestamp);
            });
            
            if (data.investmentBase !== undefined) setInvestmentBase(data.investmentBase);
          }
        } catch (error) {
          console.error("Cloud load error", error);
        } finally {
          setIsSyncing(false);
        }
      } else {
        setIsSyncing(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Persistence (Local + Cloud)
  useEffect(() => {
    if (isInitialLocalLoad.current) {
      isInitialLocalLoad.current = false;
      return;
    }

    // Always save locally
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    localStorage.setItem(BASE_STORAGE_KEY, investmentBase.toString());

    // Save to Cloud if logged in and not currently pulling from it
    if (user && !isSyncing) {
      const docRef = doc(db, 'users_stock', user.uid);
      setDoc(docRef, {
        records,
        investmentBase,
        lastUpdated: Date.now()
      }, { merge: true }).catch(err => console.error("Cloud sync error", err));
    }
  }, [records, investmentBase, user, isSyncing]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
      alert('Login failed');
    }
  };

  const logout = async () => {
    try {
      if (window.confirm("Logging out will stop cloud sync. Your data remains locally. Continue?")) {
        await signOut(auth);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
    summary: getSummary(),
    user,
    isSyncing,
    loginWithGoogle,
    logout
  };
};
