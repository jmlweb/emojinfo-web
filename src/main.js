import App from './App.svelte';
import categories from 'emojinfo-json/data/categories.json';

const app = new App({
	target: document.body,
	props: {
		name: 'world',
		categories,
	}
});

export default app;
