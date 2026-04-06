import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X } from 'lucide-react';
import { API_URL } from '../config';

const TransactionModal = ({ isOpen, onClose, onSuccess, editItem, cards = [] }) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'despesa',
    card: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editItem) {
      setFormData({
        description: editItem.description,
        amount: Math.abs(editItem.amount),
        category: editItem.category,
        type: editItem.type,
        card: editItem.card ? (editItem.card._id || editItem.card) : '',
        date: new Date(editItem.date).toISOString().split('T')[0]
      });
    }
  }, [editItem]);

  if (!isOpen) return null;

  const categoriesDespesa = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros'];
  const categoriesReceita = ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Outros'];

  const categories = formData.type === 'despesa' ? categoriesDespesa : categoriesReceita;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = editItem 
      ? `${API_URL}/transactions/${editItem._id}`
      : `${API_URL}/transactions`;
      
    const method = editItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Erro ao salvar');
      
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', margin: '1rem', background: 'var(--bg-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>{editItem ? 'Editar Transação' : 'Nova Transação'}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <label style={{ flex: 1, cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem', border: `1px solid ${formData.type === 'despesa' ? 'var(--danger-color)' : 'var(--border-color)'}`, borderRadius: '8px' }}>
              <input type="radio" name="type" value="despesa" checked={formData.type === 'despesa'} onChange={e => setFormData({...formData, type: e.target.value, category: categoriesDespesa[0]})} />
              Despesa
            </label>
            <label style={{ flex: 1, cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem', border: `1px solid ${formData.type === 'receita' ? 'var(--success-color)' : 'var(--border-color)'}`, borderRadius: '8px' }}>
              <input type="radio" name="type" value="receita" checked={formData.type === 'receita'} onChange={e => setFormData({...formData, type: e.target.value, category: categoriesReceita[0]})} />
              Receita
            </label>
          </div>

          <div className="input-group">
            <label>Descrição</label>
            <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ex: Supermercado" />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Valor (R$)</label>
              <input type="number" step="0.01" min="0" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Data</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Categoria</label>
              <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="" disabled>Selecione</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="input-group" style={{ flex: 1 }}>
              <label>Cartão / Carteira</label>
              <select value={formData.card} onChange={e => setFormData({...formData, card: e.target.value})}>
                <option value="">Sem Cartão (Indiferente)</option>
                {cards.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Transação'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
