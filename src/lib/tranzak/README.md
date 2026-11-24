# Intégration Passerelle Tranzak — BAYONDY

Intégration officielle de la passerelle de paiement Tranzak (MonCash, NatCash, Carte bancaire) pour la vente de formations en ligne sur BAYONDY.

Référence officielle : https://dashboard.tranzak.co/ai (Version 1.0)

## Architecture

- `src/lib/tranzak/types.ts` : Contrats et types TypeScript stricts (requêtes, réponses, webhooks, conversion).
- `src/lib/tranzak/config.ts` : Lecture sécurisée des variables d'environnement (`TRANZAK_API_KEY`, `TRANZAK_WEBHOOK_SECRET`, `TRANZAK_BASE_URL`). En sandbox, vérifie que la clé commence par `tk_test_`.
- `src/lib/tranzak/crypto.ts` : Vérification des signatures HMAC-SHA256 en temps constant (`crypto.timingSafeEqual`) pour le webhook (`X-Tranzak-Signature`) et la page de retour (`&signature=`).
- `src/lib/tranzak/client.ts` : Client HTTP Gateway v1 (`POST /payments`, `GET /payments/{id}`, `POST /payments/{id}/verify`, etc.).
- `src/lib/tranzak/service.ts` : Logique d'idempotence stricte et attribution de l'accès élève (`fulfillPayment`, `isEventAlreadyProcessed`, `recordProcessedEvent`).

## Routes API

- `POST /api/payments/create` : Initialise un paiement pour l'élève connecté (montant calculé strictement sur le serveur, vérification anti-doublon).
- `POST /api/webhooks/tranzak` : Réception du webhook signé, dédoublonnage, contre-vérification serveur et attribution d'accès.
- `GET /api/payments/verify` : Vérification côté serveur appelée par la page de retour client ou par polling de réconciliation.

## Interface Utilisateur

- `src/app/(public)/paiement/retour/page.tsx` : Page de retour client après paiement, polling automatique et redirection vers la formation.
- `src/components/course/EnrollButton.tsx` : Bouton d'achat interactif et modal de choix de méthode (MonCash / NatCash / Carte).
