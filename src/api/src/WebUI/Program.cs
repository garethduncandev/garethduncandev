using Application.Diagnostics.Queries.GetDiagnostics;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Application;
using Asp.Versioning;
using Asp.Versioning.Conventions;
using WebUI.Extensions;


var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddApplicationServices();

// Add services to the container.
builder.Services.AddControllers();

// Add AWS Lambda support. When application is run in Lambda Kestrel is swapped out as the web server with Amazon.Lambda.AspNetCoreServer. This
// package will act as the webserver translating request and responses between the Lambda event source and ASP.NET Core.
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);

builder.Services.SetupApiVersioning();

var apiVersions = new List<ApiVersion> {new(1), new(2)};

builder.Services.AddOpenApiDocuments(apiVersions.Select(x => x.MajorVersion ?? 0));

const string corsPolicy = "CorsPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: corsPolicy,
        policy =>
        {
            policy.WithOrigins(
                "http://localhost:5173",
                "https://garethduncan.dev",
                "https://*.garethduncan.dev");
            policy.AllowAnyHeader();
        });
});

var app = builder.Build();

app.UsePathBase(new PathString("/api"));

var versionSet = app.NewApiVersionSet()
    .HasApiVersions(apiVersions)
    .ReportApiVersions()
    .Build();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.UseHttpsRedirection();

app.UseOpenApi();
app.UseSwaggerUi3();


app.UseCors(corsPolicy);

app.MapGet("/",
        () => "Gareth Duncan | Developer")
    .WithApiVersionSet(versionSet)
    .MapToApiVersion(1)
    .WithTags("hello")
    .Produces<string>();

app.MapGet("/diagnostics",
        async ([FromServices] IMediator mediator) => await mediator.Send(new GetDiagnosticsQuery()))
    .WithApiVersionSet(versionSet)
    .MapToApiVersion(1)
    .WithTags("diagnostics")
    .Produces<DiagnosticsVm>();

app.Run();
