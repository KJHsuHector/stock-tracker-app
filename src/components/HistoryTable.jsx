import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';

export const HistoryTable = ({ records, onDelete }) => {
  if (!records || records.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ marginTop: '2rem', animationDelay: '0.2s', overflowX: 'auto' }}>
      <h3 className="title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Historical Records</h3>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Taiwan Assets</th>
            <th>Cash Assets</th>
            <th>US Assets</th>
            <th>Total Assets (NTD)</th>
            <th>Rate</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{formatDate(record.timestamp)}</td>
              <td>{formatCurrency(record.twTotalNtd)}</td>
              <td>{formatCurrency(record.cashTotalNtd)}</td>
              <td>{formatCurrency(record.usTotalNtd)}</td>
              <td style={{ fontWeight: '600', color: 'var(--success)' }}>{formatCurrency(record.totalNtd)}</td>
              <td style={{ color: 'var(--text-secondary)' }}>{record.exchangeRate.toFixed(2)}</td>
              <td>
                <button 
                  onClick={() => onDelete(record.id)}
                  className="btn btn-danger"
                  style={{ padding: '0.4rem', borderRadius: '4px' }}
                  title="Delete record"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
