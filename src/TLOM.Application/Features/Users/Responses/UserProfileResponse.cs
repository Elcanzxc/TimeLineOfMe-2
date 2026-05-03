namespace TLOM.Application.Features.Users.Responses;

public class UserProfileResponse
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? Region { get; set; }
    public int FollowersCount { get; set; }
    public int FollowingCount { get; set; }
    public int EntriesCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
