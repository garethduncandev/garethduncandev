export class AppSettings {
	apiUrl!: string; // provided via release
	build!: string; // provided via build
	commit!: string; // provided via build
	dotnetVersion!: string; // provided via build
	svelteKitVersion!: string; // provided via build
	environment!: string; // provided via build
	environmentColor!: string; // provided via build
	title!: string; // provided via release
}
