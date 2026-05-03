namespace TLOM.Domain.Entities;

/// <summary>
/// Фильм — наследник MediaItem. Данные из TMDB API.
/// </summary>
public class Movie : MediaItem
{
    public string? Director { get; set; }

    /// <summary>
    /// Длительность в минутах.
    /// </summary>
    public int? Duration { get; set; }

    /// <summary>
    /// Актёрский состав (строка через запятую).
    /// </summary>
    public string? Cast { get; set; }

    public string? Country { get; set; }

    public string? Language { get; set; }

    public string? Genre { get; set; }

    public decimal? Budget { get; set; }

    public string? TrailerUrl { get; set; }
}
