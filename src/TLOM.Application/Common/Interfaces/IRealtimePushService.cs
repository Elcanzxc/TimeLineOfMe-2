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
        Guid? actorId = null,
        string? actorUsername = null,
        string? entityType = null,
        Guid? entityId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Push a typed event to a specific user for real-time UI updates.
    /// Examples: "EntryLiked", "NewComment", "FollowChanged", "EntryUpdated", "EntryDeleted"
    /// </summary>
    Task PushEventAsync(
        Guid recipientId,
        string eventName,
        object payload,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Push a typed event to ALL connected users (for global feed updates).
    /// </summary>
    Task PushEventToAllAsync(
        string eventName,
        object payload,
        CancellationToken cancellationToken = default);
}
