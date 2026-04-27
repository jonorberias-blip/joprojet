-- ============================================================
-- BIBLIOTHÈQUE UNIVERSITAIRE - SCHÉMA DE BASE DE DONNÉES
-- Base de données : bibliotheque_univ
-- ============================================================

CREATE DATABASE IF NOT EXISTS bibliotheque_univ
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE bibliotheque_univ;

-- ── Table des utilisateurs ────────────────────────────────────
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id`               int          NOT NULL AUTO_INCREMENT,
  `nom`              varchar(100) NOT NULL,
  `prenom`           varchar(100) NOT NULL,
  `email`            varchar(150) NOT NULL,
  `mot_de_passe`     varchar(255) NOT NULL,
  `role`             enum('etudiant','admin','staff') DEFAULT 'etudiant',
  `droit_paye`       tinyint(1)   DEFAULT '0',
  `note_confiance`   int          DEFAULT '100',
  `date_inscription` timestamp    NULL DEFAULT CURRENT_TIMESTAMP,
  `actif`            tinyint(1)   DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── Table des membres (étudiants inscrits) ────────────────────
CREATE TABLE IF NOT EXISTS `membres` (
  `id`            int          NOT NULL AUTO_INCREMENT,
  `nom`           varchar(100) NOT NULL,
  `prenom`        varchar(100) NOT NULL,
  `email`         varchar(150) NOT NULL,
  `mot_de_passe`  varchar(255) DEFAULT NULL,
  `telephone`     varchar(20)  DEFAULT NULL,
  `adresse`       varchar(255) DEFAULT NULL,
  `ecole_faculte` varchar(150) DEFAULT NULL,
  `niveau`        varchar(50)  DEFAULT NULL,
  `parcours`      varchar(150) DEFAULT NULL,
  `matricule`     varchar(50)  DEFAULT NULL,
  `motivation`    text,
  `photo_url`     varchar(500) DEFAULT NULL,
  `document_url`  varchar(500) DEFAULT NULL,
  `droit_paye`    tinyint(1)   DEFAULT '0',
  `note_confiance`int          DEFAULT '100',
  `actif`         tinyint(1)   DEFAULT '1',
  `created_at`    datetime     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email`     (`email`),
  UNIQUE KEY `matricule` (`matricule`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── Table des livres ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `livres` (
  `id`                  int          NOT NULL AUTO_INCREMENT,
  `titre`               varchar(255) NOT NULL,
  `auteur`              varchar(255) NOT NULL,
  `isbn`                varchar(20)  DEFAULT NULL,
  `categorie`           varchar(100) DEFAULT NULL,
  `annee_publication`   int          DEFAULT NULL,
  `quantite_totale`     int          NOT NULL DEFAULT '1',
  `quantite_disponible` int          NOT NULL DEFAULT '1',
  `image_url`           varchar(500) DEFAULT NULL,
  `date_ajout`          timestamp    NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `isbn` (`isbn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── Table des emprunts ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `emprunts` (
  `id`                    int  NOT NULL AUTO_INCREMENT,
  `id_utilisateur`        int  NOT NULL,
  `id_livre`              int  NOT NULL,
  `date_emprunt`          date NOT NULL,
  `date_retour_prevue`    date NOT NULL,
  `date_retour_effective` date DEFAULT NULL,
  `statut`                enum('en_cours','retourne','en_retard','perdu') DEFAULT 'en_cours',
  PRIMARY KEY (`id`),
  KEY `id_utilisateur` (`id_utilisateur`),
  KEY `id_livre`       (`id_livre`),
  CONSTRAINT `emprunts_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `emprunts_ibfk_2` FOREIGN KEY (`id_livre`)       REFERENCES `livres`        (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── Table des réservations ────────────────────────────────────
CREATE TABLE IF NOT EXISTS `reservations` (
  `id`               int       NOT NULL AUTO_INCREMENT,
  `id_utilisateur`   int       NOT NULL,
  `id_livre`         int       NOT NULL,
  `date_reservation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `statut`           enum('en_attente','validee','annulee') DEFAULT 'en_attente',
  PRIMARY KEY (`id`),
  KEY `id_utilisateur` (`id_utilisateur`),
  KEY `id_livre`       (`id_livre`),
  CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`id_livre`)       REFERENCES `livres`        (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── Table des paramètres du site ──────────────────────────────
CREATE TABLE IF NOT EXISTS `parametres_site` (
  `id`            int          NOT NULL AUTO_INCREMENT,
  `email_contact` varchar(150) NOT NULL,
  `tel_telma`     varchar(50)  NOT NULL,
  `tel_orange`    varchar(50)  NOT NULL,
  `photo_1`       varchar(500) DEFAULT NULL,
  `photo_2`       varchar(500) DEFAULT NULL,
  `photo_3`       varchar(500) DEFAULT NULL,
  `mis_a_jour_le` timestamp    NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- DONNÉES PAR DÉFAUT
-- ============================================================

-- Compte admin par défaut (mot de passe : Admin1234!)
INSERT IGNORE INTO `utilisateurs` (nom, prenom, email, mot_de_passe, role, actif) VALUES
('Admin', 'Système', 'admin@bibliotheque.com',
 '$2a$10$BAdoQ/T/GPmb9pWtCcicb.E6mUb/Bpupe12e6odKAqeISJ5abSoa.', 'admin', 1);

-- Compte staff par défaut (mot de passe : Admin1234!)
INSERT IGNORE INTO `utilisateurs` (nom, prenom, email, mot_de_passe, role, actif) VALUES
('Rakoto', 'Jean', 'staff@bibliotheque.com',
 '$2a$10$BAdoQ/T/GPmb9pWtCcicb.E6mUb/Bpupe12e6odKAqeISJ5abSoa.', 'staff', 1);

-- Paramètres du site par défaut
INSERT IGNORE INTO `parametres_site` (email_contact, tel_telma, tel_orange) VALUES
('contact@bibliotheque.com', '038 00 000 00', '032 00 000 00');
