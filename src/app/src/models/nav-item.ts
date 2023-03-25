export class NavItem {
	public constructor(
		public title: string,
		public url: string,
		public children: NavItem[]
	) {}
}
