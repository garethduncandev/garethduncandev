import type { Load } from '@sveltejs/kit';
import { MarkdownHelper } from '../../../../helper/markdown.helper';
import { PUBLIC_TITLE } from '$env/static/public';
import type { MarkdownFile } from '../../../../models/markdown-file';

export const prerender = true;
export const load: Load = async ({ params }) => {
	if (!params['slug']) {
		return;
	}

	const slug = params['slug'].toString();
	console.log('slug', slug);
	const markdownHelper = new MarkdownHelper();
	const posts = await markdownHelper.loadMarkdownFiles();
	console.log('posts', posts);

	const post = posts.find((x) => `${x.path}/` === `/${slug}`);
	if (!post) {
		throw new Error('Post not found', post);
	}

	return {
		post: post,
		siteTitle: PUBLIC_TITLE
	};
};

export type PageResponse = {
	post: MarkdownFile;
	siteTitle: string;
};
