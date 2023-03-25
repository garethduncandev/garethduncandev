export interface PathTree {
	name: string;
	path: string;
	children: PathTree[];
}

export class PathTreeHelper {
	public PathsToTree(paths: string[]): PathTree[] {
		const result = paths
			.map((path) => path.split('/').slice(1))
			.map((x) =>
				x.map((m) => {
					return { name: m, children: [], path: '' } as PathTree;
				})
			)
			.reduce((children, path) => this.insertChild(children, path[0], path.slice(1)), []);

		this.populateFullPath(result, '');
		return result;
	}

	private insertChild(children: PathTree[], head: PathTree, tail: PathTree[]): PathTree[] {
		let child = children.find((child) => child.name === head.name);

		if (!child) {
			child = { name: head.name, path: '', children: [] } as PathTree;
			children.push(child);
		}
		if (tail.length > 0) {
			this.insertChild(child.children, tail[0], tail.slice(1));
		}

		return children;
	}

	private populateFullPath(folderTrees: PathTree[], parentPath: string): void {
		for (const folderTree of folderTrees) {
			folderTree.path = `${parentPath}/${folderTree.name}`;

			if (folderTree.children.length > 0) {
				this.populateFullPath(folderTree.children, folderTree.path);
			}
		}
	}
}
