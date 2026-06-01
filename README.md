#  DeltaShop - E-commerce Full-Stack MERN

**DeltaShop** est une plateforme e-commerce moderne et complète construite avec la stack **MERN** (MongoDB, Express, React, Node.js). Le projet offre une expérience d'achat intuitive avec un back-office administrateur puissant pour la gestion des produits, utilisateurs et commandes.

**Lien démo** : http://localhost:5173

---

##  Aperçu du Projet

### Page d'Accueil
![Boutique](Captures/Boutique.png)
![Boutique 2](Captures/boutique2.png)
![Boutique 3](Captures/Boutique3.png)

### Gestion Panier & Commandes
![Panier](Captures/Panier.png)
![Commande](Captures/commande.png)

### Espace Utilisateur
![Ma Liste de Souhaits](Captures/Ma%20liste%20de%20souhait.png)
![Produits Tendance](Captures/Produit%20Tendace.png)

### Espace Admin
![Dashboard Admin](Captures/Dashboard%20Admin.png)
![Gestion Utilisateurs](Captures/Gestion%20utilisateur%20par%20l'admin.png)

### Newsletter
![Bulletin d'Inscription](Captures/Bulletin.png)

---

##  Démarrage Rapide

### 1️ Prérequis
- **Node.js** 20+ recommandé
- **npm** 10+
- **Docker Desktop** (optionnel, pour MongoDB)

### 2️ Installation des dépendances
\\\\\\ash
npm install
\\\\\\
Cela installe les dépendances du backend et du frontend (monorepo avec workspaces npm).

### 3️ Configuration MongoDB

#### Option A : Docker (Recommandé)
\\\\\\ash
docker-compose up -d
\\\\\\
MongoDB sera accessible sur \mongodb://localhost:27017/deltashop\

#### Option B : MongoDB Local
Adapter la variable d'environnement \MONGO_URI\ dans \.env\ :
\\\\\\env
MONGO_URI=mongodb://localhost:27017/deltashop
\\\\\\

### 4️ Variables d'Environnement
Copier \.env.example\ vers \.env\ à la racine du projet :
\\\\\\ash
cp .env.example .env
\\\\\\

### 5️ Initialiser la Base de Données
\\\\\\ash
npm run seed
\\\\\\
Cela crée l'utilisateur admin et les données initiales (produits, avis, etc.).

### 6️ Lancer l'Application
\\\\\\ash
npm run dev
\\\\\\
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:5000

---

##  Comptes de Test

### Compte Admin
\\\\\\
Email    : admin@delta.com
Password : Admin123!
\\\\\\

Pour accéder à l'admin : Connexion → Page Admin

---

##  Fonctionnalités

###  Authentification & Utilisateurs
-  Inscription avec validation d'email
-  Connexion/Déconnexion avec JWT
-  Gestion de profil utilisateur
-  Récupération de mot de passe (structure prête)
-  Dashboard utilisateur avec historique de commandes

###  Catalogue & Produits
-  Affichage du catalogue avec pagination
-  Filtrage par catégorie
-  Recherche full-text des produits
-  Page détaillée de produit
-  Avis et notes des clients
-  Produits tendance
-  Offres spéciales (Deals of the Day)
-  Produits récemment consultés (localStorage)

###  Panier & Commandes
-  Panier persistant (localStorage)
-  Ajout/Suppression d'articles
-  Calcul automatique du total
-  Création de commandes
-  Historique des commandes
-  Détails de chaque commande

###  Liste de Souhaits
-  Ajouter/Retirer des produits favoris
-  Affichage de la wishlist personnelle
-  Persistance en base de données

###  Newsletter
-  Inscription à la newsletter
-  Gestion des abonnés (admin)
-  Export CSV des abonnés

###  Espace Administrateur
-  **Dashboard** : Vue d'ensemble des statistiques
-  **Gestion Produits** : CRUD complet
-  **Gestion Catégories** : Créer/Modifier les catégories
-  **Gestion Utilisateurs** : Voir/Gérer les utilisateurs
-  **Gestion Commandes** : Suivi des commandes
-  **Gestion Sliders** : Bannières personnalisables
-  **Gestion Newsletter** : Voir les abonnés, export CSV
-  **Produits Tendance** : Marquer les produits populaires

###  Design & UX
-  Interface responsive (mobile, tablette, desktop)
-  Thème sombre/clair (structure prête)
-  Animations et transitions fluides
-  Design Tailwind CSS moderne

---

##  Structure du Projet

\\\\\\
Delta-Commerce/
├── backend/                          # API Node.js/Express
│   ├── src/
│   │   ├── config/                  # Configuration MongoDB
│   │   ├── controllers/             # Logique métier
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   ├── adminController.js
│   │   │   └── ...
│   │   ├── models/                  # Schémas Mongoose
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   └── ...
│   │   ├── routes/                  # Routes API
│   │   ├── middleware/              # Middlewares Express
│   │   ├── utils/                   # Utilitaires (token, slug)
│   │   ├── data/                    # Données seed
│   │   └── server.js               # Point d'entrée
│   └── package.json
│
├── frontend/                         # App React/Vite
│   ├── src/
│   │   ├── components/             # Composants React
│   │   │   ├── Header.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── ...
│   │   ├── pages/                  # Pages (routes)
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductPage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   └── ...
│   │   ├── features/               # Redux slices
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   └── products/
│   │   ├── lib/                    # Utilitaires
│   │   │   ├── api.js             # Client HTTP Axios
│   │   │   ├── image.js
│   │   │   └── recentlyViewed.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── images/                          # Assets statiques
├── Captures/                        # Screenshots du projet
├── docker-compose.yml              # Configuration Docker
├── package.json                    # Root package.json
└── .env.example                    # Variables d'env exemple
\\\\\\

---

##  Technologies Utilisées

### Backend
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM MongoDB
- **JWT** - Authentification token
- **bcryptjs** - Hash de mots de passe
- **Multer** - Upload de fichiers
- **Morgan** - Logging HTTP
- **CORS** - Contrôle d'accès cross-origin

### Frontend
- **React 19** - Bibliothèque UI
- **Vite** - Build tool & dev server
- **Redux Toolkit** - Gestion d'état
- **React Router 7** - Routage
- **Axios** - Client HTTP
- **Tailwind CSS** - Styling CSS
- **Lucide React** - Icônes

---

##  Scripts Disponibles

### Root
\\\\\\ash
npm run dev              # Lance frontend + backend simultanément
npm run dev:backend     # Lance uniquement le backend
npm run dev:frontend    # Lance uniquement le frontend
npm run build           # Build le frontend
npm run start           # Démarre le backend en production
\\\\\\

### Backend
\\\\\\ash
npm run dev             # Mode développement (nodemon)
npm run start           # Production
npm run seed            # Initialise la base de données
\\\\\\

### Frontend
\\\\\\ash
npm run dev             # Dev server Vite
npm run build           # Build pour production
npm run lint            # ESLint
npm run preview         # Prévisualise la build
\\\\\\

---

##  Authentification & Sécurité

- **JWT Bearer Token** : Stocké en localStorage côté client
- **Hash Bcrypt** : Mots de passe hashés (salt: 10)
- **CORS** : Contrôle des origines
- **Validation** : Validation côté serveur de tous les inputs

---

##  Installation pour la Production

\\\\\\ash
# Build frontend
npm run build

# Vérifier la build
npm run preview

# Démarrer le backend (assurez-vous que NODE_ENV=production)
npm start
\\\\\\

---

##  Dépannage

### MongoDB ne se connecte pas
\\\\\\ash
# Vérifier la connexion
# 1. Docker : docker-compose ps
# 2. Vérifier MONGO_URI dans .env
\\\\\\

### Erreur 401 - Authentification échouée
\\\\\\ash
# Réinitialiser la base de données
npm run seed
\\\\\\

### Frontend ne se connecte pas à l'API
\\\\\\ash
# Vérifier VITE_API_URL dans .env (frontend)
# Par défaut: http://localhost:5000
\\\\\\

---

##  Notes de Développement

- Le projet utilise **ES Modules** (\ type\: \module\\ dans package.json)
- Monorepo avec **npm workspaces**
- **Nodemon** pour le hot-reload backend
- **Vite** pour le hot-reload frontend
- Middleware d'erreur centralisé

---

##  Licence

MIT

---

**Auteur** : JOSEPH MUKUBU KAPOYA
**Année** : 2026
