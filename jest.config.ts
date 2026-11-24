import type { Config } from "jest";

const config: Config = {
  // Uniquement les tests de règles Firestore — isolés du build Next.js
  testMatch: ["**/tests/**/*.test.ts"],
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^server-only$": "<rootDir>/node_modules/server-only/empty.js",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // Timeout long car l'émulateur peut être lent au démarrage
  testTimeout: 30000,
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          // Config minimale pour les tests — ne charge pas tsconfig.json du projet
          module: "commonjs",
          target: "es2020",
          esModuleInterop: true,
          strict: true,
          resolveJsonModule: true,
        },
      },
    ],
  },
  // Variables d'environnement injectées pour les tests
  testEnvironmentOptions: {},
  // Pas de coverage pour les tests de règles (ce n'est pas du code TS)
  collectCoverage: false,
};

export default config;
