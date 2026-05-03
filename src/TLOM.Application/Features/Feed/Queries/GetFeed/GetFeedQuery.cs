using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Common.Models;
using TLOM.Application.Features.Entries.Responses;
using TLOM.Domain.Constants;
using TLOM.Domain.Enums;
using TLOM.Domain.Exceptions;
using AutoMapper;

namespace TLOM.Application.Features.Feed.Queries.GetFeed;

/// <summary>
/// Лента подписок — записи пользователей, на которых подписан текущий юзер.
/// Cursor-based пагинация.
/// </summary>
public record GetFeedQuery : IRequest<CursorPagedResult<EntryResponse>>
{
    public string? Cursor { get; init; }
    public int PageSize { get; init; } = PaginationDefaults.DefaultCursorPageSize;
    public MediaType? MediaTypeFilter { get; init; }
}

public class GetFeedQueryHandler : IRequestHandler<GetFeedQuery, CursorPagedResult<EntryResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public GetFeedQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser, IMapper mapper)
    {
        _context = context;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<CursorPagedResult<EntryResponse>> Handle(GetFeedQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserProfileId ?? throw new ForbiddenException();
        var pageSize = Math.Min(request.PageSize, PaginationDefaults.MaxCursorPageSize);

        // ID пользователей, на которых подписан текущий юзер
        var followingIds = await _context.Follows
            .Where(f => f.FollowerId == userId)
            .Select(f => f.FollowingId)
            .ToListAsync(cancellationToken);

        var query = _context.Entries
            .AsNoTracking()
            .Where(e => followingIds.Contains(e.UserId) && !e.IsPrivate);

        if (request.MediaTypeFilter.HasValue)
            query = query.Where(e => e.MediaItem.MediaType == request.MediaTypeFilter.Value);

        if (!string.IsNullOrEmpty(request.Cursor) && DateTime.TryParse(request.Cursor, out var cursorDate))
            query = query.Where(e => e.CreatedAt < cursorDate);

        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Take(pageSize + 1)
            .Include(e => e.MediaItem)
            .Include(e => e.Events.OrderBy(ev => ev.DateTime))
            .Include(e => e.Likes)
            .Include(e => e.Comments)
            .ToListAsync(cancellationToken);

        var hasMore = items.Count > pageSize;
        if (hasMore) items.RemoveAt(items.Count - 1);

        var mapped = _mapper.Map<List<EntryResponse>>(items);
        var nextCursor = hasMore && items.Count > 0 ? items[^1].CreatedAt.ToString("O") : null;

        return new CursorPagedResult<EntryResponse>(mapped, nextCursor, hasMore);
    }
}
