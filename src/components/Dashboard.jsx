import React, { useState } from 'react';
import { formatCurrency, formatPercent } from '../utils/format';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Wallet, Target, Sparkles, Check, Edit2 } from 'lucide-react';

const StatCard = ({ title, value, isPercent, plData, icon: Icon, isHighlight }) => {
  return (
    <div className={`glass-panel animate-fade-in ${isHighlight ? 'highlight-card' : ''}`}>
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <h3 className="input-label" style={{ margin: 0, color: isHighlight ? 'var(--accent-primary)' : 'inherit' }}>{title}</h3>
        <div style={{ color: 'var(--accent-primary)', background: 'var(--accent-glow)', padding: '0.5rem', borderRadius: '50%' }}>
          <Icon size={20} />
        </div>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: isHighlight ? (value >= 0 ? 'var(--success)' : 'var(--danger)') : 'inherit' }}>
        {isPercent ? formatPercent(value) : formatCurrency(value)}
      </div>
      
      {plData && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          {plData.isPositive ? (
            <TrendingUp size={16} className="text-success" />
          ) : (
            <TrendingDown size={16} className="text-danger" />
          )}
          <span className={plData.isPositive ? 'text-success' : 'text-danger'} style={{ fontWeight: '600' }}>
            {plData.value > 0 ? '+' : ''}{formatCurrency(plData.value)} ({formatPercent(plData.percent)})
          </span>
          <span className="text-neutral">vs last entry</span>
        </div>
      )}
    </div>
  );
};

export const Dashboard = ({ summary, investmentBase, setInvestmentBase }) => {
  const [isEditingBase, setIsEditingBase] = useState(false);
  const [tempBase, setTempBase] = useState(investmentBase.toString());

  const handleSaveBase = () => {
    setInvestmentBase(Number(tempBase) || 0);
    setIsEditingBase(false);
  };

  if (!summary) {
    return (
      <div className="glass-panel flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '1rem' }}>
        <Activity size={48} color="var(--accent-primary)" opacity={0.5} />
        <p className="text-neutral" style={{ fontSize: '1.25rem' }}>No data yet. Add your first record below.</p>
      </div>
    );
  }

  const { current, pl } = summary;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <h2 className="title" style={{ fontSize: '1.25rem', margin: 0 }}>Portfolio Overview</h2>
        
        {/* Investment Base Settings */}
        <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '8px' }}>
          <span className="text-muted" style={{ fontSize: '0.875rem' }}>Annual Investment Base (NTD):</span>
          {isEditingBase ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="number" 
                className="glass-input" 
                style={{ padding: '0.25rem 0.5rem', width: '120px' }}
                value={tempBase}
                onChange={(e) => setTempBase(e.target.value)}
                autoFocus
              />
              <button className="btn" style={{ padding: '0.25rem 0.5rem' }} onClick={handleSaveBase}>
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', color: 'var(--accent-light)' }}>
                {formatCurrency(investmentBase)}
              </span>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.25rem', background: 'transparent', border: 'none' }}
                onClick={() => { setTempBase(investmentBase.toString()); setIsEditingBase(true); }}
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <StatCard 
          title="Total Profit (本年已賺)" 
          value={current.totalProfit} 
          icon={Sparkles}
          isHighlight={true}
        />
        <StatCard 
          title="ROI (投資報酬率)" 
          value={current.roiPercentage} 
          icon={Target}
          isPercent={true}
          isHighlight={true}
        />
        <StatCard 
          title="Total Assets (NTD)" 
          value={current.totalAssets} 
          plData={pl.total} 
          icon={DollarSign}
        />
      </div>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <StatCard 
          title="Taiwan Stocks" 
          value={current.twAssets} 
          plData={pl.tw} 
          icon={PieChart}
        />
        <StatCard 
          title="Bank Cash" 
          value={current.cashAssets} 
          plData={pl.cash} 
          icon={Wallet}
        />
        <StatCard 
          title="US Stocks" 
          value={current.usAssets} 
          plData={pl.us} 
          icon={PieChart}
        />
      </div>

      <style>{`
        .highlight-card {
          border: 1px solid var(--accent-light);
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.1);
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%);
        }
      `}</style>
    </div>
  );
};
