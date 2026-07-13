using GarethDuncanDev.Search.Models;

namespace GarethDuncanDev.Search.Services;

public class ArticleSearchService(EmbeddingService embeddingService, VectorStore vectorStore)
{
    private readonly EmbeddingService _embeddingService =
        embeddingService ?? throw new ArgumentNullException(nameof(embeddingService));

    private readonly VectorStore _vectorStore = vectorStore ?? throw new ArgumentNullException(nameof(vectorStore));

    public IReadOnlyList<(ArticleChunk Chunk, float Similarity)> Search(string query, string? type = null, int topK = 10)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(query);

        var queryEmbedding = _embeddingService.GenerateEmbedding(query);
        return _vectorStore.Search(queryEmbedding, type, topK);
    }
}
