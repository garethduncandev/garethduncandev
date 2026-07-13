using GarethDuncanDev.Search.Models;

namespace GarethDuncanDev.Search.Services;

public class VectorStore
{
    private readonly List<ArticleChunk> _chunks = [];

    public void Load(IEnumerable<ArticleChunk> chunks)
    {
        ArgumentNullException.ThrowIfNull(chunks);

        _chunks.Clear();
        _chunks.AddRange(chunks.Where(c => c.Embedding is not null));
    }

    public IReadOnlyList<(ArticleChunk Chunk, float Similarity)> Search(float[] queryEmbedding, string? type = null, int topK = 10)
    {
        ArgumentNullException.ThrowIfNull(queryEmbedding);

        if (_chunks.Count == 0)
        {
            return [];
        }

        var source = type is null
            ? _chunks
            : _chunks.Where(c => c.Type.Equals(type, StringComparison.OrdinalIgnoreCase));

        return source
            .Select(chunk => (
                Chunk: chunk,
                Similarity: CalculateCosineSimilarity(queryEmbedding, chunk.Embedding!)
            ))
            .GroupBy(x => x.Chunk.Slug)
            .Select(g => g.OrderByDescending(x => x.Similarity).First())
            .OrderByDescending(x => x.Similarity)
            .Take(topK)
            .ToList();
    }

    private static float CalculateCosineSimilarity(float[] vector1, float[] vector2)
    {
        if (vector1.Length != vector2.Length)
        {
            throw new ArgumentException("Vectors must have the same length");
        }

        float dotProduct = 0;
        float magnitude1 = 0;
        float magnitude2 = 0;

        for (int i = 0; i < vector1.Length; i++)
        {
            dotProduct += vector1[i] * vector2[i];
            magnitude1 += vector1[i] * vector1[i];
            magnitude2 += vector2[i] * vector2[i];
        }

        magnitude1 = MathF.Sqrt(magnitude1);
        magnitude2 = MathF.Sqrt(magnitude2);

        if (magnitude1 == 0 || magnitude2 == 0)
        {
            return 0;
        }

        return dotProduct / (magnitude1 * magnitude2);
    }

    public int Count => _chunks.Count;
}
