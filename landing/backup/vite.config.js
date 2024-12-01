import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	return {
		root: "src",
		envDir: "./",
		build: {
			outDir: "../dist",
			manifest: true,
			emptyOutDir: true,
			rollupOptions: {
				input: {
					main: path.resolve(__dirname, "src/index.html"),
					certamen: path.resolve(__dirname, "src/certamen.html"),
					eventos: path.resolve(__dirname, "src/eventos.html"),
					validar: path.resolve(__dirname, "src/validar.html"),
					detalle_evento: path.resolve(__dirname, "src/detalle_evento.html"),
					__footer: path.resolve(__dirname, "src/footer.html"),
					__header: path.resolve(__dirname, "src/header.html"),
				},
			},
		},
		plugins: [
			ViteImageOptimizer({
				jpeg: {
					quality: 80,
				},
				jpg: {
					quality: 80,
				},

				png: {
					quality: 80,
				},
			}),

			VitePWA({
				devOptions: {
					enabled: true,
				},

				pwaAssets: {
					disabled: false,
					config: true,
				},

				manifest: {
					short_name: "BienalTPI",
					name: "Bienal del Chaco TPI",
					start_url: "./index.html",
					display: "standalone",
					theme_color: "#000000",
					description: "PWA App para el trabaja practico integrador Grupo 02",
					background_color: "#000000",
				},
			}),
		],
		define: {
			__API_URL__: JSON.stringify(env.VITE_API_URL || "http://localhost:8000"),
		},
	};
});
