import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatCurrency, formatDate } from '../utils/format';

export const Charts = ({ records, investmentBase }) => {
  const chartData = useMemo(() => {
    if (!records || records.length === 0) return [];
    
    // Sort oldest to newest for chronological chart display
    const sortedRecords = [...records].sort((a, b) => a.timestamp - b.timestamp);
    
    let cumulativeCapitalChange = 0;
    
    return sortedRecords.map(r => {
      cumulativeCapitalChange += (r.capitalChange || 0);
      
      const totalProfit = r.totalNtd - investmentBase - cumulativeCapitalChange;
      const roi = investmentBase > 0 ? (totalProfit / investmentBase) * 100 : 0;

      return {
        date: formatDate(r.timestamp),
        total: r.totalNtd,
        tw: r.twTotalNtd,
        cash: r.cashTotalNtd,
        us: r.usTotalNtd,
        roi: Number(roi.toFixed(2))
      };
    });
  }, [records, investmentBase]);

  if (chartData.length < 2) {
    return (
      <div className="glass-panel" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="text-neutral">Not enough data to display chart. Add more records.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          padding: '1rem',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--text-primary)' }}>{label}</p>
          {payload.map((entry, index) => {
            const valueStr = entry.dataKey === 'roi' ? `${entry.value.toFixed(2)}%` : formatCurrency(entry.value);
            return (
              <p key={index} style={{ color: entry.color, margin: '0.25rem 0', fontSize: '0.875rem' }}>
                {entry.name}: <span style={{ fontWeight: '600' }}>{valueStr}</span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel" style={{ marginTop: '2rem' }}>
      <h3 className="title" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Asset Growth Trend</h3>
      <div style={{ height: '400px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="var(--text-secondary)" 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
              tickLine={false} 
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis 
              yAxisId="left"
              stroke="var(--text-secondary)" 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
              tickFormatter={(val) => `NT$${(val / 10000).toFixed(0)}w`}
              tickLine={false} 
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#fbbf24" 
              tick={{ fill: '#fbbf24', fontSize: 12 }} 
              tickFormatter={(val) => `${val}%`}
              tickLine={false} 
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="total" 
              name="Total Assets" 
              stroke="var(--success)" 
              strokeWidth={3} 
              dot={{ r: 4, fill: 'var(--success)', strokeWidth: 0 }} 
              activeDot={{ r: 6, strokeWidth: 0 }} 
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="roi" 
              name="ROI (%)" 
              stroke="#fbbf24" 
              strokeWidth={3} 
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#fbbf24', strokeWidth: 0 }} 
              activeDot={{ r: 6, strokeWidth: 0 }} 
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="tw" 
              name="Taiwan Assets" 
              stroke="var(--accent-primary)" 
              strokeWidth={2} 
              dot={{ r: 3, fill: 'var(--accent-primary)', strokeWidth: 0 }} 
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="us" 
              name="US Assets" 
              stroke="#a855f7" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#a855f7', strokeWidth: 0 }} 
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="cash" 
              name="Cash Assets" 
              stroke="#9ca3af" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#9ca3af', strokeWidth: 0 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
