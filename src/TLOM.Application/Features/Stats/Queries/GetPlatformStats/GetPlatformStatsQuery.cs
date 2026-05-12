using MediatR;

namespace TLOM.Application.Features.Stats.Queries.GetPlatformStats;

public class PlatformStatsResponse
{
    public int ActiveUsers { get; set; }
    public int MediaEntries { get; set; }
    public int ReviewsWritten { get; set; }
}

public class GetPlatformStatsQuery : IRequest<PlatformStatsResponse>
{
}
