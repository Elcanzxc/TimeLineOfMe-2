using MediatR;

namespace TLOM.Application.Features.Auth.Commands.ForgotPassword;

public record ForgotPasswordCommand : IRequest<bool>
{
    public string Email { get; init; } = string.Empty;
}
