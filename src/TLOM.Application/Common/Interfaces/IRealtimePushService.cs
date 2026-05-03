namespace TLOM.Application.Common.Interfaces;

/// <summary>
/// Real-time push абстракция — реализуется через SignalR в API Layer.
/// </summary>
public interface IRealtimePushService
{
    Task PushNotificationAsync(
        Guid recipientId,
        Guid notificationId,
        string type,
        string message,
        CancellationToken cancellationToken = default);
}
