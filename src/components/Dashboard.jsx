import React from 'react';
import { formatCurrency, formatPercent } from '../utils/format';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity } from 'lucide-react';

const StatCard = ({ title, value, plData, icon: Icon }) => {
  return (
    <div className="glass-panel animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <h3 className="input-label" style={{ margin: 0 }}>{title}</h3>
        <div style={{ color: 'var(--accent-primary)', background: 'var(--accent-glow)', padding: '0.5rem', borderRadius: '50%' }}>
          <Icon size={20} />
        </div>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
        {formatCurrency(value)}
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

export const Dashboard = ({ summary }) => {
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
    <div className="grid-3" style={{ marginBottom: '2rem' }}>
      <StatCard 
        title="Total Assets (NTD)" 
        value={current.totalAssets} 
        plData={pl.total} 
        icon={DollarSign}
      />
      <StatCard 
        title="Taiwan Stocks" 
        value={current.twAssets} 
        plData={pl.tw} 
        icon={PieChart}
      />
      <StatCard 
        title="US Stocks" 
        value={current.usAssets} 
        plData={pl.us} 
        icon={PieChart}
      />
    </div>
  );
};
