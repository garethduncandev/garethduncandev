import type { Load } from '@sveltejs/kit';
import { MarkdownHelper } from '../../helper/markdown.helper';
import { NavHelper } from '../../helper/nav.helper';
import type { NavItem } from '../../models/nav-item';
export const load: Load = async () => {
	const markdownHelper = new MarkdownHelper();
	const markdownFiles = await markdownHelper.loadMarkdownFiles();
	const menuHelper = new NavHelper();
	const nav: NavItem[] = menuHelper.createMarkdownMenu(markdownFiles);

	return JSON.parse(JSON.stringify({ nav }));
};
