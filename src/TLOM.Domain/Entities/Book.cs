namespace TLOM.Domain.Entities;

/// <summary>
/// Книга — наследник MediaItem. Данные из Google Books API.
/// </summary>
public class Book : MediaItem
{
    public string? Author { get; set; }

    public int? PageCount { get; set; }

    public string? Genre { get; set; }

    public string? Publisher { get; set; }

    /// <summary>
    /// Международный стандартный книжный номер.
    /// </summary>
    public string? ISBN { get; set; }

    public string? Language { get; set; }

    /// <summary>
    /// Серия/цикл книг (например, «Дюна»).
    /// </summary>
    public string? Series { get; set; }

    /// <summary>
    /// Порядковый номер в серии.
    /// </summary>
    public int? SeriesOrder { get; set; }
}
