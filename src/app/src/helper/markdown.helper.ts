import type { ComponentType, SvelteComponent } from 'svelte';
import type { MarkdownFile, MarkdownMetadata } from '../models/markdown-file';

export class MarkdownHelper {
	public async loadMarkdownFiles(): Promise<MarkdownFile[]> {
		const files = import.meta.glob<Record<string, MarkdownMetadata>>(
			'/src/posts/**/*.md'
		);

		const iterableMarkdownFiles = Object.entries(files);

		const promises = iterableMarkdownFiles.map(async ([path, resolver]) =>
			this.markdownFilesMap([path, resolver])
		);

		const markdownFiles = (await Promise.all(promises)) as MarkdownFile[];

		const published = markdownFiles.filter(
			(x) => x.metadata.published && x.metadata.datePublished
		);

		const active = published.filter(
			(x) => x.metadata?.datePublished?.getTime() <= Date.now()
		);

		return active;
	}

	private async markdownFilesMap([path, resolver]: [
		string,
		() => Promise<Record<string, MarkdownMetadata>>
	]): Promise<MarkdownFile> {
		const file = await resolver();
		const metadata = file['metadata'];

		// parse dates
		metadata.datePublished = new Date(metadata.datePublished);
		metadata.dateModified = new Date(metadata.dateModified);
		metadata.dateCreated = new Date(metadata.dateCreated);

		const content = file[
			'default'
		] as unknown as ComponentType<SvelteComponent>;

		const postPath = path.split('/posts')[1].replace('.md', '');

		return {
			metadata: metadata,
			path: postPath,
			filePath: path,
			content: content
		} as MarkdownFile;
	}
}
