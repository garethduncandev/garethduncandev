import {
	PUBLIC_API_URL,
	PUBLIC_COMMIT,
	PUBLIC_BUILD,
	PUBLIC_ENVIRONMENT,
	PUBLIC_TITLE,
	PUBLIC_ENVIRONMENT_CHANNEL
} from '$env/static/public';
import { MarkdownHelper } from '../../helper/markdown.helper';
import { NavHelper } from '../../helper/nav.helper';
import type { AppSettings } from '../../models/appsettings';
import type { NavItem } from '../../models/nav-item';
import * as version from '../../../src/versions/sveltekit-version.json';
import * as dotnetversion from '../../../src/versions/dotnet-version.txt?raw';

export const prerender = true;
export const load = async () => {
	const appSettings: AppSettings = {
		apiUrl: PUBLIC_API_URL,
		build: PUBLIC_BUILD,
		commit: PUBLIC_COMMIT,
		dotnetVersion: dotnetversion.default,
		svelteKitVersion: version.dependencies['@sveltejs/kit'].version,
		environment: PUBLIC_ENVIRONMENT,
		environmentChannel: PUBLIC_ENVIRONMENT_CHANNEL,
		title: PUBLIC_TITLE
	};

	const markdownHelper = new MarkdownHelper();
	const markdownFiles = await markdownHelper.loadMarkdownFiles();
	const menuHelper = new NavHelper();
	const nav: NavItem[] = menuHelper.createMarkdownMenu(markdownFiles);

	return JSON.parse(JSON.stringify({ nav, appSettings }));
};
