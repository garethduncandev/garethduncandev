import type { Load } from '@sveltejs/kit';
import { MarkdownHelper } from '../../helper/markdown.helper';

export const prerender = true;
export const load: Load = async ({ params }) => {
	if (!params['slug']) {
		return;
	}

	const slug = params['slug'].toString();
	const markdownHelper = new MarkdownHelper();
	const posts = await markdownHelper.loadMarkdownFiles();
	const post = posts.find((x) => x.path === `/${slug}`);
	if (!post) {
		throw new Error('Post not found', post);
	}
	return post;
};
