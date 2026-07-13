using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using Microsoft.ML.Tokenizers;

namespace GarethDuncanDev.Search.Services;

/// <summary>
/// Embedding service that uses ONNX Runtime with BERT tokenization to generate embeddings from text.
/// </summary>
public class EmbeddingService : IDisposable
{
    private readonly InferenceSession _session;
    private readonly BertTokenizer _tokenizer;
    private const int MaxLength = 256;
    private bool _disposed;

    private EmbeddingService(InferenceSession session, BertTokenizer tokenizer)
    {
        _session = session;
        _tokenizer = tokenizer;
    }

    public static EmbeddingService Create(string modelPath)
    {
        ArgumentNullException.ThrowIfNull(modelPath);

        if (!File.Exists(modelPath))
        {
            throw new FileNotFoundException($"ONNX model not found at: {modelPath}");
        }

        var modelDirectory = Path.GetDirectoryName(modelPath) ?? throw new InvalidOperationException("Could not determine model directory");
        var vocabPath = Path.Combine(modelDirectory, "vocab.txt");

        if (!File.Exists(vocabPath))
        {
            throw new FileNotFoundException($"Vocab file not found at: {vocabPath}");
        }

        var session = new InferenceSession(modelPath);
        var tokenizer = BertTokenizer.Create(
            vocabPath,
            new BertOptions
            {
                LowerCaseBeforeTokenization = true,
                ApplyBasicTokenization = true,
                SplitOnSpecialTokens = true
            });

        return new EmbeddingService(session, tokenizer);
    }

    public List<string> ChunkText(string text, int chunkSize = 200, int overlap = 50)
    {
        var tokenIds = _tokenizer.EncodeToIds(text, considerNormalization: true, considerPreTokenization: true);
        var chunks = new List<string>();

        if (tokenIds.Count <= chunkSize)
        {
            chunks.Add(text);
            return chunks;
        }

        for (var start = 0; start < tokenIds.Count; start += chunkSize - overlap)
        {
            var end = Math.Min(start + chunkSize, tokenIds.Count);
            var chunkTokens = tokenIds.Skip(start).Take(end - start).ToList();
            var chunkText = _tokenizer.Decode(chunkTokens) ?? string.Empty;

            if (!string.IsNullOrWhiteSpace(chunkText))
                chunks.Add(chunkText);

            if (end == tokenIds.Count)
                break;
        }

        return chunks;
    }

    public float[] GenerateEmbedding(string text)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(text);

        var tokenIds = _tokenizer.EncodeToIds(text, considerNormalization: true, considerPreTokenization: true);
        var inputIdsWithSpecialTokens = _tokenizer.BuildInputsWithSpecialTokens(tokenIds, Array.Empty<int>()).ToArray();
        var tokenTypeIdsValues = _tokenizer.CreateTokenTypeIdsFromSequences(tokenIds, Array.Empty<int>()).ToArray();
        var tokenCount = Math.Min(inputIdsWithSpecialTokens.Length, MaxLength);

        var inputIds = new long[MaxLength];
        var attentionMask = new long[MaxLength];
        var tokenTypeIds = new long[MaxLength];

        for (var i = 0; i < tokenCount; i++)
        {
            inputIds[i] = inputIdsWithSpecialTokens[i];
            attentionMask[i] = 1;
            tokenTypeIds[i] = tokenTypeIdsValues.Length > i ? tokenTypeIdsValues[i] : 0;
        }

        var inputIdsTensor = new DenseTensor<long>(inputIds, new[] { 1, MaxLength });
        var attentionMaskTensor = new DenseTensor<long>(attentionMask, new[] { 1, MaxLength });
        var tokenTypeIdsTensor = new DenseTensor<long>(tokenTypeIds, new[] { 1, MaxLength });

        var inputs = new List<NamedOnnxValue>
        {
            NamedOnnxValue.CreateFromTensor("input_ids", inputIdsTensor),
            NamedOnnxValue.CreateFromTensor("attention_mask", attentionMaskTensor),
            NamedOnnxValue.CreateFromTensor("token_type_ids", tokenTypeIdsTensor)
        };

        using var results = _session.Run(inputs);
        var outputTensor = results.First().AsTensor<float>();

        var embeddingSize = outputTensor.Dimensions[2];
        var embedding = new float[embeddingSize];

        for (var i = 0; i < embeddingSize; i++)
        {
            embedding[i] = outputTensor[0, 0, i];
        }

        return Normalize(embedding);
    }

    private static float[] Normalize(float[] vector)
    {
        var magnitude = Math.Sqrt(vector.Sum(x => x * x));
        if (magnitude == 0)
        {
            return vector;
        }

        return vector.Select(x => (float)(x / magnitude)).ToArray();
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            _session?.Dispose();
            _disposed = true;
        }
        GC.SuppressFinalize(this);
    }

}
