using MediatR;
using TLOM.Application.Features.Auth.Responses;

namespace TLOM.Application.Features.Auth.Commands.Register;

public record RegisterCommand : IRequest<RegisterResponse>
{
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
}
