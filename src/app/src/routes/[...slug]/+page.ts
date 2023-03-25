import type { Load } from '@sveltejs/kit';
export const load: Load = async ({ params }) => {
	if (!params['slug']) {
		return;
	}

	const post = await import(`/src/posts/${params['slug']}.md`);

	const title = post.metadata['title'];

	const content = post.default;

	return {
		content,
		title
	};
};
