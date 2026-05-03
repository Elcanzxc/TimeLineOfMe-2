using TLOM.Domain.Enums;

namespace TLOM.Domain.Entities;

/// <summary>
/// Музыкальный трек — наследник MediaItem. Данные из Spotify API.
/// </summary>
public class Music : MediaItem
{
    public string? Artist { get; set; }

    public string? Album { get; set; }

    public string? Genre { get; set; }

    /// <summary>
    /// Длительность трека в секундах.
    /// </summary>
    public int Duration { get; set; }

    /// <summary>
    /// Лейбл/издатель.
    /// </summary>
    public string? Label { get; set; }

    public int? TrackNumber { get; set; }

    public string? Language { get; set; }

    /// <summary>
    /// Тип релиза: Single, Album, EP.
    /// </summary>
    public ReleaseType ReleaseType { get; set; }
}
