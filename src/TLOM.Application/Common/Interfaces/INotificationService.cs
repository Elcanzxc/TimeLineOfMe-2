using TLOM.Domain.Enums;

namespace TLOM.Application.Common.Interfaces;

/// <summary>
/// Сервис уведомлений — создаёт Notification в БД и отправляет push через SignalR.
/// </summary>
public interface INotificationService
{
    /// <summary>
    /// Отправить уведомление пользователю (сохранение в БД + SignalR push).
    /// </summary>
    Task SendAsync(
        Guid recipientId,
        NotificationType type,
        string message,
        Guid? actorId = null,
        string? entityType = null,
        Guid? entityId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Отправить уведомление всем администраторам.
    /// </summary>
    Task SendToAdminsAsync(
        string message,
        Guid? actorId = null,
        string? entityType = null,
        Guid? entityId = null,
        CancellationToken cancellationToken = default);
}
