export class MarkdownFile {
	public constructor(public meta: MarkdownMetaData, public path: string, public filePath: string) {}
}

export class MarkdownMetaData {
	public constructor(public title: string) {}
}
