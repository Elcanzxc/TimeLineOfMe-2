using MediatR;

namespace TLOM.Application.Features.Auth.Commands.ConfirmEmail;

public record ConfirmEmailCommand : IRequest<bool>
{
    public Guid UserId { get; init; }
    public string Token { get; init; } = string.Empty;
}
