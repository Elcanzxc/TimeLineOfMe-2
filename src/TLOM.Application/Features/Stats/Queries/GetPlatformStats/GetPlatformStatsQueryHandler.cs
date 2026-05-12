using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;

namespace TLOM.Application.Features.Stats.Queries.GetPlatformStats;

public class GetPlatformStatsQueryHandler : IRequestHandler<GetPlatformStatsQuery, PlatformStatsResponse>
{
    private readonly IApplicationDbContext _context;

    public GetPlatformStatsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PlatformStatsResponse> Handle(GetPlatformStatsQuery request, CancellationToken cancellationToken)
    {
        var activeUsers = await _context.UserProfiles.CountAsync(cancellationToken);
        var mediaEntries = await _context.MediaItems.CountAsync(cancellationToken);
        var reviewsWritten = await _context.Entries.CountAsync(e => !string.IsNullOrEmpty(e.Review), cancellationToken);

        return new PlatformStatsResponse
        {
            ActiveUsers = activeUsers,
            MediaEntries = mediaEntries,
            ReviewsWritten = reviewsWritten
        };
    }
}
