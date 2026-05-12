using Microsoft.AspNetCore.SignalR;
using TLOM.API.Hubs;
using TLOM.Application.Common.Interfaces;

namespace TLOM.API.Services;

/// <summary>
/// Реализация IRealtimePushService через SignalR.
/// Отправляет уведомления и типизированные события клиентам.
/// </summary>
public class SignalRNotificationService : IRealtimePushService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public SignalRNotificationService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task PushNotificationAsync(
        Guid recipientId,
        Guid notificationId,
        string type,
        string message,
        Guid? actorId = null,
        string? actorUsername = null,
        string? entityType = null,
        Guid? entityId = null,
        CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients
            .User(recipientId.ToString())
            .SendAsync("ReceiveNotification", new
            {
                id = notificationId,
                type,
                message,
                actorId,
                actorUsername,
                entityType,
                entityId,
                isRead = false,
                createdAt = DateTime.UtcNow.ToString("O")
            }, cancellationToken);
    }

    public async Task PushEventAsync(
        Guid recipientId,
        string eventName,
        object payload,
        CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients
            .User(recipientId.ToString())
            .SendAsync(eventName, payload, cancellationToken);
    }

    public async Task PushEventToAllAsync(
        string eventName,
        object payload,
        CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients
            .All
            .SendAsync(eventName, payload, cancellationToken);
    }
}
