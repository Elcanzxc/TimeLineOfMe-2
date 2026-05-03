using MediatR;
using TLOM.Application.Features.Auth.Responses;

namespace TLOM.Application.Features.Auth.Commands.Login;

public record LoginCommand : IRequest<AuthResponse>
{
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
}
