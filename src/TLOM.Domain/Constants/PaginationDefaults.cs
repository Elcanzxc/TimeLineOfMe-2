namespace TLOM.Domain.Constants;

/// <summary>
/// Константы пагинации — размеры страниц по умолчанию и максимальные значения.
/// </summary>
public static class PaginationDefaults
{
    // === Cursor-based (таймлайн, лента подписок, уведомления) ===
    public const int DefaultCursorPageSize = 20;
    public const int MaxCursorPageSize = 50;

    // === Offset-based (админ-панель, простые списки) ===
    public const int DefaultOffsetPageSize = 20;
    public const int MaxOffsetPageSize = 100;
    public const int DefaultPage = 1;
}
