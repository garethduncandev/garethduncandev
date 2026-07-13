using System.Text.Json.Serialization;

namespace GarethDuncanDev.Search.Models;

public record Article
{
    public string Slug { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Date { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    [JsonIgnore]
    public string Content { get; init; } = string.Empty;

    [JsonIgnore]
    public string SearchText => $"{Title} {Description} {Content}";

    public float[]? Embedding { get; init; }
}
