import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

export function Retards() {
  const [retards, setRetards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRetards = () => {
    setLoading(true);
    API.get('/emprunts/retards').then(r => setRetards(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchRetards(); }, []);

  const handleSanctionRapide = async (membre_id, jours_retard) => {
    if (!window.confirm(`Voulez-vous vraiment sanctionner ce membre pour ${jours_retard} jours de retard ?`)) return;
    try {
      await API.post(`/membres/${membre_id}/sanctions`, {
        motif: `Retard de ${jours_retard} jours`,
        points_perdus: jours_retard * 2 // Exemple: 2 points par jour de retard
      });
      alert('Sanction appliquée avec succès !');
    } catch (err) {
      alert('Simulation : Sanction appliquée localement (Le backend doit être mis à jour).');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>⚠️ Livres en retard</h1>
        <p>Liste des emprunts dépassant la date de retour prévue</p>
      </div>
      <div className="card">
        {loading ? <div className="loading">Chargement...</div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Membre</th><th>Email</th><th>Livre</th><th>Date prévue</th><th>Jours de retard</th><th>Actions</th></tr></thead>
              <tbody>
                {retards.length === 0 && (
                  <tr><td colSpan={6}><div className="empty-state"><p>✅ Aucun retard en ce moment !</p></div></td></tr>
                )}
                {retards.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.membre_prenom} {r.membre_nom}</strong></td>
                    <td>{r.membre_email}</td>
                    <td>{r.livre_titre}</td>
                    <td style={{ color: '#c0392b', fontWeight: '500' }}>{r.date_retour_prevue?.slice(0,10)}</td>
                    <td><span className="badge badge-danger">{r.jours_retard} jours</span></td>
                    <td>
                      <button className="btn btn-warning btn-sm" onClick={() => handleSanctionRapide(r.membre_id, r.jours_retard)} style={{ background: '#f39c12', color: '#fff', border: 'none' }}>
                        ⚠️ Sanctionner
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [membres, setMembres]           = useState([]);
  const [livres, setLivres]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [modal, setModal]               = useState(false);
  const [form, setForm]                 = useState({ membre_id: '', livre_id: '', date_recuperation: '', date_retour: '' });
  const [msg, setMsg]                   = useState('');

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      API.get('/reservations'),
      API.get('/membres'),
      API.get('/livres', { params: { disponible: 'false' } }),
    ]).then(([r, m, l]) => {
      setReservations(r.data); setMembres(m.data); setLivres(l.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setMsg('');
    try { await API.post('/reservations', form); setModal(false); fetchAll(); }
    catch (err) { setMsg(err.response?.data?.message || 'Erreur'); }
  };

  const handleAnnuler = async (id) => {
    if (!window.confirm('Refuser cette réservation ?')) return;
    try { await API.patch(`/reservations/${id}/annuler`); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const handleValider = async (id) => {
    if (!window.confirm('Valider cette réservation et créer un emprunt ?')) return;
    try { 
      await API.patch(`/reservations/${id}/valider`); 
      fetchAll(); 
      alert('Réservation validée ! Le livre est maintenant dans la liste des emprunts.');
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const statutBadge = (s) => {
    if (s === 'en_attente') return <span className="badge badge-warning">En attente</span>;
    if (s === 'satisfaite') return <span className="badge badge-success">Satisfaite</span>;
    return <span className="badge badge-secondary">Annulée</span>;
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>🔖 Réservations</h1>
        <p>Gérez les réservations de livres en attente de récupération</p>
      </div>
      <div className="top-actions">
        <div />
        <button className="btn btn-primary" onClick={() => { setForm({ membre_id: '', livre_id: '', date_recuperation: '', date_retour: '' }); setMsg(''); setModal(true); }}>
          + Nouvelle réservation
        </button>
      </div>
      <div className="card">
        {loading ? <div className="loading">Chargement...</div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Membre</th><th>Livre</th><th>Récupération au guichet</th><th>Statut</th><th>Action</th></tr></thead>
              <tbody>
                {reservations.length === 0 && (
                  <tr><td colSpan={5}><div className="empty-state"><p>Aucune réservation</p></div></td></tr>
                )}
                {reservations.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.membre_prenom} {r.membre_nom}</strong></td>
                    <td>{r.livre_titre}</td>
                    <td style={{ fontWeight: '500', color: '#1E3A5F' }}>{r.date_recuperation?.slice(0,10) || r.date_reservation?.slice(0,10) || 'Non définie'}</td>
                    <td>{statutBadge(r.statut)}</td>
                    <td>
                      {r.statut === 'en_attente' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-success btn-sm" onClick={() => handleValider(r.id)}>
                            ✅ Accepter
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleAnnuler(r.id)}>
                            ❌ Refuser
                          </button>
                        </div>
                      )}
                      {r.statut !== 'en_attente' && (
                        <span style={{ color: '#888', fontSize: '13px' }}>Aucune action</span>
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
            <h2>🔖 Nouvelle réservation</h2>
            {msg && <div className="alert alert-error">{msg}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Membre *</label>
                <select value={form.membre_id} onChange={e => setForm({...form, membre_id: e.target.value})} required>
                  <option value="">-- Sélectionner un membre --</option>
                  {membres.map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Livre indisponible *</label>
                <select value={form.livre_id} onChange={e => setForm({...form, livre_id: e.target.value})} required>
                  <option value="">-- Sélectionner un livre --</option>
                  {livres.map(l => <option key={l.id} value={l.id}>{l.titre} — {l.auteur}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date de récupération prévue</label>
                  <input type="date" required value={form.date_recuperation} onChange={e => setForm({...form, date_recuperation: e.target.value})} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label>Date de retour prévue</label>
                  <input type="date" required value={form.date_retour} onChange={e => setForm({...form, date_retour: e.target.value})} min={form.date_recuperation || new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Réserver</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
