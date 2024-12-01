/// <reference types="vite/client" />
declare const __API_URL__: string;
interface ImportMetaEnv {
	readonly VITE_API_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
