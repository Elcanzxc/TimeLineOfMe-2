namespace TLOM.Application.Common.Interfaces;

/// <summary>
/// Кэширование — реализуется через Redis (AWS ElastiCache) в Infrastructure.
/// </summary>
public interface ICacheService
{
    /// <summary>
    /// Получить значение из кэша. Null если не найдено или истёк TTL.
    /// </summary>
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) where T : class;

    /// <summary>
    /// Записать значение в кэш с TTL.
    /// </summary>
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default) where T : class;

    /// <summary>
    /// Удалить ключ из кэша (инвалидация).
    /// </summary>
    Task RemoveAsync(string key, CancellationToken cancellationToken = default);

    /// <summary>
    /// Удалить все ключи по паттерну (например, "entries:user:*").
    /// </summary>
    Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default);
}
