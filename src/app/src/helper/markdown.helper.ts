import type { ComponentType, SvelteComponentTyped } from 'svelte';
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

		return markdownFiles;
	}

	private async markdownFilesMap([path, resolver]: [
		string,
		() => Promise<Record<string, MarkdownMetadata>>
	]): Promise<MarkdownFile> {
		const file = await resolver();
		const metadata = file['metadata'];

		const content = file[
			'default'
		] as unknown as ComponentType<SvelteComponentTyped>;

		// clean the
		const postPath = path.split('/posts')[1].replace('.md', '');

		return {
			metadata: metadata,
			path: postPath,
			filePath: path,
			content: content
		} as MarkdownFile;
	}
}
