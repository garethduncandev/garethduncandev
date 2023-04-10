namespace WebUI.Extensions;

public static class OpenApiServicesConfiguration
{
    public static void AddOpenApiDocuments(this IServiceCollection services, IEnumerable<int> versions)
    {
        if (services == null) throw new ArgumentNullException(nameof(services));

        foreach (var apiVersion in versions)
        {
            services.AddSwaggerDocument(configure =>
            {
                configure.Title = $"garethduncan.dev v{apiVersion}";
                configure.Version = $"{apiVersion}";
                configure.DocumentName = $"v{apiVersion}";
                configure.ApiGroupNames = new[] { $"v{apiVersion}" };
            });
        }
    }
}