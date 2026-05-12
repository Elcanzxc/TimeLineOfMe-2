using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TLOM.Application.Common.Interfaces;
using TLOM.Domain.Enums;

namespace TLOM.Infrastructure.Services;

/// <summary>
/// Реальная реализация поиска медиа-контента через внешние API:
/// - Фильмы: TMDB API
/// - Книги: Google Books API
/// - Игры: Steam / CheapShark API
/// - Музыка: Spotify API
/// </summary>
public class ExternalMediaSearchService : IExternalMediaSearchService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ExternalMediaSearchService> _logger;

    public ExternalMediaSearchService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<ExternalMediaSearchService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<List<ExternalMediaResult>> SearchAsync(string query, MediaType mediaType, CancellationToken cancellationToken = default)
    {
        return mediaType switch
        {
            MediaType.Movie => await SearchTmdbAsync(query, cancellationToken),
            MediaType.Book => await SearchGoogleBooksAsync(query, cancellationToken),
            MediaType.Game => await SearchSteamAsync(query, cancellationToken),
            MediaType.Music => await SearchDeezerAsync(query, cancellationToken),
            _ => []
        };
    }

    public async Task<ExternalMediaResult?> GetByExternalIdAsync(string externalId, ExternalSource source, CancellationToken cancellationToken = default)
    {
        return source switch
        {
            ExternalSource.TMDB => await GetTmdbByIdAsync(externalId, cancellationToken),
            ExternalSource.GoogleBooks => await GetGoogleBookByIdAsync(externalId, cancellationToken),
            ExternalSource.Steam => await GetSteamByIdAsync(externalId, cancellationToken),
            ExternalSource.Deezer => await GetDeezerByIdAsync(externalId, cancellationToken),
            _ => null
        };
    }

    // ==================== TMDB (Фильмы) ====================

    private async Task<List<ExternalMediaResult>> SearchTmdbAsync(string query, CancellationToken ct)
    {
        var token = _configuration["ExternalApis:Tmdb:BearerToken"];
        if (string.IsNullOrEmpty(token)) return [];

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var url = $"https://api.themoviedb.org/3/search/movie?query={Uri.EscapeDataString(query)}&language=ru-RU&page=1";
        var response = await client.GetAsync(url, ct);
        if (!response.IsSuccessStatusCode) return [];

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(ct);
        var results = new List<ExternalMediaResult>();

        foreach (var item in json.GetProperty("results").EnumerateArray().Take(15))
        {
            var posterPath = item.TryGetProperty("poster_path", out var p) && p.ValueKind != JsonValueKind.Null
                ? $"https://image.tmdb.org/t/p/w500{p.GetString()}" : null;

            results.Add(new ExternalMediaResult
            {
                ExternalId = item.GetProperty("id").GetInt32().ToString(),
                Source = ExternalSource.TMDB,
                MediaType = MediaType.Movie,
                Title = item.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "",
                OriginalTitle = item.TryGetProperty("original_title", out var ot) ? ot.GetString() : null,
                ReleaseYear = TryParseYear(item, "release_date"),
                CoverImageUrl = posterPath,
                Description = item.TryGetProperty("overview", out var o) ? o.GetString() : null
            });
        }
        return results;
    }

    private async Task<ExternalMediaResult?> GetTmdbByIdAsync(string externalId, CancellationToken ct)
    {
        var token = _configuration["ExternalApis:Tmdb:BearerToken"];
        if (string.IsNullOrEmpty(token)) return null;

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var url = $"https://api.themoviedb.org/3/movie/{externalId}?language=ru-RU&append_to_response=credits";
        var response = await client.GetAsync(url, ct);
        if (!response.IsSuccessStatusCode) return null;

        var m = await response.Content.ReadFromJsonAsync<JsonElement>(ct);
        var posterPath = m.TryGetProperty("poster_path", out var p) && p.ValueKind != JsonValueKind.Null
            ? $"https://image.tmdb.org/t/p/w500{p.GetString()}" : null;

        // Получаем режиссёра из credits
        string? director = null;
        if (m.TryGetProperty("credits", out var credits) && credits.TryGetProperty("crew", out var crew))
        {
            foreach (var c in crew.EnumerateArray())
            {
                if (c.TryGetProperty("job", out var job) && job.GetString() == "Director")
                {
                    director = c.TryGetProperty("name", out var n) ? n.GetString() : null;
                    break;
                }
            }
        }

        // Жанры
        var genres = m.TryGetProperty("genres", out var g)
            ? string.Join(", ", g.EnumerateArray().Select(x => x.GetProperty("name").GetString()))
            : null;

        return new ExternalMediaResult
        {
            ExternalId = externalId,
            Source = ExternalSource.TMDB,
            MediaType = MediaType.Movie,
            Title = m.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "",
            OriginalTitle = m.TryGetProperty("original_title", out var ot) ? ot.GetString() : null,
            ReleaseYear = TryParseYear(m, "release_date"),
            CoverImageUrl = posterPath,
            Description = m.TryGetProperty("overview", out var o) ? o.GetString() : null,
            Director = director,
            Genre = genres,
            DurationMinutes = m.TryGetProperty("runtime", out var r) ? r.GetInt32() : null
        };
    }

    // ==================== Google Books (Книги) ====================

    private async Task<List<ExternalMediaResult>> SearchGoogleBooksAsync(string query, CancellationToken ct)
    {
        var apiKey = _configuration["ExternalApis:GoogleBooks:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("Google Books API key is not configured");
            return [];
        }

        try
        {
            var client = _httpClientFactory.CreateClient();
            var url = $"https://www.googleapis.com/books/v1/volumes?q={Uri.EscapeDataString(query)}&maxResults=15&key={apiKey}";
            _logger.LogInformation("Searching Google Books for: {Query}", query);
            var response = await client.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("Google Books API returned {Status}: {Body}", response.StatusCode, body);
                return [];
            }

            var json = await response.Content.ReadFromJsonAsync<JsonElement>(ct);
            if (!json.TryGetProperty("items", out var items)) return [];

            var results = new List<ExternalMediaResult>();
            foreach (var item in items.EnumerateArray().Take(15))
            {
                var vol = item.GetProperty("volumeInfo");
                var imageLinks = vol.TryGetProperty("imageLinks", out var il)
                    ? (il.TryGetProperty("thumbnail", out var th) ? th.GetString() : null)
                    : null;

                results.Add(new ExternalMediaResult
                {
                    ExternalId = item.GetProperty("id").GetString() ?? "",
                    Source = ExternalSource.GoogleBooks,
                    MediaType = MediaType.Book,
                    Title = vol.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "",
                    ReleaseYear = TryParseYear(vol, "publishedDate"),
                    CoverImageUrl = imageLinks?.Replace("http://", "https://"),
                    Description = vol.TryGetProperty("description", out var d) ? d.GetString() : null,
                    Author = vol.TryGetProperty("authors", out var a) ? string.Join(", ", a.EnumerateArray().Select(x => x.GetString())) : null,
                    PageCount = vol.TryGetProperty("pageCount", out var pc) ? pc.GetInt32() : null
                });
            }
            _logger.LogInformation("Google Books returned {Count} results for '{Query}'", results.Count, query);
            return results;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching Google Books for '{Query}'", query);
            return [];
        }
    }

    private async Task<ExternalMediaResult?> GetGoogleBookByIdAsync(string externalId, CancellationToken ct)
    {
        var apiKey = _configuration["ExternalApis:GoogleBooks:ApiKey"];
        if (string.IsNullOrEmpty(apiKey)) return null;

        var client = _httpClientFactory.CreateClient();
        var url = $"https://www.googleapis.com/books/v1/volumes/{externalId}?key={apiKey}";
        var response = await client.GetAsync(url, ct);
        if (!response.IsSuccessStatusCode) return null;

        var item = await response.Content.ReadFromJsonAsync<JsonElement>(ct);
        var vol = item.GetProperty("volumeInfo");
        var imageLinks = vol.TryGetProperty("imageLinks", out var il)
            ? (il.TryGetProperty("large", out var lg) ? lg.GetString()
                : il.TryGetProperty("thumbnail", out var th) ? th.GetString() : null)
            : null;

        return new ExternalMediaResult
        {
            ExternalId = externalId,
            Source = ExternalSource.GoogleBooks,
            MediaType = MediaType.Book,
            Title = vol.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "",
            ReleaseYear = TryParseYear(vol, "publishedDate"),
            CoverImageUrl = imageLinks?.Replace("http://", "https://"),
            Description = vol.TryGetProperty("description", out var d) ? d.GetString() : null,
            Author = vol.TryGetProperty("authors", out var a) ? string.Join(", ", a.EnumerateArray().Select(x => x.GetString())) : null,
            Genre = vol.TryGetProperty("categories", out var c) ? string.Join(", ", c.EnumerateArray().Select(x => x.GetString())) : null,
            PageCount = vol.TryGetProperty("pageCount", out var pc) ? pc.GetInt32() : null
        };
    }

    // ==================== Steam / CheapShark (Игры) ====================

    private async Task<List<ExternalMediaResult>> SearchSteamAsync(string query, CancellationToken ct)
    {
        var client = _httpClientFactory.CreateClient();
        // Добавляем обязательный User-Agent для CheapShark
        client.DefaultRequestHeaders.UserAgent.ParseAdd("TLOM/1.0");

        var url = $"https://www.cheapshark.com/api/1.0/games?title={Uri.EscapeDataString(query)}&limit=15";
        var response = await client.GetAsync(url, ct);
        if (!response.IsSuccessStatusCode) return [];

        var list = new List<ExternalMediaResult>();
        try 
        {
            var results = await response.Content.ReadFromJsonAsync<JsonElement>(ct);
            foreach (var item in results.EnumerateArray())
            {
                // Steam App ID (может быть null, если игра не из Steam)
                var steamAppId = item.TryGetProperty("steamAppID", out var sid) && sid.ValueKind != JsonValueKind.Null ? sid.GetString() : null;
                
                // Нам нужны только игры со Steam App ID для последующего получения полных данных
                if (string.IsNullOrEmpty(steamAppId)) continue;

                list.Add(new ExternalMediaResult
                {
                    ExternalId = steamAppId,
                    Source = ExternalSource.Steam,
                    MediaType = MediaType.Game,
                    Title = item.TryGetProperty("external", out var n) ? n.GetString() ?? "" : "",
                    CoverImageUrl = item.TryGetProperty("thumb", out var bg) ? bg.GetString() : null
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing CheapShark API response");
        }
        
        return list;
    }

    private async Task<ExternalMediaResult?> GetSteamByIdAsync(string externalId, CancellationToken ct)
    {
        var client = _httpClientFactory.CreateClient();
        
        var url = $"https://store.steampowered.com/api/appdetails?appids={externalId}";
        var response = await client.GetAsync(url, ct);
        if (!response.IsSuccessStatusCode) return null;

        try
        {
            var json = await response.Content.ReadFromJsonAsync<JsonElement>(ct);
            if (!json.TryGetProperty(externalId, out var appData) || !appData.GetProperty("success").GetBoolean())
                return null;

            var g = appData.GetProperty("data");

            var genres = g.TryGetProperty("genres", out var gn)
                ? string.Join(", ", gn.EnumerateArray().Select(x => x.GetProperty("description").GetString()))
                : null;

            var developers = g.TryGetProperty("developers", out var dev)
                ? string.Join(", ", dev.EnumerateArray().Select(x => x.GetString()))
                : null;

            var publishers = g.TryGetProperty("publishers", out var pub)
                ? string.Join(", ", pub.EnumerateArray().Select(x => x.GetString()))
                : null;
                
            // Пытаемся получить дату релиза (формат "25 Apr, 2017" или "10 Feb, 2023")
            int releaseYear = 0;
            if (g.TryGetProperty("release_date", out var rd) && rd.TryGetProperty("date", out var rdate))
            {
                var dateStr = rdate.GetString();
                if (!string.IsNullOrEmpty(dateStr))
                {
                    // Простой парсинг: ищем последние 4 цифры
                    var yearPart = new string(dateStr.Where(char.IsDigit).Reverse().Take(4).Reverse().ToArray());
                    if (yearPart.Length == 4) int.TryParse(yearPart, out releaseYear);
                }
            }

            return new ExternalMediaResult
            {
                ExternalId = externalId,
                Source = ExternalSource.Steam,
                MediaType = MediaType.Game,
                Title = g.TryGetProperty("name", out var n) ? n.GetString() ?? "" : "",
                ReleaseYear = releaseYear,
                CoverImageUrl = g.TryGetProperty("header_image", out var bg) ? bg.GetString() : null,
                Description = g.TryGetProperty("short_description", out var d) ? d.GetString() : null,
                Developer = developers,
                Genre = genres
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing Steam API response for id {AppId}", externalId);
            return null;
        }
    }

    // ==================== Deezer (Музыка) ====================

    private async Task<List<ExternalMediaResult>> SearchDeezerAsync(string query, CancellationToken ct)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var url = $"https://api.deezer.com/search?q={Uri.EscapeDataString(query)}&limit=15";
            _logger.LogInformation("Searching Deezer for: {Query}", query);
            var response = await client.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("Deezer API returned {Status}: {Body}", response.StatusCode, body);
                return [];
            }

            var json = await response.Content.ReadFromJsonAsync<JsonElement>(ct);
            if (!json.TryGetProperty("data", out var data)) return [];

            var results = new List<ExternalMediaResult>();
            foreach (var track in data.EnumerateArray())
            {
                var artist = track.TryGetProperty("artist", out var a) ? a : default;
                var album = track.TryGetProperty("album", out var al) ? al : default;
                var coverUrl = album.ValueKind != JsonValueKind.Undefined && album.TryGetProperty("cover_big", out var cover)
                    ? cover.GetString()
                    : null;

                results.Add(new ExternalMediaResult
                {
                    ExternalId = track.GetProperty("id").GetInt64().ToString(),
                    Source = ExternalSource.Deezer,
                    MediaType = MediaType.Music,
                    Title = track.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "",
                    Artist = artist.ValueKind != JsonValueKind.Undefined && artist.TryGetProperty("name", out var an) ? an.GetString() : null,
                    CoverImageUrl = coverUrl,
                    DurationMinutes = track.TryGetProperty("duration", out var dur) ? dur.GetInt32() / 60 : null
                });
            }
            _logger.LogInformation("Deezer returned {Count} results for '{Query}'", results.Count, query);
            return results;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching Deezer for '{Query}'", query);
            return [];
        }
    }

    private async Task<ExternalMediaResult?> GetDeezerByIdAsync(string externalId, CancellationToken ct)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            var url = $"https://api.deezer.com/track/{externalId}";
            var response = await client.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode) return null;

            var track = await response.Content.ReadFromJsonAsync<JsonElement>(ct);
            var artist = track.TryGetProperty("artist", out var a) ? a : default;
            var album = track.TryGetProperty("album", out var al) ? al : default;
            var coverUrl = album.ValueKind != JsonValueKind.Undefined && album.TryGetProperty("cover_big", out var cover)
                ? cover.GetString()
                : null;

            // Try to get release year from album
            int releaseYear = 0;
            if (album.ValueKind != JsonValueKind.Undefined && album.TryGetProperty("release_date", out var rd))
            {
                var dateStr = rd.GetString();
                if (!string.IsNullOrEmpty(dateStr) && dateStr.Length >= 4)
                    int.TryParse(dateStr[..4], out releaseYear);
            }

            return new ExternalMediaResult
            {
                ExternalId = externalId,
                Source = ExternalSource.Deezer,
                MediaType = MediaType.Music,
                Title = track.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "",
                Artist = artist.ValueKind != JsonValueKind.Undefined && artist.TryGetProperty("name", out var an) ? an.GetString() : null,
                ReleaseYear = releaseYear,
                CoverImageUrl = coverUrl,
                DurationMinutes = track.TryGetProperty("duration", out var dur) ? dur.GetInt32() / 60 : null
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Deezer track {Id}", externalId);
            return null;
        }
    }

    // ==================== Helpers ====================

    private static int TryParseYear(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var prop) || prop.ValueKind == JsonValueKind.Null)
            return 0;

        var dateStr = prop.GetString();
        if (string.IsNullOrEmpty(dateStr)) return 0;

        // Обрабатываем форматы: "2024", "2024-01-15", "2024-01"
        if (dateStr.Length >= 4 && int.TryParse(dateStr[..4], out var year))
            return year;

        return 0;
    }
}
