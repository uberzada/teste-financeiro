import { CreditCard } from 'lucide-react';

const CardLimits = ({ cards, transactions }) => {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CreditCard size={20} /> Meus Cartões e Contas
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {cards.map(card => {
          // Calculate expenses for this specific card
          const cardExpenses = transactions
            .filter(t => t.card && (t.card._id === card._id || t.card === card._id) && t.type === 'despesa')
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);
          
          const limit = card.limit || 0;
          const percentage = limit > 0 ? (cardExpenses / limit) * 100 : 0;
          
          let progressColor = 'var(--success-color)';
          if (percentage > 75) progressColor = 'var(--warning-color)';
          if (percentage > 90) progressColor = 'var(--danger-color)';

          return (
            <div key={card._id} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>{card.name}</span>
                <span style={{ color: progressColor, fontWeight: 600 }}>
                  R$ {cardExpenses.toFixed(2)} / R$ {limit.toFixed(2)}
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${Math.min(percentage, 100)}%`, 
                    background: progressColor,
                    transition: 'width 0.5s ease-out'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardLimits;
