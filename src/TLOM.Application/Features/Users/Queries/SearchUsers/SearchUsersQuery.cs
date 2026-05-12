using MediatR;

namespace TLOM.Application.Features.Users.Queries.SearchUsers;

public record SearchUsersQuery : IRequest<List<UserSearchResult>>
{
    public string Query { get; init; } = string.Empty;
}

public class UserSearchResult
{
    public Guid UserProfileId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
}
