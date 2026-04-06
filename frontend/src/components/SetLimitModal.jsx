import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Trash2, Edit2, Play, Plus, X } from 'lucide-react';
import { API_URL } from '../config';

const SetLimitModal = ({ isOpen, onClose, onSuccess, cards }) => {
  const { token } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editId 
        ? `${API_URL}/cards/${editId}` 
        : `${API_URL}/cards`;
      
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, limit: Number(limit) })
      });

      if (!res.ok) throw new Error('Error saving card');
      
      setName('');
      setLimit('');
      setEditId(null);
      onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este cartão? As transações manterão o registro, mas ficarão sem cartão atrelado.')) return;
    try {
      await fetch(`${API_URL}/cards/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (card) => {
    setName(card.name);
    setLimit(card.limit);
    setEditId(card._id);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card" style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2>Gerenciar Cartões/Contas</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Nome (Ex: Nubank)" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>
          <div style={{ flex: 1 }}>
            <input 
              type="number" 
              step="0.01"
              min="0"
              className="input-field" 
              placeholder="Limite (R$)" 
              value={limit} 
              onChange={e => setLimit(e.target.value)} 
              required 
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {editId ? 'Salvar' : 'Adicionar'}
          </button>
        </form>

        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {cards.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Nenhum cartão cadastrado.</p>}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {cards.map(c => (
              <li key={c._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <strong style={{ display: 'block' }}>{c.name}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Limite: R$ {c.limit.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => handleEdit(c)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <Edit2 size={18} />
                  </button>
                  <button type="button" onClick={() => handleDelete(c._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SetLimitModal;
