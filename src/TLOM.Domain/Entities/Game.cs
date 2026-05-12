namespace TLOM.Domain.Entities;

/// <summary>
/// Игра — наследник MediaItem. Данные из Steam API (поиск через CheapShark).
/// </summary>
public class Game : MediaItem
{
    public string? Developer { get; set; }

    public string? Publisher { get; set; }

    /// <summary>
    /// Платформы (строка через запятую: "PC, PS5, Xbox").
    /// </summary>
    public string? Platform { get; set; }

    /// <summary>
    /// Среднее время прохождения в часах.
    /// </summary>
    public double? AveragePlayTime { get; set; }

    /// <summary>
    /// Возрастной рейтинг (PEGI/ESRB).
    /// </summary>
    public string? AgeRating { get; set; }

    public string? Engine { get; set; }

    public bool IsMultiplayer { get; set; }
}
