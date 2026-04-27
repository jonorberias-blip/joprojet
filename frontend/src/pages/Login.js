import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', mot_de_passe: '' });
  const [type, setType]     = useState('staff');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.mot_de_passe, type);
      if (user.role === 'etudiant') navigate('/etudiant');
      else navigate('/dashboard');
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass-panel">
        <h1>📖 Bibliothèque</h1>
        <p>Connectez-vous à votre espace</p>

        {/* Choix du type de connexion */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => setType('staff')}
            style={{
              flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
              border: type === 'staff' ? '2px solid #1E3A5F' : '2px solid #dde1ea',
              background: type === 'staff' ? '#1E3A5F' : '#fff',
              color: type === 'staff' ? '#fff' : '#555',
              fontWeight: 600, fontSize: 13
            }}>
            👤 Staff
          </button>
          <button
            type="button"
            onClick={() => setType('etudiant')}
            style={{
              flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
              border: type === 'etudiant' ? '2px solid #1E3A5F' : '2px solid #dde1ea',
              background: type === 'etudiant' ? '#1E3A5F' : '#fff',
              color: type === 'etudiant' ? '#fff' : '#555',
              fontWeight: 600, fontSize: 13
            }}>
            🎓 Étudiant
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Adresse email</label>
            <input type="email" placeholder="exemple@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" placeholder="••••••••"
              value={form.mot_de_passe}
              onChange={e => setForm({ ...form, mot_de_passe: e.target.value })}
              required />
          </div>
          <button className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
          
          <div style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginTop: '16px' }}>
            Vous n'avez pas de compte ? <Link to="/signup" style={{ color: '#1E3A5F', fontWeight: '600', textDecoration: 'none' }}>S'inscrire</Link>
          </div>
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link to="/" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>← Retour à l'accueil</Link>
          </div>
        </form>
      </div>
    </div>
  );
}