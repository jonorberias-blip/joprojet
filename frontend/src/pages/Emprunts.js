import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

export default function Emprunts() {
  const [emprunts, setEmprunts] = useState([]);
  const [membres, setMembres]   = useState([]);
  const [livres, setLivres]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ membre_id: '', livre_id: '' });
  const [msg, setMsg]           = useState('');
  const [filtre, setFiltre]     = useState('en_cours');
  const [search, setSearch]     = useState('');

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      API.get('/emprunts', { params: { statut: filtre, search } }),
      API.get('/membres'),
      API.get('/livres', { params: { disponible: 'true' } }),
    ]).then(([e, m, l]) => {
      setEmprunts(e.data); setMembres(m.data); setLivres(l.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [filtre, search]);

  const handleEmprunt = async (e) => {
    e.preventDefault(); setMsg('');
    try {
      await API.post('/emprunts', form);
      setModal(false); fetchAll();
    } catch (err) { setMsg(err.response?.data?.message || 'Erreur'); }
  };

  const handleRetour = async (id) => {
    if (!window.confirm('Confirmer le retour de ce livre ?')) return;
    try {
      const res = await API.patch(`/emprunts/${id}/retour`);
      if (res.data.reservation_en_attente) alert('⚠️ Il y a une réservation en attente pour ce livre !');
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const statutBadge = (s) => {
    if (s === 'en_cours') return <span className="badge badge-info">En cours</span>;
    if (s === 'retourne') return <span className="badge badge-success">Retourné</span>;
    return <span className="badge badge-danger">En retard</span>;
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>📋 Gestion des emprunts</h1>
        <p>Enregistrez et suivez les emprunts de livres</p>
      </div>

      <div className="top-actions">
        <div style={{ display: 'flex', gap: 8 }}>
          {['en_cours', 'retourne', ''].map((s, i) => (
            <button key={i} className={`btn ${filtre === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFiltre(s)}>
              {s === 'en_cours' ? 'En cours' : s === 'retourne' ? 'Retournés' : 'Tous'}
            </button>
          ))}
        </div>
        <div className="search-bar" style={{ flex: 1, margin: '0 20px' }}>
          <input 
            placeholder="🔍 Chercher l'historique par nom, prénom ou matricule d'étudiant..." 
            value={search}
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ membre_id: '', livre_id: '' }); setMsg(''); setModal(true); }}>
          + Nouvel emprunt
        </button>
      </div>

      <div className="card">
        {loading ? <div className="loading">Chargement...</div> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Membre</th><th>Livre</th><th>Date emprunt</th><th>Retour prévu</th><th>Statut</th><th>Action</th></tr>
              </thead>
              <tbody>
                {emprunts.length === 0 && (
                  <tr><td colSpan={6}><div className="empty-state"><p>Aucun emprunt trouvé</p></div></td></tr>
                )}
                {emprunts.map(e => (
                  <tr key={e.id}>
                    <td><strong>{e.membre_prenom} {e.membre_nom}</strong><br/><small style={{color:'#888'}}>{e.numero_carte}</small></td>
                    <td>{e.livre_titre}<br/><small style={{color:'#888'}}>{e.isbn}</small></td>
                    <td>{e.date_emprunt?.slice(0,10)}</td>
                    <td style={{ color: new Date(e.date_retour_prevue) < new Date() && e.statut === 'en_cours' ? '#c0392b' : 'inherit' }}>
                      {e.date_retour_prevue?.slice(0,10)}
                    </td>
                    <td>{statutBadge(e.statut)}</td>
                    <td>
                      {e.statut === 'en_cours' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleRetour(e.id)}>✅ Retour</button>
                      )}
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
            <h2>➕ Nouvel emprunt</h2>
            {msg && <div className="alert alert-error">{msg}</div>}
            <form onSubmit={handleEmprunt}>
              <div className="form-group">
                <label>Membre *</label>
                <select value={form.membre_id} onChange={e => setForm({...form, membre_id: e.target.value})} required>
                  <option value="">-- Sélectionner un membre --</option>
                  {membres.map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom} ({m.numero_carte})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Livre disponible *</label>
                <select value={form.livre_id} onChange={e => setForm({...form, livre_id: e.target.value})} required>
                  <option value="">-- Sélectionner un livre --</option>
                  {livres.map(l => <option key={l.id} value={l.id}>{l.titre} — {l.auteur} ({l.disponibles} dispo.)</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
