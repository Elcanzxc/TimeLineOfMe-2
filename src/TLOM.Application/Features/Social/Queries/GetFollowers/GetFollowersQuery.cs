using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;

namespace TLOM.Application.Features.Social.Queries.GetFollowers;

public record FollowUserResponse
{
    public Guid UserProfileId { get; init; }
    public string Username { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }
    public string? Bio { get; init; }
    public DateTime FollowedAt { get; init; }
}

public record GetFollowersQuery(Guid UserProfileId) : IRequest<List<FollowUserResponse>>;

public class GetFollowersQueryHandler : IRequestHandler<GetFollowersQuery, List<FollowUserResponse>>
{
    private readonly IApplicationDbContext _context;

    public GetFollowersQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<FollowUserResponse>> Handle(GetFollowersQuery request, CancellationToken cancellationToken)
    {
        return await _context.Follows
            .Where(f => f.FollowingId == request.UserProfileId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new FollowUserResponse
            {
                UserProfileId = f.Follower.Id,
                Username = f.Follower.Username,
                AvatarUrl = f.Follower.AvatarUrl,
                Bio = f.Follower.Bio,
                FollowedAt = f.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}
