import React from 'react';
import { useStockData } from './hooks/useStockData';
import { Dashboard } from './components/Dashboard';
import { DataEntryForm } from './components/DataEntryForm';
import { Charts } from './components/Charts';
import { HistoryTable } from './components/HistoryTable';
import { LineChart } from 'lucide-react';

function App() {
  const { 
    records, investmentBase, setInvestmentBase, addRecord, deleteRecord, editRecord, summary,
    user, isSyncing, loginWithGoogle, logout 
  } = useStockData();
  const [editingRecord, setEditingRecord] = React.useState(null);

  const handleEdit = (record) => {
    setEditingRecord(record);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container">
      <header className="flex-between" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--accent-glow)', padding: '0.75rem', borderRadius: '12px' }}>
            <LineChart size={32} color="var(--accent-primary)" />
          </div>
          <div>
            <h1 className="title" style={{ margin: 0, fontSize: '1.75rem' }}>Portfolio Tracker</h1>
            <p className="text-neutral">Track your Taiwan & US stock investments</p>
          </div>
        </div>
      </header>

      <Dashboard 
        summary={summary} 
        investmentBase={investmentBase} 
        setInvestmentBase={setInvestmentBase}
        user={user}
        isSyncing={isSyncing}
        loginWithGoogle={loginWithGoogle}
        logout={logout}
      />

      <div className="grid-2">
        <DataEntryForm 
          onAddRecord={addRecord} 
          editingRecord={editingRecord}
          onEditRecord={editRecord}
          clearEditing={() => setEditingRecord(null)}
        />
        <Charts records={records} investmentBase={investmentBase} />
      </div>

      <HistoryTable 
        records={records} 
        onDelete={deleteRecord} 
        onEdit={handleEdit}
      />
    </div>
  );
}

export default App;
