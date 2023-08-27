namespace Application.Diagnostics.Queries.GetDiagnostics;

public record DiagnosticsDto(DateTimeOffset ApiDateTime, string Environment, string EnvironmentDisplayName);