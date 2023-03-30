import type { ComponentType, SvelteComponentTyped } from 'svelte';

export class MarkdownFile {
	public constructor(
		public metadata: MarkdownMetadata,
		public path: string,
		public filePath: string,
		public content: ComponentType<SvelteComponentTyped>
	) {}
}

export class MarkdownMetadata {
	public constructor(
		public title: string,
		public dateCreated: Date,
		public datePublished: Date,
		public dateUpdated: Date,
		public published: boolean
	) {}
}
