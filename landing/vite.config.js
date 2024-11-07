import path from "node:path";
import { defineConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
	root: "src",
	build: {
		outDir: "../dist",
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: path.resolve(__dirname, "src/index.html"),
				certamen: path.resolve(__dirname, "src/certamen.html"),
				eventos: path.resolve(__dirname, "src/eventos.html"),
				votar: path.resolve(__dirname, "src/votar.html"),
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
});
