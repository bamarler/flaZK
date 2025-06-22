/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_WIDGET_URL: string
    readonly VITE_USE_MOCKS: string
    readonly DEV: boolean
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }