import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { LogOut, Moon, Sun, Wallet } from 'lucide-react';

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <nav style={{ 
      background: 'var(--glass-bg)', 
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '1rem 0',
      marginBottom: '2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '1.25rem' }}>
          <Wallet size={28} />
          <span>FinControl</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={toggleTheme} 
            className="btn-outline" 
            style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', border: 'none' }}
            title="Alternar Tema"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: 500, display: 'none', '@media (min-width: 600px)': { display: 'block' } }}>
                Olá, {user.name}
              </span>
              <button onClick={logoutUser} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                <LogOut size={16} />
                <span className="hide-mobile">Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
