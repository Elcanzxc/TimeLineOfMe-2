namespace TLOM.Application.Common.Interfaces;

/// <summary>
/// Поиск медиа-контента через внешние API (TMDB, Google Books, CheapShark/Steam, Spotify).
/// Реализуется в Infrastructure Layer.
/// </summary>
public interface IExternalMediaSearchService
{
    Task<List<ExternalMediaResult>> SearchAsync(string query, Domain.Enums.MediaType mediaType, CancellationToken cancellationToken = default);
    Task<ExternalMediaResult?> GetByExternalIdAsync(string externalId, Domain.Enums.ExternalSource source, CancellationToken cancellationToken = default);
}

public class ExternalMediaResult
{
    public string ExternalId { get; set; } = string.Empty;
    public Domain.Enums.ExternalSource Source { get; set; }
    public Domain.Enums.MediaType MediaType { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? OriginalTitle { get; set; }
    public int ReleaseYear { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Description { get; set; }

    // Media-specific
    public string? Director { get; set; }
    public string? Author { get; set; }
    public string? Developer { get; set; }
    public string? Artist { get; set; }
    public string? Genre { get; set; }
    public int? DurationMinutes { get; set; }
    public int? PageCount { get; set; }
}
