using MediatR;
using TLOM.Application.Features.Auth.Responses;

namespace TLOM.Application.Features.Auth.Commands.GoogleLogin;

public record GoogleLoginCommand : IRequest<AuthResponse>
{
    public string IdToken { get; init; } = string.Empty;
}
