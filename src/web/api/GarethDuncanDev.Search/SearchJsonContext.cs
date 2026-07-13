using System.Text.Json.Serialization;
using GarethDuncanDev.Search.Models;

namespace GarethDuncanDev.Search;

[JsonSerializable(typeof(List<ArticleChunk>))]
[JsonSourceGenerationOptions(PropertyNameCaseInsensitive = true)]
internal partial class SearchJsonContext : JsonSerializerContext;
