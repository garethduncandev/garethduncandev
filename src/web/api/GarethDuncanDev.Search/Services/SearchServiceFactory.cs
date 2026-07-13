using System.Text.Json;
using GarethDuncanDev.Search.Models;

namespace GarethDuncanDev.Search.Services;

public static class SearchServiceFactory
{
    private static ArticleSearchService? _searchService;
    private static EmbeddingService? _embeddingService;
    private static readonly Lock _lock = new();

    public static ArticleSearchService GetOrCreate(string embeddingsDir, string modelPath)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(embeddingsDir);
        ArgumentException.ThrowIfNullOrWhiteSpace(modelPath);

        if (_searchService != null)
            return _searchService;

        lock (_lock)
        {
            if (_searchService != null)
                return _searchService;

            if (!Directory.Exists(embeddingsDir))
            {
                throw new DirectoryNotFoundException($"Embeddings directory not found: {embeddingsDir}. Please run the EmbeddingGenerator first.");
            }

            if (!File.Exists(modelPath))
            {
                throw new FileNotFoundException($"ONNX model not found: {modelPath}. Please download the model files from: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2");
            }

            var chunks = new List<ArticleChunk>();

            foreach (var file in Directory.GetFiles(embeddingsDir, "*-embedded.json"))
            {
                var json = File.ReadAllText(file);
                var batch = JsonSerializer.Deserialize(json, SearchJsonContext.Default.ListArticleChunk);
                if (batch is not null)
                    chunks.AddRange(batch);
            }

            if (chunks.Count == 0)
            {
                throw new InvalidOperationException("No articles found in embeddings directory");
            }

            _embeddingService = EmbeddingService.Create(modelPath);
            var vectorStore = new VectorStore();
            vectorStore.Load(chunks);

            _searchService = new ArticleSearchService(_embeddingService, vectorStore);
            return _searchService;
        }
    }

    public static void Reset()
    {
        lock (_lock)
        {
            _embeddingService?.Dispose();
            _embeddingService = null;
            _searchService = null;
        }
    }
}
