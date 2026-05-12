using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;

namespace TLOM.Application.Features.Users.Queries.SearchUsers;

public class SearchUsersQueryHandler : IRequestHandler<SearchUsersQuery, List<UserSearchResult>>
{
    private readonly IApplicationDbContext _context;

    public SearchUsersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserSearchResult>> Handle(SearchUsersQuery request, CancellationToken cancellationToken)
    {
        var query = request.Query.Trim().ToLower();

        var users = await _context.UserProfiles
            .Where(p => p.IsProfileCompleted &&
                (p.Username.ToLower().Contains(query) ||
                 (p.FirstName != null && p.FirstName.ToLower().Contains(query)) ||
                 (p.LastName != null && p.LastName.ToLower().Contains(query))))
            .Take(20)
            .Select(p => new UserSearchResult
            {
                UserProfileId = p.Id,
                Username = p.Username,
                FirstName = p.FirstName,
                LastName = p.LastName,
                AvatarUrl = p.AvatarUrl,
                Bio = p.Bio
            })
            .ToListAsync(cancellationToken);

        return users;
    }
}
