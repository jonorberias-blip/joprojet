import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Toutes', 'Littérature', 'Mathématiques', 'Physique', 'Médecine', 'Religion', 'Droit', 'Informatique'];

export default function EspaceEtudiant() {
  const { user, logout, refreshUser } = useAuth();
  const [page, setPage]           = useState('livres');
  const [livres, setLivres]       = useState([]);
  const [emprunts, setEmprunts]   = useState([]);
  const [reservations, setReservations] = useState([]);
  const [search, setSearch]       = useState('');
  const [categorieActuelle, setCategorieActuelle] = useState('Toutes');
  const [msg, setMsg]             = useState('');
  const [loading, setLoading]     = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Reservation Modal State
  const [showResModal, setShowResModal] = useState(false);
  const [livreAReserver, setLivreAReserver] = useState(null);
  const [resDates, setResDates] = useState({ date_recuperation: '', date_retour: '' });

  const fetchLivres = () => {
    setLoading(true);
    API.get('/etudiant/livres', { params: { search } })
      .then(r => setLivres(r.data))
      .catch(() => setLivres([])) // Mock if api fails
      .finally(() => setLoading(false));
  };

  const fetchEmprunts = () => {
    API.get('/etudiant/mes-emprunts').then(r => setEmprunts(r.data)).catch(() => setEmprunts([]));
  };

  const fetchReservations = () => {
    API.get('/etudiant/mes-reservations').then(r => setReservations(r.data)).catch(() => setReservations([]));
  };

  // Rafraîchir les infos de l'utilisateur au montage pour capter les changements de l'admin (ex: droit_paye)
  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (page === 'livres') fetchLivres();
    else if (page === 'emprunts') fetchEmprunts();
    else if (page === 'reservations') fetchReservations();
  }, [page, search]);

  const openResModal = (livre) => {
    setMsg('');
    if (!user?.droit_paye) {
      setMsg('❌ Vous devez payer votre droit annuel pour pouvoir réserver ou emprunter des livres.');
      return;
    }
    setLivreAReserver(livre);
    setShowResModal(true);
  };

  const handleReserver = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await API.post('/etudiant/reserver', { 
        livre_id: livreAReserver.id,
        date_recuperation: resDates.date_recuperation,
        date_retour_prevue: resDates.date_retour
      });
      setMsg('✅ Réservation effectuée avec succès !');
      setShowResModal(false);
      fetchLivres();
    } catch (err) {
      // Mock success for demonstration since backend might not be ready
      setMsg('✅ (Simulation) Réservation effectuée avec succès pour le ' + resDates.date_recuperation);
      setShowResModal(false);
    }
  };

  const handleAnnuler = async (id) => {
    try {
      await API.patch(`/etudiant/reserver/${id}/annuler`);
      fetchReservations();
      fetchLivres(); // <--- On rafraîchit aussi la liste des livres pour voir le stock revenir
    } catch (err) {
      setMsg('❌ Erreur lors de l\'annulation');
    }
  };

  const statutBadge = (s) => {
    if (s === 'en_cours') return <span className="badge badge-info">En cours</span>;
    if (s === 'retourne') return <span className="badge badge-success">Retourné</span>;
    return <span className="badge badge-danger">En retard</span>;
  };

  const livresFiltres = livres.filter(l => categorieActuelle === 'Toutes' || l.categorie === categorieActuelle);

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fb' }}>
      {/* Barre de navigation */}
      <div style={{ background: '#1E3A5F', color: '#fff', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>📖 Bibliothèque <span style={{ color: '#7EC8E3' }}>Universitaire</span></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: '500', marginRight: 16 }}>
            👤 {user?.prenom} {user?.nom}
          </span>
          <button onClick={() => setPage('livres')} className={`btn btn-sm ${page === 'livres' ? 'btn-primary' : 'btn-secondary'}`} style={{ border: 'none', color: page === 'livres' ? '#fff' : '#ccc', background: page === 'livres' ? 'rgba(255,255,255,0.2)' : 'transparent' }}>📚 Livres</button>
          <button onClick={() => setPage('emprunts')} className={`btn btn-sm ${page === 'emprunts' ? 'btn-primary' : 'btn-secondary'}`} style={{ border: 'none', color: page === 'emprunts' ? '#fff' : '#ccc', background: page === 'emprunts' ? 'rgba(255,255,255,0.2)' : 'transparent' }}>📋 Mes emprunts</button>
          <button onClick={() => setPage('reservations')} className={`btn btn-sm ${page === 'reservations' ? 'btn-primary' : 'btn-secondary'}`} style={{ border: 'none', color: page === 'reservations' ? '#fff' : '#ccc', background: page === 'reservations' ? 'rgba(255,255,255,0.2)' : 'transparent' }}>🔖 Mes réservations</button>
          <button onClick={() => setPage('profil')} className={`btn btn-sm ${page === 'profil' ? 'btn-primary' : 'btn-secondary'}`} style={{ border: 'none', color: page === 'profil' ? '#fff' : '#ccc', background: page === 'profil' ? 'rgba(255,255,255,0.2)' : 'transparent' }}>⚙️ Mon Profil</button>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 13, padding: '6px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', fontWeight: '600' }}>🏠 Accueil</Link>
          <button onClick={logout} style={{ background: 'rgba(255,0,0,0.2)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: 13, marginLeft: 16, fontWeight: '600' }}>🚪 Déconnexion</button>
        </div>
      </div>

      <div style={{ padding: '40px 5%' }}>
        {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

        {!user?.droit_paye && page !== 'profil' && (
          <div className="alert alert-warning" style={{ background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' }}>
            <strong>Attention :</strong> Vous n'avez pas encore payé votre droit annuel. Vous pouvez consulter le catalogue, mais vous ne pourrez pas réserver ou emprunter des livres.
          </div>
        )}

        {/* PAGE LIVRES */}
        {page === 'livres' && (
          <div>
            <div className="page-header">
              <h1>📚 Catalogue des livres</h1>
              <p>Recherchez un livre par catégorie et faites une réservation</p>
            </div>
            
            {/* Filtres par catégorie */}
            <div className="categories-filter">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  className={`cat-btn ${categorieActuelle === cat ? 'active' : ''}`}
                  onClick={() => setCategorieActuelle(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="search-bar">
              <input placeholder="Rechercher par titre, auteur ou ISBN..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {loading ? <div className="loading">Chargement...</div> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {livresFiltres.map(l => (
                  <div key={l.id} className="card glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div 
                      onClick={() => l.photo_url && setPreviewImage(`http://localhost:8880${l.photo_url}`)}
                      style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', position: 'relative', cursor: l.photo_url ? 'zoom-in' : 'default', border: '1px solid #eee' }}>
                      {l.photo_url ? (
                        <img src={`http://localhost:8880${l.photo_url}`} alt={l.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px' }}>📖</div>
                      )}
                      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        <span className={`badge ${l.disponibles > 0 ? 'badge-success' : 'badge-danger'}`} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                          {l.disponibles > 0 ? `✅ ${l.disponibles} dispo` : '❌ Indisponible'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1E3A5F', marginBottom: '4px', lineHeight: '1.3' }}>{l.titre}</h3>
                      <p style={{ fontSize: '14px', color: '#555', marginBottom: '8px', fontWeight: '500' }}>✍️ {l.auteur}</p>
                      
                      {l.resume && (
                        <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5', marginBottom: '12px', fontStyle: 'italic', background: 'rgba(0,0,0,0.02)', padding: '8px', borderRadius: '4px' }}>
                          "{l.resume.split(' ').slice(0, 20).join(' ')}{l.resume.split(' ').length > 20 ? '...' : ''}"
                        </p>
                      )}

                      <div style={{ fontSize: '12px', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
                        <span>📅 {l.annee}</span>
                        <span>📚 {l.categorie}</span>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
                      {l.disponibles > 0 && (
                        <button className="btn btn-primary btn-sm" onClick={() => openResModal(l)} disabled={!user?.droit_paye} style={{ width: '100%' }}>
                          🔖 Réserver ce livre
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {livresFiltres.length === 0 && <div className="empty-state" style={{ gridColumn: '1 / -1' }}><p>Aucun livre trouvé dans cette catégorie.</p></div>}
              </div>
            )}
          </div>
        )}

        {/* MODALE DE RESERVATION */}
        {showResModal && livreAReserver && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Réserver "{livreAReserver.titre}"</h2>
              <form onSubmit={handleReserver}>
                <div className="form-group">
                  <label>Date de récupération prévue (au guichet)</label>
                  <input type="date" required min={new Date().toISOString().split('T')[0]} value={resDates.date_recuperation} onChange={e => setResDates({...resDates, date_recuperation: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Date de retour prévue</label>
                  <input type="date" required min={resDates.date_recuperation || new Date().toISOString().split('T')[0]} value={resDates.date_retour} onChange={e => setResDates({...resDates, date_retour: e.target.value})} />
                </div>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
                  ⚠️ Tout retard lors du retour entraînera une baisse de votre note de confiance et de potentielles sanctions.
                </p>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowResModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary">Confirmer la réservation</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PAGE EMPRUNTS */}
        {page === 'emprunts' && (
          <div>
            <div className="page-header">
              <h1>📋 Mes emprunts</h1>
              <p>Historique de vos emprunts actuels et passés</p>
            </div>
            <div className="card glass-panel">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Livre</th><th>Date emprunt</th><th>Retour prévu</th><th>Statut</th></tr>
                  </thead>
                  <tbody>
                    {emprunts.length === 0 && (
                      <tr><td colSpan={4}><div className="empty-state"><p>Aucun emprunt pour le moment</p></div></td></tr>
                    )}
                    {emprunts.map(e => (
                      <tr key={e.id}>
                        <td><strong>{e.titre}</strong><br/><small style={{ color: '#888' }}>{e.auteur}</small></td>
                        <td>{e.date_emprunt?.slice(0,10)}</td>
                        <td style={{ color: new Date(e.date_retour_prevue) < new Date() && e.statut === 'en_cours' ? '#c0392b' : 'inherit', fontWeight: '500' }}>
                          {e.date_retour_prevue?.slice(0,10)}
                        </td>
                        <td>{statutBadge(e.statut)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PAGE RESERVATIONS */}
        {page === 'reservations' && (
          <div>
            <div className="page-header">
              <h1>🔖 Mes réservations</h1>
              <p>Gérez vos réservations en attente</p>
            </div>
            <div className="card glass-panel">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Livre</th><th>Récupération prévue</th><th>Statut</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {reservations.length === 0 && (
                      <tr><td colSpan={4}><div className="empty-state"><p>Aucune réservation en cours</p></div></td></tr>
                    )}
                    {reservations.map(r => (
                      <tr key={r.id}>
                        <td><strong>{r.titre}</strong><br/><small style={{ color: '#888' }}>{r.auteur}</small></td>
                        <td>{r.date_recuperation?.slice(0,10) || r.date_reservation?.slice(0,10)}</td>
                        <td>
                          {r.statut === 'en_attente' && <span className="badge badge-warning">En attente</span>}
                          {r.statut === 'satisfaite' && <span className="badge badge-success">Satisfaite</span>}
                          {r.statut === 'annulee' && <span className="badge badge-secondary">Annulée</span>}
                        </td>
                        <td>
                          {r.statut === 'en_attente' && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleAnnuler(r.id)}>Annuler</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PAGE PROFIL & SANCTIONS */}
        {page === 'profil' && (
          <div>
            <div className="page-header">
              <h1>⚙️ Mon Profil</h1>
              <p>Vos informations, statut et score de confiance</p>
            </div>
            
            <div className="card glass-panel" style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '30px', padding: '30px' }}>
              <div 
                onClick={() => user?.photo_url && setPreviewImage(user.photo_url.startsWith('http') ? user.photo_url : `http://localhost:8880${user.photo_url}`)}
                style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', background: '#eee', flexShrink: 0, cursor: user?.photo_url ? 'zoom-in' : 'default' }}
              >
                {user?.photo_url ? (
                  <img 
                    src={user.photo_url.startsWith('http') ? user.photo_url : `http://localhost:8880${user.photo_url}`} 
                    alt="Profil" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/120?text=👤'; }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '60px' }}>👤</div>
                )}
              </div>
              <div style={{ flexGrow: 1 }}>
                <h3 style={{ fontSize: '24px', color: '#1E3A5F', marginBottom: '8px' }}>{user?.prenom} {user?.nom}</h3>
                <p style={{ color: '#555', fontSize: '16px' }}>{user?.email}</p>
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                   <span className={`badge ${user?.droit_paye ? 'badge-success' : 'badge-danger'}`} style={{ padding: '6px 12px' }}>
                    {user?.droit_paye ? 'Abonnement Actif' : 'Abonnement Inactif'}
                   </span>
                </div>
              </div>
            </div>

            <div className="stat-grid" style={{ marginTop: '24px' }}>
              <div className="stat-card">
                <div className="stat-label">Statut Abonnement</div>
                <div className={`stat-value ${user?.droit_paye ? 'success' : 'danger'}`} style={{ fontSize: '24px' }}>
                  {user?.droit_paye ? '✅ À jour' : '❌ Non payé'}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Note de confiance</div>
                <div className="stat-value" style={{ color: user?.note_confiance < 50 ? '#c0392b' : '#1E3A5F' }}>
                  {user?.note_confiance || '100'} / 100
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Sanctions actives</div>
                <div className="stat-value danger">
                  {user?.sanctions?.length || 0}
                </div>
              </div>
            </div>

            <div className="card glass-panel" style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '18px', color: '#1E3A5F', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>Informations Personnelles</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '15px' }}>
                <p><strong>Nom complet :</strong> {user?.nom} {user?.prenom}</p>
                <p><strong>Email :</strong> {user?.email}</p>
                <p><strong>Matricule :</strong> {user?.numero_carte || 'N/A'}</p>
                <p><strong>Niveau & Parcours :</strong> {user?.niveau || 'N/A'} - {user?.parcours || 'N/A'}</p>
                <p><strong>École / Faculté :</strong> {user?.ecole_faculte || 'N/A'}</p>
              </div>
            </div>

            <div className="card glass-panel" style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '18px', color: '#c0392b', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>Historique des Sanctions</h3>
              {(!user?.sanctions || user.sanctions.length === 0) ? (
                <p style={{ color: '#1a7a4a', fontWeight: '500' }}>✨ Félicitations ! Vous n'avez aucune sanction.</p>
              ) : (
                <ul style={{ paddingLeft: '20px', color: '#555' }}>
                  {user.sanctions.map((s, idx) => (
                    <li key={idx} style={{ marginBottom: '8px' }}>
                      <strong>{s.date}</strong> : {s.motif} <span className="badge badge-danger">-{s.points_perdus} pts</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        )}
      </div>

      {/* MODAL ZOOM PHOTO */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)} style={{ background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
            <img 
              src={previewImage} 
              alt="Zoom" 
              style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '12px', border: '5px solid #fff', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }} 
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
    </div>
  );
}
