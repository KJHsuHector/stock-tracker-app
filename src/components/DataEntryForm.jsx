import React, { useState, useEffect } from 'react';
import { fetchUsdToTwdRate } from '../services/ExchangeRateService';
import { PlusCircle, RefreshCw } from 'lucide-react';

export const DataEntryForm = ({ onAddRecord }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    twStocks: '',
    bankCash: '',
    settlement: '',
    usStocksUsd: '',
  });

  const [exchangeRate, setExchangeRate] = useState(0);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadExchangeRate();
  }, []);

  const loadExchangeRate = async () => {
    setIsLoadingRate(true);
    const rate = await fetchUsdToTwdRate();
    setExchangeRate(rate);
    setIsLoadingRate(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!exchangeRate) return;
    
    setIsSubmitting(true);
    
    const newRecord = {
      timestamp: new Date(formData.date).getTime(),
      twStocks: Number(formData.twStocks) || 0,
      bankCash: Number(formData.bankCash) || 0,
      settlement: Number(formData.settlement) || 0,
      usStocksUsd: Number(formData.usStocksUsd) || 0,
      exchangeRate: exchangeRate,
    };

    onAddRecord(newRecord);
    
    // Optional: Reset form fields, except date
    setFormData(prev => ({
      ...prev,
      twStocks: '',
      bankCash: '',
      settlement: '',
      usStocksUsd: '',
    }));
    
    setIsSubmitting(false);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <h2 className="title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <PlusCircle size={24} color="var(--accent-primary)" />
        Add New Entry
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          {/* Timestamp */}
          <div className="input-group">
            <label className="input-label">Date</label>
            <input 
              type="date" 
              name="date"
              className="glass-input" 
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* TW Stocks */}
          <div className="input-group">
            <label className="input-label">Taiwan Stocks Present Value (NTD)</label>
            <input 
              type="number" 
              name="twStocks"
              className="glass-input" 
              placeholder="e.g. 500000"
              value={formData.twStocks}
              onChange={handleChange}
              min="0"
              step="1"
            />
          </div>

          {/* Bank Cash */}
          <div className="input-group">
            <label className="input-label">Bank Cash (NTD)</label>
            <input 
              type="number" 
              name="bankCash"
              className="glass-input" 
              placeholder="e.g. 100000"
              value={formData.bankCash}
              onChange={handleChange}
              min="0"
              step="1"
            />
          </div>

          {/* Settlement */}
          <div className="input-group">
            <label className="input-label">Settlement Funds (NTD)</label>
            <input 
              type="number" 
              name="settlement"
              className="glass-input" 
              placeholder="e.g. 25000"
              value={formData.settlement}
              onChange={handleChange}
              min="0"
              step="1"
            />
          </div>

          {/* US Stocks */}
          <div className="input-group">
            <label className="input-label">US Stocks Present Value (USD)</label>
            <input 
              type="number" 
              name="usStocksUsd"
              className="glass-input" 
              placeholder="e.g. 10000"
              value={formData.usStocksUsd}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>

          {/* Exchange Rate */}
          <div className="input-group">
            <label className="input-label flex-between">
              <span>Current USD/TWD Rate</span>
              <button 
                type="button" 
                onClick={loadExchangeRate}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)' }}
                disabled={isLoadingRate}
              >
                <RefreshCw size={14} className={isLoadingRate ? "spin" : ""} />
              </button>
            </label>
            <div className="glass-input flex-between" style={{ background: 'rgba(15, 23, 42, 0.2)' }}>
              <span>{isLoadingRate ? 'Fetching...' : exchangeRate.toFixed(2)}</span>
              <span className="text-neutral">Auto-fetched</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || isLoadingRate || !exchangeRate}>
            Save Record
          </button>
        </div>
      </form>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};
