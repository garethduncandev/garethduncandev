<script context="module" lang="ts">
	import { BuildDetails } from '../models/build-details';
	import * as version from '../versions/sveltekit-version.json';
	import * as dotnetversion from './../versions/dotnet-version.txt?raw';
	import {
		PUBLIC_BRANCH,
		PUBLIC_BUILD,
		PUBLIC_COMMIT
	} from '$env/static/public';

	let buildDetails: BuildDetails | undefined = undefined;

	export function loadBuildDetails(): BuildDetails {
		console.log('loadBuildDetails');
		if (buildDetails) return buildDetails;

		buildDetails = new BuildDetails(
			PUBLIC_BUILD,
			PUBLIC_COMMIT,
			PUBLIC_BRANCH,
			dotnetversion.default,
			version.dependencies['@sveltejs/kit'].version
		);
		return buildDetails;
	}
</script>
