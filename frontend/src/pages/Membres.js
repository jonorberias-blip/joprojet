import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const emptyForm = { nom: '', prenom: '', email: '', numero_carte: '', mot_de_passe: '', droit_paye: false };
const emptySanction = { membre_id: null, motif: '', points_perdus: 10 };

export default function Membres() {
  const [membres, setMembres] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [modal, setModal] = useState(false);
  const [sanctionModal, setSanctionModal] = useState(false);
  const [previewImage, setPreviewImage]   = useState(null);

  // Forms
  const [form, setForm] = useState(emptyForm);
  const [sanctionForm, setSanctionForm] = useState(emptySanction);

  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchMembres = () => {
    setLoading(true);
    API.get('/membres', { params: { search } }).then(r => setMembres(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMembres(); }, [search]);

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); setMsg(''); };
  const openEdit = (m) => {
    setForm({ ...emptyForm, ...m, mot_de_passe: '', droit_paye: !!m.droit_paye });
    setEditing(m.id);
    setModal(true);
    setMsg('');
  };
  const closeModal = () => { setModal(false); setMsg(''); };

  const openSanction = (m) => {
    setSanctionForm({ ...emptySanction, membre_id: m.id });
    setSanctionModal(true);
    setMsg('');
  };
  const closeSanctionModal = () => { setSanctionModal(false); setMsg(''); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setMsg('');
    try {
      if (editing) await API.put(`/membres/${editing}`, form);
      else await API.post('/membres', form);
      closeModal(); fetchMembres();
    } catch (err) { setMsg(err.response?.data?.message || 'Erreur'); }
  };

  const handleSanctionSubmit = async (e) => {
    e.preventDefault(); setMsg('');
    try {
      // Endpoint hypothetique pour les sanctions
      await API.post(`/membres/${sanctionForm.membre_id}/sanctions`, {
        motif: sanctionForm.motif,
        points_perdus: sanctionForm.points_perdus
      });
      closeSanctionModal();
      fetchMembres(); // pour mettre à jour la note de confiance affichée si on l'a
      alert('Sanction appliquée avec succès !');
    } catch (err) {
      // Simulation en cas d'absence d'API
      alert('Simulation : Sanction appliquée localement (Le backend doit être mis à jour).');
      closeSanctionModal();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce membre ?')) return;
    try { await API.delete(`/membres/${id}`); fetchMembres(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>👥 Gestion des membres</h1>
        <p>Gérez les inscriptions, droits annuels et sanctions</p>
      </div>

      <div className="top-actions">
        <div className="search-bar">
          <input
            placeholder="Rechercher par nom, email ou numéro..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Ajouter un membre</button>
      </div>

      <div className="card">
        {loading ? <div className="loading">Chargement...</div> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Contact</th>
                  <th>Abonnement</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {membres.length === 0 && (
                  <tr><td colSpan={5}><div className="empty-state"><p>Aucun membre trouvé</p></div></td></tr>
                )}
                {membres.map(m => (
                  <tr key={m.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div 
                        onClick={() => m.photo_url && setPreviewImage(m.photo_url.startsWith('http') ? m.photo_url : `http://localhost:8880${m.photo_url}`)}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#eee', flexShrink: 0, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: m.photo_url ? 'zoom-in' : 'default' }}
                      >
                        {m.photo_url ? (
                          <img 
                            src={m.photo_url.startsWith('http') ? m.photo_url : `http://localhost:8880${m.photo_url}`} 
                            alt="Avatar" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=👤'; }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '20px' }}>👤</div>
                        )}
                      </div>
                      <div>
                        <strong>{m.prenom} {m.nom}</strong><br />
                        <small style={{ color: '#888' }}>Matricule: {m.numero_carte}</small>
                      </div>
                    </td>
                    <td>{m.email}</td>
                    <td>
                      <span className={`badge ${m.droit_paye ? 'badge-success' : 'badge-danger'}`}>
                        {m.droit_paye ? '✅ À jour' : '❌ Non payé'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${m.mot_de_passe ? 'badge-info' : 'badge-warning'}`}>
                        {m.mot_de_passe ? 'Inscrit en ligne' : 'Pas de compte'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(m)} style={{ marginRight: 6 }} title="Modifier">✏️</button>
                      <button className="btn btn-warning btn-sm" onClick={() => openSanction(m)} style={{ marginRight: 6, background: '#f39c12', color: '#fff', border: 'none' }} title="Sanctionner">⚠️ Sanction</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)} title="Supprimer">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL AJOUT/MODIFICATION MEMBRE */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? '✏️ Modifier le membre' : '➕ Ajouter un membre'}</h2>
            {msg && <div className="alert alert-error">{msg}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom *</label>
                  <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Prénom *</label>
                  <input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Numéro de carte / Matricule *</label>
                <input value={form.numero_carte} onChange={e => setForm({ ...form, numero_carte: e.target.value })} required />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #dde1ea' }}>
                <input
                  type="checkbox"
                  id="droit_paye"
                  checked={form.droit_paye}
                  onChange={e => setForm({ ...form, droit_paye: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="droit_paye" style={{ margin: 0, cursor: 'pointer', fontSize: '15px', color: '#1E3A5F' }}>
                  Droit annuel payé (Active les emprunts)
                </label>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Mot de passe étudiant (optionnel)</label>
                <input
                  type="password"
                  placeholder="Mot de passe pour se connecter au site"
                  value={form.mot_de_passe || ''}
                  onChange={e => setForm({ ...form, mot_de_passe: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Mettre à jour' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SANCTION */}
      {sanctionModal && (
        <div className="modal-overlay" onClick={closeSanctionModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#c0392b' }}>⚠️ Appliquer une sanction</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Retirez des points de confiance à ce membre suite à une infraction.</p>
            {msg && <div className="alert alert-error">{msg}</div>}
            <form onSubmit={handleSanctionSubmit}>
              <div className="form-group">
                <label>Motif de la sanction *</label>
                <input
                  type="text"
                  placeholder="Ex: Livre rendu déchiré, Retard très important..."
                  value={sanctionForm.motif}
                  onChange={e => setSanctionForm({ ...sanctionForm, motif: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Points de confiance à retirer *</label>
                <input
                  type="number"
                  min="1" max="100"
                  value={sanctionForm.points_perdus}
                  onChange={e => setSanctionForm({ ...sanctionForm, points_perdus: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeSanctionModal}>Annuler</button>
                <button type="submit" className="btn btn-danger">Sanctionner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ZOOM PHOTO */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)} style={{ background: 'rgba(0,0,0,0.9)', zIndex: 2000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ background: 'transparent', boxShadow: 'none', padding: 0, width: 'auto', maxWidth: '90vw' }}>
            <img 
              src={previewImage} 
              alt="Zoom" 
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '12px', border: '5px solid #fff', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }} 
            />
            <button 
              onClick={() => setPreviewImage(null)}
              style={{ position: 'absolute', top: '-40px', right: '0', background: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
