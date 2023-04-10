using Asp.Versioning;

namespace WebUI.Extensions;

public static class ApiVersioningExtensions
{
    public static void SetupApiVersioning(this IServiceCollection services)
    {
        const int defaultApiVersion = 1;

        services.AddEndpointsApiExplorer();

        services.AddApiVersioning(config =>
            {
                config.DefaultApiVersion = new ApiVersion(defaultApiVersion);
                config.AssumeDefaultVersionWhenUnspecified = true;
                config.ReportApiVersions = true;
                config.ApiVersionReader = ApiVersionReader.Combine(new UrlSegmentApiVersionReader(),
                    new HeaderApiVersionReader("api-version"),
                    new QueryStringApiVersionReader("api-version"),
                    new MediaTypeApiVersionReader("api-version"));
            })
            .AddApiExplorer(options =>
            {
                options.GroupNameFormat = "'v'VVV";
                options.AssumeDefaultVersionWhenUnspecified = true;
                options.DefaultApiVersion = new ApiVersion(defaultApiVersion, 0);
                options.AddApiVersionParametersWhenVersionNeutral = true;
                options.SubstituteApiVersionInUrl = true;
            });
    }
}