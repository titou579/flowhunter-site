# FlowHunter Site

Site perso style Linktree avec admin intégré, déployé sur Render.

## Développement local

    cp .env.example .env.local
    # adapte ADMIN_USER / ADMIN_PASS / AUTH_SECRET / ADMIN_PATH
    npm install
    npm run dev
    # → http://localhost:3000

## Admin

L'URL admin = `/${ADMIN_PATH}` (ex: `/admin.flowhunter`).
Sans cette URL, /admin renvoie 404.

Identifiants : `ADMIN_USER` / `ADMIN_PASS` (variables d'env).

## Déploiement Render

1. Push le repo sur GitHub.
2. Sur Render → New → Blueprint → sélectionne le repo (render.yaml est lu).
3. Attends le build. Le site est en ligne.

Variables d'env importantes :
- `ADMIN_USER`, `ADMIN_PASS` — identifiants admin
- `AUTH_SECRET` — secret JWT (auto-généré si via render.yaml)
- `ADMIN_PATH` — segment secret de l'URL admin (ex: `admin.flowhunter`)
- `STORAGE_DIR` — `/data` (disque Render). En plan Free : `./data`

## Sync local (optionnel)

Récupère data.json depuis Render et commit dans le repo toutes les 2 min :

    cp .env.sync.example .env.sync  # renseigne SITE_URL
    node tools/sync.js

Utile en plan Free (où le fichier n'est pas persistant côté Render),
ou comme backup versionné du contenu.
