import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	return {
		root: "src",
		envDir: "./",
		build: {
			outDir: "../dist",
			emptyOutDir: true,
			rollupOptions: {
				input: {
					main: path.resolve(__dirname, "src/index.html"),
					certamen: path.resolve(__dirname, "src/certamen.html"),
					eventos: path.resolve(__dirname, "src/eventos.html"),
					validar: path.resolve(__dirname, "src/validar.html"),
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
			}),
		],
		define: {
			__API_URL__: JSON.stringify(env.VITE_API_URL || "http://localhost:8000"),
		},
	};
});
