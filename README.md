# BAYONDY

Plateforme de formations vidéo en créole haïtien, optimisée pour le mobile et les connexions à faible bande passante.

## Installation

```bash
npm install
```

## Lancer en développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Tester et valider

```bash
# Vérification du typage et du linting
npm run lint

# Vérification du build de production
npm run build
```

## Règles de sécurité

- **Aucune clé secrète dans le code** : les clés et secrets d'API ne doivent jamais être commités ni écrits en dur. Utilisez exclusivement des variables d'environnement locales (`.env.local`), ignorées par Git.

## Relecture linguistique

- Les textes en créole haïtien constituent une proposition initiale et doivent faire l'objet d'une validation par un locuteur natif avant mise en production finale.
