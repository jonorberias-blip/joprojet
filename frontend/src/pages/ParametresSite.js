import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

export default function ParametresSite() {
  const [form, setForm] = useState({
    email_contact: '',
    tel_telma: '',
    tel_orange: '',
    photo_1: '',
    photo_2: '',
    photo_3: ''
  });
  const [files, setFiles] = useState({ photo_1: null, photo_2: null, photo_3: null });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    API.get('/settings').then(res => {
      setForm(res.data);
    }).catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('⏳ Mise à jour en cours...');
    try {
      const data = new FormData();
      data.append('email_contact', form.email_contact);
      data.append('tel_telma', form.tel_telma);
      data.append('tel_orange', form.tel_orange);
      
      // On garde les anciennes URLs
      data.append('photo_1', form.photo_1);
      data.append('photo_2', form.photo_2);
      data.append('photo_3', form.photo_3);

      // Si nouveaux fichiers, multer les remplacera côté backend
      if (files.photo_1) data.append('photo_1', files.photo_1);
      if (files.photo_2) data.append('photo_2', files.photo_2);
      if (files.photo_3) data.append('photo_3', files.photo_3);

      await API.put('/settings', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg('✅ Paramètres mis à jour avec succès !');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ Erreur lors de la mise à jour');
    }
  };

  const renderPhotoInput = (num, label) => {
    const photoKey = `photo_${num}`;
    const currentPhoto = form[photoKey];
    return (
      <div className="form-group" style={{ marginBottom: '24px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
        <label style={{ fontWeight: '600', display: 'block', marginBottom: '10px' }}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '100px', height: '60px', borderRadius: '4px', background: '#eee', overflow: 'hidden', border: '1px solid #ddd' }}>
            {currentPhoto ? (
              <img src={currentPhoto.startsWith('http') ? currentPhoto : `https://joprojet.onrender.com${currentPhoto}`} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : <div style={{ textAlign: 'center', lineHeight: '60px', color: '#aaa' }}>Aucune</div>}
          </div>
          <div style={{ flex: 1 }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => setFiles({ ...files, [photoKey]: e.target.files[0] })} 
              style={{ fontSize: '13px' }}
            />
            <p style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>Laisse vide pour conserver l'image actuelle.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>⚙️ Paramètres du Site</h1>
        <p>Modifiez les informations affichées sur la page d'accueil publique</p>
      </div>

      <div className="card glass-panel" style={{ maxWidth: '800px' }}>
        {msg && <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-info'}`}>{msg}</div>}
        
        <form onSubmit={handleSubmit}>
          <h3 style={{ color: '#1E3A5F', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>📞 Contacts</h3>
          
          <div className="form-group">
            <label>Adresse Email de contact</label>
            <input type="email" value={form.email_contact} onChange={e => setForm({...form, email_contact: e.target.value})} required />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Numéro Telma</label>
              <input type="text" value={form.tel_telma} onChange={e => setForm({...form, tel_telma: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Numéro Orange</label>
              <input type="text" value={form.tel_orange} onChange={e => setForm({...form, tel_orange: e.target.value})} required />
            </div>
          </div>

          <h3 style={{ color: '#1E3A5F', marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>🖼️ Galerie Photos</h3>
          
          {renderPhotoInput(1, "Photo 1 (Bâtiment principal)")}
          {renderPhotoInput(2, "Photo 2 (Salles de lecture)")}
          {renderPhotoInput(3, "Photo 3 (Rayonnages)")}

          <div style={{ marginTop: '32px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '16px' }}>
              💾 Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
