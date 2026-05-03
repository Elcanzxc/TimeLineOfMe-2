using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Common.Models;
using TLOM.Application.Features.Notifications.Responses;
using TLOM.Domain.Constants;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Notifications.Queries.GetNotifications;

public record GetNotificationsQuery : IRequest<CursorPagedResult<NotificationResponse>>
{
    public string? Cursor { get; init; }
    public int PageSize { get; init; } = PaginationDefaults.DefaultCursorPageSize;
    public bool UnreadOnly { get; init; }
}

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, CursorPagedResult<NotificationResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetNotificationsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CursorPagedResult<NotificationResponse>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserProfileId ?? throw new ForbiddenException();
        var pageSize = Math.Min(request.PageSize, PaginationDefaults.MaxCursorPageSize);

        var query = _context.Notifications
            .AsNoTracking()
            .Where(n => n.RecipientId == userId);

        if (request.UnreadOnly)
            query = query.Where(n => !n.IsRead);

        if (!string.IsNullOrEmpty(request.Cursor) && DateTime.TryParse(request.Cursor, out var cursorDate))
            query = query.Where(n => n.CreatedAt < cursorDate);

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(pageSize + 1)
            .Include(n => n.Actor)
            .Select(n => new NotificationResponse
            {
                Id = n.Id,
                Type = n.Type,
                Message = n.Message,
                ActorId = n.ActorId,
                ActorUsername = n.Actor != null ? n.Actor.Username : null,
                EntityType = n.EntityType,
                EntityId = n.EntityId,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var hasMore = items.Count > pageSize;
        if (hasMore) items.RemoveAt(items.Count - 1);

        var nextCursor = hasMore && items.Count > 0 ? items[^1].CreatedAt.ToString("O") : null;

        return new CursorPagedResult<NotificationResponse>(items, nextCursor, hasMore);
    }
}
