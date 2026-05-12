using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Domain.Entities;
using TLOM.Domain.Enums;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Entries.Commands.DeleteEntry;

public record DeleteEntryCommand(Guid EntryId) : IRequest<Unit>;

public class DeleteEntryCommandHandler : IRequestHandler<DeleteEntryCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _auditService;
    private readonly ICacheService _cacheService;
    private readonly INotificationService _notificationService;
    private readonly IRealtimePushService? _pushService;

    public DeleteEntryCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IAuditService auditService,
        ICacheService cacheService,
        INotificationService notificationService,
        IRealtimePushService? pushService = null)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
        _cacheService = cacheService;
        _notificationService = notificationService;
        _pushService = pushService;
    }

    public async Task<Unit> Handle(DeleteEntryCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserProfileId ?? throw new ForbiddenException();

        var entry = await _context.Entries
            .Include(e => e.MediaItem)
            .FirstOrDefaultAsync(e => e.Id == request.EntryId, cancellationToken)
            ?? throw new NotFoundException(nameof(Entry), request.EntryId);

        // Resource-based: только владелец или админ
        if (entry.UserId != userId && !_currentUser.IsAdmin)
            throw new ForbiddenException("Вы можете удалять только свои записи.");

        entry.IsDeleted = true;
        entry.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        await _auditService.LogAsync(
            _currentUser.AccountId!.Value, AuditAction.Deleted,
            nameof(Entry), entry.Id,
            oldValues: new { entry.MediaItemId, entry.Status, entry.Rating },
            cancellationToken: cancellationToken);

        await _notificationService.SendToAdminsAsync(
            "Пользователь удалил запись из таймлайна",
            actorId: userId, entityType: nameof(Entry), entityId: entry.Id,
            cancellationToken: cancellationToken);

        await _cacheService.RemoveByPatternAsync($"entries:user:{entry.UserId}*", cancellationToken);

        // Push real-time event so timeline/feed update instantly
        if (_pushService is not null)
        {
            await _pushService.PushEventAsync(userId, "EntryDeleted",
                new { entryId = request.EntryId }, cancellationToken);
        }

        return Unit.Value;
    }
}
