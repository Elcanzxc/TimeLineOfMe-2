using TLOM.Domain.Common;
using TLOM.Domain.Enums;

namespace TLOM.Domain.Entities;

/// <summary>
/// Базовый абстрактный класс для всего медиа-контента.
/// Общий пул: один и тот же фильм/книга/игра/трек существует в БД в единственном экземпляре.
/// Поиск по ExternalId + ExternalSource для предотвращения дублей.
/// TPT-наследование: Movie, Book, Game, Music.
/// </summary>
public abstract class MediaItem : AuditableEntity
{
    public string Title { get; set; } = string.Empty;

    public string? OriginalTitle { get; set; }

    public int ReleaseYear { get; set; }

    public string? CoverImageUrl { get; set; }

    public string? Description { get; set; }

    /// <summary>
    /// Средняя оценка всех пользователей.
    /// </summary>
    public decimal? GlobalRating { get; set; }

    /// <summary>
    /// Идентификатор из внешнего API (TMDB ID, Steam AppID, ISBN и т.д.).
    /// </summary>
    public string ExternalId { get; set; } = string.Empty;

    /// <summary>
    /// Источник данных (TMDB, GoogleBooks, Steam, Spotify).
    /// </summary>
    public ExternalSource ExternalSource { get; set; }

    /// <summary>
    /// Тип контента — используется для фильтрации без JOIN к дочерним таблицам.
    /// </summary>
    public MediaType MediaType { get; set; }

    // === Navigation Properties ===
    public ICollection<Entry> Entries { get; set; } = [];

    public ICollection<Genre> Genres { get; set; } = [];
}
