using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Features.Entries.Responses;

namespace TLOM.Application.Features.Entries.Queries.GetShowcaseTimelines;

public class ShowcaseTimelineResponse
{
    public string Username { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public List<EntryResponse> Entries { get; set; } = [];
}

public record GetShowcaseTimelinesQuery : IRequest<List<ShowcaseTimelineResponse>>;

public class GetShowcaseTimelinesQueryHandler : IRequestHandler<GetShowcaseTimelinesQuery, List<ShowcaseTimelineResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetShowcaseTimelinesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ShowcaseTimelineResponse>> Handle(GetShowcaseTimelinesQuery request, CancellationToken cancellationToken)
    {
        // 1. Найти до 5 пользователей с наибольшим количеством публичных записей
        var topUsers = await _context.Entries
            .Where(e => !e.IsPrivate)
            .GroupBy(e => e.UserId)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .Take(5)
            .ToListAsync(cancellationToken);

        var result = new List<ShowcaseTimelineResponse>();

        foreach (var userId in topUsers)
        {
            var user = await _context.UserProfiles.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            if (user == null) continue;

            var entries = await _context.Entries
                .AsNoTracking()
                .Include(e => e.User)
                .Include(e => e.MediaItem)
                .Include(e => e.Likes)
                .Include(e => e.Comments)
                .Where(e => e.UserId == userId && !e.IsPrivate)
                .OrderBy(e => e.CreatedAt) // Хронологический порядок для таймлайна
                .Take(5)
                .ToListAsync(cancellationToken);

            if (entries.Count > 0)
            {
                result.Add(new ShowcaseTimelineResponse
                {
                    Username = user.Username,
                    AvatarUrl = user.AvatarUrl,
                    Entries = _mapper.Map<List<EntryResponse>>(entries)
                });
            }
        }

        return result;
    }
}
