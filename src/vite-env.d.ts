/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** OAuth Client ID do Google. Público por natureza — ver .env.example. */
  readonly VITE_GOOGLE_OAUTH_CLIENT_ID?: string;
  readonly VITE_APP_ENV?: string;
  readonly VITE_APP_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
