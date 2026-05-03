using MediatR;
using TLOM.Application.Features.Users.Responses;

namespace TLOM.Application.Features.Users.Commands.UpdateProfile;

public record UpdateProfileCommand : IRequest<UserProfileResponse>
{
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? Bio { get; init; }
    public DateTime? DateOfBirth { get; init; }
    public string? City { get; init; }
    public string? Country { get; init; }
    public string? Region { get; init; }
    public string? AvatarUrl { get; init; }
}
