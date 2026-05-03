using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using TLOM.Application.Common.Interfaces;

namespace TLOM.Infrastructure.Services;

/// <summary>
/// Redis кэш через IDistributedCache (StackExchange.Redis под капотом).
/// </summary>
public class RedisCacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public RedisCacheService(IDistributedCache cache)
    {
        _cache = cache;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) where T : class
    {
        var data = await _cache.GetStringAsync(key, cancellationToken);
        return data is null ? null : JsonSerializer.Deserialize<T>(data, JsonOptions);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default) where T : class
    {
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiration ?? TimeSpan.FromMinutes(30)
        };

        var json = JsonSerializer.Serialize(value, JsonOptions);
        await _cache.SetStringAsync(key, json, options, cancellationToken);
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        await _cache.RemoveAsync(key, cancellationToken);
    }

    public Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default)
    {
        // IDistributedCache не поддерживает паттерн-удаление.
        // В production используем StackExchange.Redis напрямую через IConnectionMultiplexer.
        // Для MVP — используем конкретные ключи через RemoveAsync.
        return Task.CompletedTask;
    }
}
