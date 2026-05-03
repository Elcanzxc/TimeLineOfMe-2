using TLOM.Domain.Enums;

namespace TLOM.Application.Features.Entries.Responses;

/// <summary>
/// Response DTO для Entry — возвращается клиенту.
/// </summary>
public class EntryResponse
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid MediaItemId { get; set; }

    public string MediaItemTitle { get; set; } = string.Empty;

    public string? MediaItemCoverImageUrl { get; set; }

    public MediaType MediaType { get; set; }

    public EntryStatus Status { get; set; }

    public int? Rating { get; set; }

    public string? Review { get; set; }

    public int? TimeSpent { get; set; }

    public bool IsPrivate { get; set; }

    public bool IsFavorite { get; set; }

    public int LikesCount { get; set; }

    public int CommentsCount { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Хронология смен статусов.
    /// </summary>
    public List<EntryEventResponse> Events { get; set; } = [];
}
