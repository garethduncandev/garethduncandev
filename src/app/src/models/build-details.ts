export class BuildDetails {
	public constructor(
		public buildNumber: string,
		public commitId: string,
		public branch: string,
		public dotnetVersion: string,
		public svelteKitVersion: string
	) {}
}
