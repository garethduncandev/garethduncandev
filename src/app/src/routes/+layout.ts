import {
	PUBLIC_API_URL,
	PUBLIC_COMMIT,
	PUBLIC_DOTNET_VERSION,
	PUBLIC_SVELTEKIT_VERSION,
	PUBLIC_BUILD,
	PUBLIC_ENVIRONMENT,
	PUBLIC_ENVIRONMENT_COLOR,
	PUBLIC_TITLE
} from '$env/static/public';
import { MarkdownHelper } from '../helper/markdown.helper';
import { NavHelper } from '../helper/nav.helper';
import type { AppSettings } from '../models/appsettings';
import type { NavItem } from '../models/nav-item';

export const prerender = true;
export const load = async () => {
	const appSettings: AppSettings = {
		apiUrl: PUBLIC_API_URL,
		build: PUBLIC_BUILD,
		commit: PUBLIC_COMMIT,
		dotnetVersion: PUBLIC_DOTNET_VERSION,
		svelteKitVersion: PUBLIC_SVELTEKIT_VERSION,
		environment: PUBLIC_ENVIRONMENT,
		environmentColor: PUBLIC_ENVIRONMENT_COLOR,
		title: PUBLIC_TITLE
	};

	const markdownHelper = new MarkdownHelper();
	const markdownFiles = await markdownHelper.loadMarkdownFiles();
	const menuHelper = new NavHelper();
	const nav: NavItem[] = menuHelper.createMarkdownMenu(markdownFiles);

	return JSON.parse(JSON.stringify({ nav, appSettings }));
};
