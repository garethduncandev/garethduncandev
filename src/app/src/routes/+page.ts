import type { Load } from '@sveltejs/kit';
export const prerender = true;
export const csr = true;
export const ssr = true;
export const load: Load = async () => {
	return {};
};
