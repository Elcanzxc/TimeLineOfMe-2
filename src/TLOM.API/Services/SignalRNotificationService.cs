using Microsoft.AspNetCore.SignalR;
using TLOM.API.Hubs;
using TLOM.Application.Common.Interfaces;

namespace TLOM.API.Services;

/// <summary>
/// Реализация IRealtimePushService через SignalR.
/// Отправляет уведомление конкретному пользователю через NotificationHub.
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
        CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients
            .User(recipientId.ToString())
            .SendAsync("ReceiveNotification", new
            {
                id = notificationId,
                type,
                message,
                timestamp = DateTime.UtcNow
            }, cancellationToken);
    }
}
