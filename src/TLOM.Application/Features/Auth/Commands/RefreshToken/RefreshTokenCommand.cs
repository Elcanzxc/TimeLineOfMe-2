using MediatR;
using TLOM.Application.Features.Auth.Responses;

namespace TLOM.Application.Features.Auth.Commands.RefreshToken;

public record RefreshTokenCommand : IRequest<AuthResponse>
{
    public string AccessToken { get; init; } = string.Empty;
    public string RefreshToken { get; init; } = string.Empty;
}
