using TLOM.Domain.Common;

namespace TLOM.Domain.Entities;

/// <summary>
/// Жанр для медиа-контента. Связан M:M с MediaItem.
/// </summary>
public class Genre : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    // === Navigation Properties ===
    public ICollection<MediaItem> MediaItems { get; set; } = [];
}
