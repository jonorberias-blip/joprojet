import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

export default function Utilisateurs() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({ nom: '', prenom: '', email: '', mot_de_passe: '', role: 'bibliothecaire' });
  const [msg, setMsg]       = useState('');

  const fetchUsers = () => {
    setLoading(true);
    API.get('/utilisateurs').then(r => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setMsg('');
    try { 
      await API.post('/utilisateurs', form); 
      setForm({ nom:'', prenom:'', email:'', mot_de_passe:'', role:'bibliothecaire' });
      setModal(false); 
      fetchUsers(); 
    }
    catch (err) { setMsg(err.response?.data?.message || 'Erreur'); }
  };

  const handleToggle = async (id) => {
    try { await API.patch(`/utilisateurs/${id}/actif`); fetchUsers(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>👤 Gestion des bibliothécaires</h1>
        <p>Créez et gérez les comptes bibliothécaires</p>
      </div>
      <div className="top-actions">
        <div />
        <button className="btn btn-primary" onClick={() => { setForm({ nom:'', prenom:'', email:'', mot_de_passe:'', role:'bibliothecaire' }); setMsg(''); setModal(true); }}>
          + Créer un compte
        </button>
      </div>
      <div className="card">
        {loading ? <div className="loading">Chargement...</div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Action</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.prenom} {u.nom}</strong></td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-info' : 'badge-secondary'}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.actif ? 'badge-success' : 'badge-danger'}`}>{u.actif ? 'Actif' : 'Désactivé'}</span></td>
                    <td>
                      <button className={`btn btn-sm ${u.actif ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggle(u.id)}>
                        {u.actif ? 'Désactiver' : 'Réactiver'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>➕ Créer un compte bibliothécaire</h2>
            {msg && <div className="alert alert-error">{msg}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group"><label>Nom *</label><input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required /></div>
                <div className="form-group"><label>Prénom *</label><input value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} required /></div>
              </div>
              <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
              <div className="form-group"><label>Mot de passe *</label><input type="password" value={form.mot_de_passe} onChange={e => setForm({...form, mot_de_passe: e.target.value})} required /></div>
              <div className="form-group">
                <label>Rôle</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="bibliothecaire">Bibliothécaire</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
