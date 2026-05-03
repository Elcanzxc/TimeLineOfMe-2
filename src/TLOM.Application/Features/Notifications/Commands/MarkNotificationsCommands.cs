using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Notifications.Commands;

public record MarkNotificationAsReadCommand(Guid NotificationId) : IRequest<Unit>;

public class MarkNotificationAsReadHandler : IRequestHandler<MarkNotificationAsReadCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public MarkNotificationAsReadHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserProfileId ?? throw new ForbiddenException();

        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == request.NotificationId && n.RecipientId == userId, cancellationToken)
            ?? throw new NotFoundException("Notification", request.NotificationId);

        notification.IsRead = true;
        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}

public record MarkAllNotificationsAsReadCommand : IRequest<Unit>;

public class MarkAllNotificationsAsReadHandler : IRequestHandler<MarkAllNotificationsAsReadCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public MarkAllNotificationsAsReadHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(MarkAllNotificationsAsReadCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserProfileId ?? throw new ForbiddenException();

        await _context.Notifications
            .Where(n => n.RecipientId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), cancellationToken);

        return Unit.Value;
    }
}
