export class AppSettings {
	public constructor(
		public buildTime: Date,
		public domain: string,
		public subDomain: string,
		public apiUrl: string,
		public aspNetCoreEnvironment: string,
		public stackName: string
	) {}
}
