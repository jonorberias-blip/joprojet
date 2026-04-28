import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

export default function Home() {
  const [showMap, setShowMap] = useState(false);
  const [settings, setSettings] = useState({
    email: 'contact-biblio@univ-antsiranana.mg',
    telma: '034 12 345 67',
    orange: '032 98 765 43',
    photo_1: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    photo_2: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80',
    photo_3: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get('/settings');
        const data = res.data;
        setSettings({
          email: data.email_contact || data.email,
          telma: data.tel_telma || data.telma,
          orange: data.tel_orange || data.orange,
          photo_1: data.photo_1,
          photo_2: data.photo_2,
          photo_3: data.photo_3
        });
      } catch (err) {
        console.error("Erreur chargement paramètres:", err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <h1>📖 Bibliothèque <span>Universitaire</span></h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/login" className="btn btn-secondary glass-panel" style={{ color: '#fff', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}>
            Se connecter
          </Link>
          <Link to="/signup" className="btn btn-primary">
            S'inscrire
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <h2>Plongez au cœur du savoir</h2>
        <p>Découvrez des milliers d'ouvrages, réservez vos livres en ligne et enrichissez vos connaissances avec notre plateforme moderne dédiée aux étudiants de l'université.</p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '18px' }}>
            Rejoindre la bibliothèque
          </Link>
        </div>
      </header>

      {/* Informations, Contact et Localisation */}
      <section className="info-section" style={{ padding: '80px 5%', background: '#fff', color: '#333' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '36px', color: '#1E3A5F', marginBottom: '16px' }}>À Propos & Contact</h2>
          <p style={{ fontSize: '18px', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
            Notre bibliothèque universitaire est ouverte à tous les étudiants inscrits de l'Université.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', maxWidth: '1000px', margin: '0 auto' }}>
          
          <div className="card" style={{ background: '#f8fafc', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '20px', color: '#1E3A5F', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📍 Localisation
            </h3>
            <p style={{ color: '#555', marginBottom: '16px', lineHeight: '1.6' }}>
              <strong>Université d'Antsiranana (UNA)</strong><br />
              Campus Universitaire, Antsiranana, Madagascar.<br />
              Bâtiment Central de la Bibliothèque.
            </p>
            <button className="btn btn-primary" onClick={() => setShowMap(true)}>
              🗺️ Voir la vue de haut (Carte)
            </button>
          </div>

          <div className="card" style={{ background: '#f8fafc', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '20px', color: '#1E3A5F', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📞 Contact & Horaires
            </h3>
            <ul style={{ listStyle: 'none', color: '#555', lineHeight: '1.8' }}>
              <li><strong>Email :</strong> {settings.email}</li>
              <li><strong>Tél (Telma) :</strong> {settings.telma}</li>
              <li><strong>Tél (Orange) :</strong> {settings.orange}</li>
            </ul>
            <p style={{ marginTop: '12px', color: '#555' }}>
              <strong>Horaires :</strong> Ouvert du Lundi au Samedi, de 08h00 à 18h00.
            </p>
          </div>
        </div>
      </section>

      {/* Galerie Photos */}
      <section style={{ padding: '80px 5%', background: '#f4f6fb' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', color: '#1E3A5F', marginBottom: '16px' }}>La Bibliothèque en Images</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <img 
              src={settings.photo_1?.startsWith('/uploads') ? `https://joprojet.onrender.com${settings.photo_1}` : settings.photo_1} 
              alt="Extérieur de la bibliothèque" 
              style={{ width: '100%', height: '250px', objectFit: 'cover', display: 'block' }} 
            />
            <div style={{ padding: '16px', background: '#fff', textAlign: 'center', fontWeight: '600', color: '#1E3A5F' }}>Bâtiment principal</div>
          </div>
          <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <img 
              src={settings.photo_2?.startsWith('/uploads') ? `https://joprojet.onrender.com${settings.photo_2}` : settings.photo_2} 
              alt="Intérieur de la bibliothèque" 
              style={{ width: '100%', height: '250px', objectFit: 'cover', display: 'block' }} 
            />
            <div style={{ padding: '16px', background: '#fff', textAlign: 'center', fontWeight: '600', color: '#1E3A5F' }}>Salles de lecture silencieuses</div>
          </div>
          <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <img 
              src={settings.photo_3?.startsWith('/uploads') ? `https://joprojet.onrender.com${settings.photo_3}` : settings.photo_3} 
              alt="Rayonnages de livres" 
              style={{ width: '100%', height: '250px', objectFit: 'cover', display: 'block' }} 
            />
            <div style={{ padding: '16px', background: '#fff', textAlign: 'center', fontWeight: '600', color: '#1E3A5F' }}>Des milliers d'ouvrages</div>
          </div>
        </div>
      </section>

      {/* Règles */}
      <section className="rules-section">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', color: '#1E3A5F', marginBottom: '16px' }}>Règlement Intérieur</h2>
        </div>
        <div className="rules-grid">
          <div className="rule-card">
            <div className="icon">🤫</div>
            <h3>Respect et Silence</h3>
            <p>La bibliothèque est un lieu de travail. Le silence est exigé dans toutes les salles de lecture. Les téléphones doivent être sur silencieux.</p>
          </div>
          <div className="rule-card">
            <div className="icon">💳</div>
            <h3>Droit Annuel</h3>
            <p>L'accès à l'emprunt et aux réservations nécessite le paiement d'un droit annuel. Une fois payé, un administrateur activera votre compte.</p>
          </div>
          <div className="rule-card">
            <div className="icon">📅</div>
            <h3>Emprunts et Retards</h3>
            <p>Les livres doivent être rendus à la date convenue. Tout retard entraînera une baisse de votre note de confiance et des sanctions administratives.</p>
          </div>
          <div className="rule-card">
            <div className="icon">📚</div>
            <h3>Soin des Livres</h3>
            <p>Tout livre perdu, annoté ou abîmé devra être remboursé au prix du neuf ou remplacé par l'étudiant responsable.</p>
          </div>
        </div>
      </section>

      {/* Modale Carte Google Maps (Vue Satellite / Haut) */}
      {showMap && (
        <div className="modal-overlay" onClick={() => setShowMap(false)}>
          <div className="modal" style={{ maxWidth: '800px', padding: '20px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>📍 Université d'Antsiranana (Vue de haut)</h2>
              <button className="btn btn-secondary" onClick={() => setShowMap(false)} style={{ padding: '6px 12px' }}>Fermer ❌</button>
            </div>
            <div style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', background: '#eee' }}>
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight="0" 
                marginWidth="0" 
                src="https://maps.google.com/maps?q=Université%20d'Antsiranana&t=k&z=17&ie=UTF8&iwloc=&output=embed"
                title="Carte Université d'Antsiranana"
              ></iframe>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
