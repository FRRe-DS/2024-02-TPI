// @ts-check
// @ts-check
import { defineConfig, envField } from "astro/config";

import netlify from "@astrojs/netlify";

import AstroPWA from "@vite-pwa/astro";

// https://astro.build/config
export default defineConfig({
	integrations: [
		AstroPWA({
			includeAssets: ["favicon.svg"],
			registerType: "autoUpdate",
			base: "/",
			scope: "/",
			manifest: {
				short_name: "BienalTPI",
				name: "Bienal del Chaco TPI",
				start_url: "./index.html",
				display: "standalone",
				theme_color: "#000000",
				description: "PWA App para el trabaja practico integrador Grupo 02",
				background_color: "#000000",
			},
			pwaAssets: {
				config: true,
			},
			workbox: {
				navigateFallback: "/",
				globPatterns: ["**/*.{css,js,html,svg,png,ico,txt}"],
			},
			devOptions: {
				enabled: true,
				/* other options */
			},
			experimental: {
				directoryAndTrailingSlashHandler: true,
			},
		}),
	],

	experimental: {
		env: {
			schema: {
				API_URL: envField.string({
					context: "client",
					access: "public",
					optional: true,
					default:
						"https://tpi-desarrollo-e0f8gccuhvhpbkhj.eastus-01.azurewebsites.net",
				}),
			},
		},
	},

	output: "hybrid",
	adapter: netlify(),
});
