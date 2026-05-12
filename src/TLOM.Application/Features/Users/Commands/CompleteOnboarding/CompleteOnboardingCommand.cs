using MediatR;
using TLOM.Application.Features.Users.Responses;

namespace TLOM.Application.Features.Users.Commands.CompleteOnboarding;

public record CompleteOnboardingCommand : IRequest<UserProfileResponse>
{
    public string Username { get; init; } = string.Empty;
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public DateTime? DateOfBirth { get; init; }
    public string? Bio { get; init; }
    public string? AvatarUrl { get; init; }
    public string? City { get; init; }
    public string? Country { get; init; }
}
