using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Features.Social.Queries.GetFollowers;

namespace TLOM.Application.Features.Social.Queries.GetFollowing;

public record GetFollowingQuery(Guid UserProfileId) : IRequest<List<FollowUserResponse>>;

public class GetFollowingQueryHandler : IRequestHandler<GetFollowingQuery, List<FollowUserResponse>>
{
    private readonly IApplicationDbContext _context;

    public GetFollowingQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<FollowUserResponse>> Handle(GetFollowingQuery request, CancellationToken cancellationToken)
    {
        return await _context.Follows
            .Where(f => f.FollowerId == request.UserProfileId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new FollowUserResponse
            {
                UserProfileId = f.Following.Id,
                Username = f.Following.Username,
                AvatarUrl = f.Following.AvatarUrl,
                Bio = f.Following.Bio,
                FollowedAt = f.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}
