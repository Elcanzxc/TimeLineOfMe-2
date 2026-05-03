namespace TLOM.Application.Common.Models;

/// <summary>
/// Cursor-based пагинация — для таймлайна, лент и уведомлений.
/// Эффективнее offset при большом объёме данных и real-time вставках.
/// </summary>
public class CursorPagedResult<T>
{
    /// <summary>
    /// Элементы текущей страницы.
    /// </summary>
    public IReadOnlyList<T> Items { get; }

    /// <summary>
    /// Курсор для следующей страницы (null если последняя).
    /// </summary>
    public string? NextCursor { get; }

    /// <summary>
    /// Есть ли ещё данные после текущей страницы.
    /// </summary>
    public bool HasMore { get; }

    public CursorPagedResult(IReadOnlyList<T> items, string? nextCursor, bool hasMore)
    {
        Items = items;
        NextCursor = nextCursor;
        HasMore = hasMore;
    }
}
