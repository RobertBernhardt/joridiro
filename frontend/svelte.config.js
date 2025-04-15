import { vitePreprocess } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Use adapter-vercel with default options
		adapter: adapter({
			// Optional: specify any Vercel-specific options here
			// For example, to make an Edge function deployment:
			// edge: false,
			// Split your app into multiple functions:
			// split: false
		}),
		
		// Add any other SvelteKit configuration as needed
	}
};

export default config;