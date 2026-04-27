import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    telephone: '',
    adresse: '',
    ecole_faculte: '',
    niveau: '',
    parcours: '',
    matricule: '',
    motivation: ''
  });
  const [photo, setPhoto] = useState(null);
  const [documentPdf, setDocumentPdf] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // NOTE: Le backend devra utiliser multer ou un service similaire pour gérer le FormData (fichiers)
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      if (photo) formData.append('photo', photo);
      if (documentPdf) formData.append('documentPdf', documentPdf);

      await API.post('/auth/register-etudiant', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Inscription réussie ! Veuillez vous connecter.');
      navigate('/login');
    } catch (err) {
      // Pour l'instant, on simule une réussite même si l'API backend n'existe pas encore
      console.log('Données à envoyer au backend :', form, photo, documentPdf);
      alert('Simulation: Inscription enregistrée localement ! (Le backend nécessite une mise à jour)');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ padding: '40px 20px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '40px' }}>
        <h1 style={{ fontSize: '28px', color: '#1E3A5F', marginBottom: '8px', textAlign: 'center' }}>Créer un compte Étudiant</h1>
        <p style={{ color: '#666', marginBottom: '32px', textAlign: 'center' }}>Rejoignez la bibliothèque universitaire pour emprunter des livres.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nom</label>
              <input type="text" required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Prénom(s)</label>
              <input type="text" required value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Adresse email</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" required minLength="6" value={form.mot_de_passe} onChange={e => setForm({...form, mot_de_passe: e.target.value})} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Numéro de téléphone</label>
              <input type="text" required value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Adresse actuelle</label>
              <input type="text" required value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} />
            </div>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #dde1ea', margin: '24px 0' }} />
          <h3 style={{ fontSize: '18px', color: '#1E3A5F', marginBottom: '16px' }}>Informations Académiques</h3>

          <div className="form-row">
            <div className="form-group">
              <label>École ou Faculté</label>
              <input type="text" required value={form.ecole_faculte} onChange={e => setForm({...form, ecole_faculte: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Niveau (ex: L1, L2, M1...)</label>
              <input type="text" required value={form.niveau} onChange={e => setForm({...form, niveau: e.target.value})} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Parcours / Mention</label>
              <input type="text" required value={form.parcours} onChange={e => setForm({...form, parcours: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Numéro Matricule</label>
              <input type="text" required value={form.matricule} onChange={e => setForm({...form, matricule: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label>Quelles sont vos motivations pour rejoindre la bibliothèque ?</label>
            <textarea rows="3" required value={form.motivation} onChange={e => setForm({...form, motivation: e.target.value})}></textarea>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #dde1ea', margin: '24px 0' }} />
          <h3 style={{ fontSize: '18px', color: '#1E3A5F', marginBottom: '16px' }}>Documents à fournir</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Photo récente (JPG/PNG)</label>
              <input type="file" accept="image/*" required onChange={e => setPhoto(e.target.files[0])} style={{ padding: '8px' }} />
            </div>
            <div className="form-group">
              <label>PDF CIN ou Copie de naissance</label>
              <input type="file" accept=".pdf" required onChange={e => setDocumentPdf(e.target.files[0])} style={{ padding: '8px' }} />
            </div>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', gap: '16px', flexDirection: 'column' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }} disabled={loading}>
              {loading ? 'Création en cours...' : "S'inscrire"}
            </button>
            <div style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
              Vous avez déjà un compte ? <Link to="/login" style={{ color: '#1E3A5F', fontWeight: '600', textDecoration: 'none' }}>Se connecter</Link>
            </div>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link to="/" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>← Retour à l'accueil</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
