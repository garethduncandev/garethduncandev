import type { MarkdownFile, MarkdownMetaData } from '../models/markdown-file';

export class MarkdownHelper {
	public async loadMarkdownFiles(): Promise<MarkdownFile[]> {
		const allPostFiles = import.meta.glob<Record<string, MarkdownMetaData>>(
			'/src/posts/**/*.md'
		);

		const iterablePostFiles = Object.entries(allPostFiles);

		const posts = (await Promise.all(
			iterablePostFiles.map(async ([path, resolver]) => {
				const file = await resolver();
				const metadata = file['metadata'];

				// clean the
				const postPath = path.split('/posts')[1].replace('.md', '');

				return {
					meta: metadata,
					path: postPath,
					filePath: path
				} as MarkdownFile;
			})
		)) as MarkdownFile[];

		return posts;
	}
}
