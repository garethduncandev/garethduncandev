using MediatR;

namespace Application.Diagnostics.Queries.GetDiagnostics;

public record GetDiagnosticsQuery : IRequest<DiagnosticsVm>;

public class GetDiagnosticsQueryHandler : IRequestHandler<GetDiagnosticsQuery, DiagnosticsVm>
{
    public GetDiagnosticsQueryHandler()
    {

    }

    public async Task<DiagnosticsVm> Handle(GetDiagnosticsQuery request, CancellationToken cancellationToken)
    {
        var result = new DiagnosticsVm(new DiagnosticsDto(DateTimeOffset.Now));
        return await Task.FromResult(result);
    }
}