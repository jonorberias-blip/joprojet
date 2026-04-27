import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="loading">Chargement...</div></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>Tableau de bord</h1>
        <p>Vue d'ensemble de la bibliothèque</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total livres</div>
          <div className="stat-value">{stats?.total_livres ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Membres actifs</div>
          <div className="stat-value">{stats?.total_membres ?? 0}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Emprunts en cours</div>
          <div className="stat-value">{stats?.emprunts_en_cours ?? 0}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Retards</div>
          <div className="stat-value">{stats?.retards ?? 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1E3A5F', marginBottom: 16 }}>📚 Livres les plus empruntés</h2>
          {stats?.livres_populaires?.length ? (
            <table>
              <thead><tr><th>Titre</th><th>Auteur</th><th>Emprunts</th></tr></thead>
              <tbody>
                {stats.livres_populaires.map((l, i) => (
                  <tr key={i}>
                    <td>{l.titre}</td>
                    <td>{l.auteur}</td>
                    <td><span className="badge badge-info">{l.nb_emprunts}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="empty-state"><p>Aucun emprunt enregistré</p></div>}
        </div>

        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1E3A5F', marginBottom: 16 }}>📊 Emprunts par mois</h2>
          {stats?.emprunts_par_mois?.length ? (
            <table>
              <thead><tr><th>Mois</th><th>Nombre d'emprunts</th></tr></thead>
              <tbody>
                {stats.emprunts_par_mois.map((m, i) => (
                  <tr key={i}>
                    <td>{m.mois}</td>
                    <td><span className="badge badge-success">{m.nb}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="empty-state"><p>Aucune donnée disponible</p></div>}
        </div>
      </div>
    </Layout>
  );
}
