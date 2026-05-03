namespace TLOM.Domain.Enums;

/// <summary>
/// Типы уведомлений — определяют контекст и получателя.
/// </summary>
public enum NotificationType
{
    /// <summary>Кто-то подписался на пользователя.</summary>
    NewFollower = 0,

    /// <summary>Кто-то лайкнул запись пользователя.</summary>
    EntryLiked = 1,

    /// <summary>Кто-то оставил комментарий к записи пользователя.</summary>
    NewComment = 2,

    /// <summary>Административное уведомление (для админов).</summary>
    AdminAlert = 3,

    /// <summary>Системное уведомление (приветствие, напоминания).</summary>
    System = 4
}
