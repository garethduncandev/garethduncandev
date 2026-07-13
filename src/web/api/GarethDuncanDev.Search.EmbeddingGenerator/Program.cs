using System.Text.Json;
using GarethDuncanDev.Search.Models;
using GarethDuncanDev.Search.Services;

if (args.Length < 2)
{
    Console.Error.WriteLine("Usage: EmbeddingGenerator <content-root> <output-dir>");
    return 1;
}

var contentRoot = Path.GetFullPath(args[0]);
var outputDir = Path.GetFullPath(args[1]);
var modelPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "EmbeddingModels", "all-MiniLM-L6-v2", "model.onnx");

Console.WriteLine($"Content root: {contentRoot}");
Console.WriteLine($"Output dir:   {outputDir}");
Console.WriteLine($"Model path:   {modelPath}");

if (!File.Exists(modelPath))
{
    Console.WriteLine($"\nERROR: ONNX model not found: {modelPath}");
    Console.WriteLine("\nPlease download the model files from:");
    Console.WriteLine("https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2");
    Console.WriteLine("\nRequired files:");
    Console.WriteLine("  - model.onnx (from onnx folder)");
    Console.WriteLine("  - tokenizer.json");
    Console.WriteLine("  - vocab.txt");
    Console.WriteLine("  - config.json");
    return 1;
}

Directory.CreateDirectory(outputDir);

using var embeddingService = EmbeddingService.Create(modelPath);
var totalCount = 0;

foreach (var type in new[] { "blog", "notes" })
{
    var dir = Path.Combine(contentRoot, type);
    if (!Directory.Exists(dir))
    {
        Console.WriteLine($"Warning: directory not found at {dir}, skipping.");
        continue;
    }

    var mdFiles = Directory.GetFiles(dir, "*.md");
    var articles = new List<Article>();

    foreach (var file in mdFiles)
    {
        var article = MarkdownParser.Parse(file, type);
        if (article is not null)
            articles.Add(article);
    }

    Console.WriteLine($"\nGenerating embeddings for {articles.Count} {type} articles...\n");

    var chunks = new List<ArticleChunk>();
    for (var i = 0; i < articles.Count; i++)
    {
        var article = articles[i];
        var textChunks = embeddingService.ChunkText(article.SearchText);
        Console.WriteLine($"  [{i + 1}/{articles.Count}] {article.Slug} ({textChunks.Count} chunks)");

        for (var c = 0; c < textChunks.Count; c++)
        {
            var embedding = embeddingService.GenerateEmbedding(textChunks[c]);
            chunks.Add(new ArticleChunk
            {
                Slug = article.Slug,
                Title = article.Title,
                Description = article.Description,
                Date = article.Date,
                Type = article.Type,
                ChunkIndex = c,
                Embedding = embedding
            });
        }
    }

    var outputPath = Path.Combine(outputDir, $"{type}-embedded.json");
    var outputJson = JsonSerializer.Serialize(chunks, new JsonSerializerOptions
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    });

    await File.WriteAllTextAsync(outputPath, outputJson);
    Console.WriteLine($"  Wrote {chunks.Count} chunks from {articles.Count} articles to {outputPath}");
    totalCount += chunks.Count;
}

if (totalCount == 0)
{
    Console.Error.WriteLine("No articles found. Exiting.");
    return 1;
}

Console.WriteLine($"\nDone. {totalCount} total chunks embedded.");
return 0;
