import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const emptyForm = { titre: '', auteur: '', isbn: '', annee: '', categorie: '', exemplaires: 1, resume: '', photo: null };

export default function Livres() {
  const [livres, setLivres]   = useState([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg]         = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const fetchLivres = () => {
    setLoading(true);
    API.get('/livres', { params: { search } }).then(r => setLivres(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLivres(); }, [search]);

  const openAdd  = () => { setForm(emptyForm); setEditing(null); setModal(true); setMsg(''); };
  const openEdit = (l) => { setForm(l); setEditing(l.id); setModal(true); setMsg(''); };
  const closeModal = () => { setModal(false); setMsg(''); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setMsg('');
    try {
      const data = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'photo' && form[key]) data.append('photo', form[key]);
        else if (key !== 'photo') data.append(key, form[key]);
      });

      if (editing) await API.put(`/livres/${editing}`, data);
      else         await API.post('/livres', data);
      closeModal(); fetchLivres();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce livre ?')) return;
    try {
      await API.delete(`/livres/${id}`);
      fetchLivres();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>📚 Catalogue des livres</h1>
        <p>Gérez l'ensemble des livres de la bibliothèque</p>
      </div>

      <div className="top-actions">
        <div className="search-bar">
          <input placeholder="Rechercher par titre, auteur ou ISBN..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Ajouter un livre</button>
      </div>

      <div className="card">
        {loading ? <div className="loading">Chargement...</div> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Titre</th><th>Auteur</th><th>ISBN</th>
                  <th>Catégorie</th><th>Disponibles</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {livres.length === 0 && (
                  <tr><td colSpan={6}><div className="empty-state"><p>Aucun livre trouvé</p></div></td></tr>
                )}
                {livres.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div 
                          onClick={() => l.photo_url && setPreviewImage(`https://joprojet.onrender.com${l.photo_url}`)}
                          style={{ width: '40px', height: '56px', borderRadius: '4px', overflow: 'hidden', background: '#eee', flexShrink: 0, border: '1px solid #ddd', cursor: l.photo_url ? 'zoom-in' : 'default' }}>
                          {l.photo_url ? (
                            <img src={`https://joprojet.onrender.com${l.photo_url}`} alt="Couverture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📖</div>
                          )}
                        </div>
                        <div>
                          <strong>{l.titre}</strong>
                          {l.resume && <p style={{ fontSize: '11px', color: '#666', margin: '4px 0 0 0', maxWidth: '300px' }}>{l.resume.split(' ').slice(0, 20).join(' ')}...</p>}
                        </div>
                      </div>
                    </td>
                    <td>{l.auteur}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{l.isbn}</td>
                    <td>{l.categorie || '—'}</td>
                    <td>
                      <span className={`badge ${l.disponibles > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {l.disponibles}/{l.exemplaires}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(l)} style={{ marginRight: 6 }}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? '✏️ Modifier le livre' : '➕ Ajouter un livre'}</h2>
            {msg && <div className="alert alert-error">{msg}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Titre *</label>
                  <input value={form.titre} onChange={e => setForm({...form, titre: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Auteur *</label>
                  <input value={form.auteur} onChange={e => setForm({...form, auteur: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>ISBN *</label>
                  <input value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Année</label>
                  <input type="number" value={form.annee} onChange={e => setForm({...form, annee: e.target.value})} />
                </div>
              </div>
               <div className="form-row">
                <div className="form-group">
                  <label>Catégorie</label>
                  <input value={form.categorie} onChange={e => setForm({...form, categorie: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Nb d'exemplaires</label>
                  <input type="number" min={1} value={form.exemplaires} onChange={e => setForm({...form, exemplaires: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Résumé du livre (max 20 mots recommandés)</label>
                <textarea 
                  rows="3" 
                  value={form.resume || ''} 
                  onChange={e => setForm({...form, resume: e.target.value})}
                  placeholder="Bref résumé de l'histoire ou du contenu..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #dde1ea' }}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Photo de couverture</label>
                <input type="file" accept="image/*" onChange={e => setForm({...form, photo: e.target.files[0]})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Mettre à jour' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ZOOM COUVERTURE */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)} style={{ background: 'rgba(0,0,0,0.9)', zIndex: 2000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ background: 'transparent', boxShadow: 'none', padding: 0, width: 'auto', maxWidth: '90vw' }}>
            <img 
              src={previewImage} 
              alt="Zoom Couverture" 
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '8px', border: '5px solid #fff', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }} 
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
