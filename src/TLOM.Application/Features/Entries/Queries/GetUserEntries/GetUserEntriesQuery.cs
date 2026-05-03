using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Common.Models;
using TLOM.Application.Features.Entries.Responses;
using TLOM.Domain.Constants;
using TLOM.Domain.Enums;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Entries.Queries.GetUserEntries;

public record GetUserEntriesQuery : IRequest<CursorPagedResult<EntryResponse>>
{
    public Guid UserId { get; init; }
    public string? Cursor { get; init; }
    public int PageSize { get; init; } = PaginationDefaults.DefaultCursorPageSize;
    public EntryStatus? StatusFilter { get; init; }
    public MediaType? MediaTypeFilter { get; init; }
}

public class GetUserEntriesQueryHandler : IRequestHandler<GetUserEntriesQuery, CursorPagedResult<EntryResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public GetUserEntriesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser, IMapper mapper)
    {
        _context = context;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<CursorPagedResult<EntryResponse>> Handle(GetUserEntriesQuery request, CancellationToken cancellationToken)
    {
        if (!await _context.UserProfiles.AnyAsync(u => u.Id == request.UserId, cancellationToken))
            throw new NotFoundException("UserProfile", request.UserId);

        var isOwner = _currentUser.UserProfileId == request.UserId;
        var pageSize = Math.Min(request.PageSize, PaginationDefaults.MaxCursorPageSize);

        var query = _context.Entries.AsNoTracking()
            .Where(e => e.UserId == request.UserId);

        // Приватные записи видны только владельцу
        if (!isOwner)
            query = query.Where(e => !e.IsPrivate);

        if (request.StatusFilter.HasValue)
            query = query.Where(e => e.Status == request.StatusFilter.Value);

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
