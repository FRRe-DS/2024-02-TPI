declare module 'astro:env/client' {
	export const API_URL: string;	

}

declare module 'astro:env/server' {
	

	export const getSecret: (key: string) => string | undefined;
}
