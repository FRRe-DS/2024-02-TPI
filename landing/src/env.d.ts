/// <reference path="../.astro/types.d.ts" />
declare module "virtual:pwa-assets/head" {
	export const pwaAssetsHead: {
		links: Record<string, unknown>[];
		themeColor?: {
			content: string;
		};
	};
}
