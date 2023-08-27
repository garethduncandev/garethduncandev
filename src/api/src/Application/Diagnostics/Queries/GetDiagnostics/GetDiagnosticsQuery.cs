using MediatR;
using Microsoft.Extensions.Configuration;

namespace Application.Diagnostics.Queries.GetDiagnostics;

public record GetDiagnosticsQuery : IRequest<DiagnosticsVm>;

public class GetDiagnosticsQueryHandler : IRequestHandler<GetDiagnosticsQuery, DiagnosticsVm>
{
    private readonly IConfiguration _configuration;

    public GetDiagnosticsQueryHandler(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<DiagnosticsVm> Handle(GetDiagnosticsQuery request, CancellationToken cancellationToken)
    {
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "error: not found";
        var environmentDisplayName = _configuration.GetValue<string>("ApplicationConfiguration:EnvironmentDisplayName");
        var result = new DiagnosticsVm(new DiagnosticsDto(DateTimeOffset.Now, environment, environmentDisplayName));
        return await Task.FromResult(result);
    }
}