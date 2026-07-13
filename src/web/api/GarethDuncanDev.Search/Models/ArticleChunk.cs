namespace GarethDuncanDev.Search.Models;

public record ArticleChunk
{
    public string Slug { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Date { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public int ChunkIndex { get; init; }
    public float[]? Embedding { get; init; }
}
