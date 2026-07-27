using System.Text.Json.Serialization;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Serialization.SystemTextJson;
using GarethDuncanDev.Search.Services;

var builder = WebApplication.CreateSlimBuilder(args);

if (Environment.GetEnvironmentVariable("AWS_LAMBDA_FUNCTION_NAME") is not null)
{
    builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi,
        new SourceGeneratorLambdaJsonSerializer<AppJsonSerializerContext>());
}

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});

builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .SetIsOriginAllowedToAllowWildcardSubdomains()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

var embeddingsDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Embeddings");
var modelPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "EmbeddingModels", "all-MiniLM-L6-v2", "model.onnx");

var searchApi = app.MapGroup("/search");
searchApi.MapGet("/", (string query, string? type) =>
{
    var searchService = SearchServiceFactory.GetOrCreate(embeddingsDir, modelPath);
    var results = searchService.Search(query, type);

    return results.Select(r => new SearchResult(r.Chunk.Slug, r.Chunk.Title, r.Chunk.Description, r.Chunk.Date, r.Chunk.Type, (int)(r.Similarity * 100))).ToArray();
})
.WithName("Search");

app.MapHealthChecks("/healthcheck");

app.Run();

public record Todo(int Id, string? Title, DateOnly? DueBy = null, bool IsComplete = false);

public record SearchResult(string? Slug, string? Title, string? Description, string? Date, string Type, int Similarity);

[JsonSerializable(typeof(SearchResult[]))]
[JsonSerializable(typeof(APIGatewayHttpApiV2ProxyRequest))]
[JsonSerializable(typeof(APIGatewayHttpApiV2ProxyResponse))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{

}
