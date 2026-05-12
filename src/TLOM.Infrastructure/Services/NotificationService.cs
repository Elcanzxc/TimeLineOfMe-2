using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Domain.Entities;
using TLOM.Domain.Enums;
using TLOM.Infrastructure.Persistence;

namespace TLOM.Infrastructure.Services;

/// <summary>
/// Реализация INotificationService — сохраняет в БД.
/// SignalR push добавляется через IRealtimePushService (реализуется в API Layer).
/// </summary>
public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly IRealtimePushService? _pushService;

    public NotificationService(ApplicationDbContext context, IRealtimePushService? pushService = null)
    {
        _context = context;
        _pushService = pushService;
    }

    public async Task SendAsync(
        Guid recipientId,
        NotificationType type,
        string message,
        Guid? actorId = null,
        string? entityType = null,
        Guid? entityId = null,
        CancellationToken cancellationToken = default)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            RecipientId = recipientId,
            ActorId = actorId,
            Type = type,
            Message = message,
            EntityType = entityType,
            EntityId = entityId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync(cancellationToken);

        // SignalR real-time push (если зарегистрирован)
        if (_pushService is not null)
        {
            string? actorUsername = null;
            if (actorId.HasValue)
            {
                actorUsername = await _context.UserProfiles
                    .Where(u => u.Id == actorId.Value)
                    .Select(u => u.Username)
                    .FirstOrDefaultAsync(cancellationToken);
            }
            await _pushService.PushNotificationAsync(
                recipientId, notification.Id, type.ToString(), message,
                actorId, actorUsername, entityType, entityId,
                cancellationToken);
        }
    }

    public async Task SendToAdminsAsync(
        string message,
        Guid? actorId = null,
        string? entityType = null,
        Guid? entityId = null,
        CancellationToken cancellationToken = default)
    {
        var adminProfileIds = await _context.Accounts
            .Include(a => a.Role)
            .Include(a => a.UserProfile)
            .Where(a => a.Role.Name == RoleName.Admin && a.UserProfile != null)
            .Select(a => a.UserProfile!.Id)
            .ToListAsync(cancellationToken);

        foreach (var adminId in adminProfileIds)
        {
            await SendAsync(adminId, NotificationType.System, message, actorId, entityType, entityId, cancellationToken);
        }
    }
}
