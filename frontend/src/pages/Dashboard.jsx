import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import TransactionModal from '../components/TransactionModal';
import CardLimits from '../components/CardLimits';
import SetLimitModal from '../components/SetLimitModal';
import { API_URL } from '../config';

const Dashboard = () => {
  const { token, logoutUser } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/transactions?month=${filterMonth}&year=${filterYear}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        if (res.status === 401) logoutUser();
        throw new Error('Failed to fetch');
      }
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      const res = await fetch(`${API_URL}/cards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCards(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filterMonth, filterYear]);

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta transação?')) return;
    try {
      await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (t) => {
    setEditItem(t);
    setIsModalOpen(true);
  };

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'receita')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'despesa')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const balance = transactions.reduce((acc, t) => acc + t.amount, 0);

  // Chart Data preparation
  const categoryMap = transactions
    .filter(t => t.type === 'despesa')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {});
    
  const chartData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key]
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  const exportCSV = () => {
    const headers = ['Data,Descricao,Categoria,Tipo,Valor'];
    const csvData = transactions.map(t => {
      const date = new Date(t.date).toLocaleDateString();
      return `${date},"${t.description}","${t.category}",${t.type},${t.amount}`;
    });
    const blob = new Blob([headers.join('\n') + '\n' + csvData.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transacoes_${filterMonth}_${filterYear}.csv`;
    a.click();
  };

  return (
    <div>
      {/* Header & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Dashboard Financeiro</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            value={filterMonth} 
            onChange={e => setFilterMonth(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          >
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}</option>
            ))}
          </select>
          <select 
            value={filterYear} 
            onChange={e => setFilterYear(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          >
            {[2023, 2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button onClick={exportCSV} className="btn btn-outline" title="Exportar para CSV">Exportar</button>
          <button className="btn btn-outline" onClick={() => setIsCardModalOpen(true)}>💳 Contas/Cartões</button>
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setIsModalOpen(true); }}>
            <Plus size={20} /> Nova
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="dashboard-grid">
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Receitas do Mês</span>
            <TrendingUp color="var(--success-color)" />
          </div>
          <h3 style={{ fontSize: '2rem', color: 'var(--success-color)' }}>R$ {totalIncome.toFixed(2)}</h3>
        </div>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Despesas do Mês</span>
            <TrendingDown color="var(--danger-color)" />
          </div>
          <h3 style={{ fontSize: '2rem', color: 'var(--danger-color)' }}>R$ {totalExpense.toFixed(2)}</h3>
        </div>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: balance >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Saldo Restante</span>
            <DollarSign color={balance >= 0 ? 'var(--success-color)' : 'var(--danger-color)'} />
          </div>
          <h3 style={{ fontSize: '2rem', color: balance >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
            R$ {balance.toFixed(2)}
          </h3>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: cards.length > 0 ? 'block' : 'none' }}>
        <CardLimits cards={cards} transactions={transactions} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', marginTop: '1.5rem', alignItems: 'start' }}>
        {/* Transactions Table */}
        <div className="glass-card" style={{ overflowX: 'auto', gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '1rem' }}>Despesas por Categoria</h3>
          <div style={{ height: '300px', width: '100%', display: chartData.length > 0 ? 'block' : 'none' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {chartData.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Nenhuma despesa registrada para o gráfico.</p>}
        </div>

        {/* Transactions Table */}
        <div className="glass-card" style={{ gridColumn: '1 / -1', overflowX: 'auto' }}>
          <h3 style={{ marginBottom: '1rem' }}>Transações Recentes</h3>
          {loading ? (
            <div className="loader"></div>
          ) : transactions.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem 0' }}>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Cartão/Conta</th>
                  <th>Valor</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem 0' }}>{new Date(t.date).toLocaleDateString()}</td>
                    <td>{t.description}</td>
                    <td>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
                        {t.category}
                      </span>
                    </td>
                    <td>
                      {t.card ? (
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
                          {t.card.name}
                        </span>
                      ) : <span style={{ color: 'var(--text-secondary)' }}>-</span>}
                    </td>
                    <td style={{ color: t.type === 'receita' ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 500 }}>
                      {t.type === 'receita' ? '+' : '-'} R$ {Math.abs(t.amount).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => openEdit(t)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', marginRight: '1rem' }}>
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(t._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Você ainda não possui transações neste período.</p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <TransactionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchTransactions}
          editItem={editItem}
          cards={cards}
        />
      )}

      {isCardModalOpen && (
        <SetLimitModal 
          isOpen={isCardModalOpen}
          onClose={() => setIsCardModalOpen(false)}
          onSuccess={fetchCards}
          cards={cards}
        />
      )}
    </div>
  );
};

export default Dashboard;
