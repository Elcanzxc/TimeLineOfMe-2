using TLOM.Domain.Enums;

namespace TLOM.Application.Features.Notifications.Responses;

public class NotificationResponse
{
    public Guid Id { get; set; }
    public NotificationType Type { get; set; }
    public string Message { get; set; } = string.Empty;
    public Guid? ActorId { get; set; }
    public string? ActorUsername { get; set; }
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
