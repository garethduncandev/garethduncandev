import type { MarkdownFile } from '../models/markdown-file';
import { NavItem } from '../models/nav-item';
import { PathTreeHelper, type PathTree } from './pathTree.helper';

export class NavHelper {
	public createMarkdownMenu(markdownFiles: MarkdownFile[]): NavItem[] {
		const paths = markdownFiles.map((x) => x.path);
		const pathTreeHelper = new PathTreeHelper();
		const tree = pathTreeHelper.PathsToTree(paths);
		return this.mapPathTreeToMenuItem(tree, markdownFiles);
	}

	private mapPathTreeToMenuItem(
		pathTree: PathTree[],
		markdownFiles: MarkdownFile[]
	): NavItem[] {
		return pathTree.map((path) => {
			const children =
				path.children.length > 0
					? this.mapPathTreeToMenuItem(path.children, markdownFiles)
					: [];
			const pageTitle =
				markdownFiles.find((f) => f.path === path.path)?.metadata.title ?? '';
			return new NavItem(pageTitle, path.path, children);
		});
	}
}
