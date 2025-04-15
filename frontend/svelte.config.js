import { vitePreprocess } from '@sveltejs/kit/vite';
import appengine from "svelte-adapter-appengine"


/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: appengine()
	}
};

export default config;
