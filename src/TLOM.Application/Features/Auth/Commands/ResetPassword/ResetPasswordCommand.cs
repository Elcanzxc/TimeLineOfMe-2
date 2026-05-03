using MediatR;

namespace TLOM.Application.Features.Auth.Commands.ResetPassword;

public record ResetPasswordCommand : IRequest<bool>
{
    public string Email { get; init; } = string.Empty;
    public string Token { get; init; } = string.Empty;
    public string NewPassword { get; init; } = string.Empty;
}
