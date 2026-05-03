using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Stats.Queries.GetUserStats;

public record GetUserStatsQuery(Guid? UserId = null) : IRequest<UserStatsResponse>;

public class UserStatsResponse
{
    public int TotalEntries { get; set; }
    public int CompletedEntries { get; set; }
    public int InProgressEntries { get; set; }
    public int PlannedEntries { get; set; }
    public int DroppedEntries { get; set; }
    public int TotalMovies { get; set; }
    public int TotalBooks { get; set; }
    public int TotalGames { get; set; }
    public int TotalMusic { get; set; }
    public int FollowersCount { get; set; }
    public int FollowingCount { get; set; }
    public double? AverageRating { get; set; }
    public int TotalTimeSpentMinutes { get; set; }
}

public class GetUserStatsQueryHandler : IRequestHandler<GetUserStatsQuery, UserStatsResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetUserStatsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<UserStatsResponse> Handle(GetUserStatsQuery request, CancellationToken cancellationToken)
    {
        var userId = request.UserId ?? _currentUser.UserProfileId
            ?? throw new ForbiddenException();

        var entries = _context.Entries.AsNoTracking()
            .Where(e => e.UserId == userId);

        return new UserStatsResponse
        {
            TotalEntries = await entries.CountAsync(cancellationToken),
            CompletedEntries = await entries.CountAsync(e => e.Status == Domain.Enums.EntryStatus.Completed, cancellationToken),
            InProgressEntries = await entries.CountAsync(e => e.Status == Domain.Enums.EntryStatus.InProgress, cancellationToken),
            PlannedEntries = await entries.CountAsync(e => e.Status == Domain.Enums.EntryStatus.Planned, cancellationToken),
            DroppedEntries = await entries.CountAsync(e => e.Status == Domain.Enums.EntryStatus.Dropped, cancellationToken),
            TotalMovies = await entries.CountAsync(e => e.MediaItem.MediaType == Domain.Enums.MediaType.Movie, cancellationToken),
            TotalBooks = await entries.CountAsync(e => e.MediaItem.MediaType == Domain.Enums.MediaType.Book, cancellationToken),
            TotalGames = await entries.CountAsync(e => e.MediaItem.MediaType == Domain.Enums.MediaType.Game, cancellationToken),
            TotalMusic = await entries.CountAsync(e => e.MediaItem.MediaType == Domain.Enums.MediaType.Music, cancellationToken),
            FollowersCount = await _context.Follows.CountAsync(f => f.FollowingId == userId, cancellationToken),
            FollowingCount = await _context.Follows.CountAsync(f => f.FollowerId == userId, cancellationToken),
            AverageRating = await entries.Where(e => e.Rating.HasValue).AverageAsync(e => (double?)e.Rating, cancellationToken),
            TotalTimeSpentMinutes = await entries.Where(e => e.TimeSpent.HasValue).SumAsync(e => e.TimeSpent!.Value, cancellationToken)
        };
    }
}
