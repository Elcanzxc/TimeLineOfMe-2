using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Domain.Entities;
using TLOM.Domain.Enums;

namespace TLOM.Application.Features.MediaItems.Queries.SearchMedia;

public record SearchMediaQuery : IRequest<List<MediaSearchResponse>>
{
    public string Query { get; init; } = string.Empty;
    public MediaType MediaType { get; init; }
}

public class MediaSearchResponse
{
    public Guid? LocalId { get; set; }
    public string ExternalId { get; set; } = string.Empty;
    public ExternalSource Source { get; set; }
    public MediaType MediaType { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? OriginalTitle { get; set; }
    public int ReleaseYear { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Description { get; set; }
    public bool AlreadyInLibrary { get; set; }
}

public class SearchMediaQueryHandler : IRequestHandler<SearchMediaQuery, List<MediaSearchResponse>>
{
    private readonly IExternalMediaSearchService _searchService;
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public SearchMediaQueryHandler(
        IExternalMediaSearchService searchService,
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _searchService = searchService;
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<List<MediaSearchResponse>> Handle(SearchMediaQuery request, CancellationToken cancellationToken)
    {
        var externalResults = await _searchService.SearchAsync(request.Query, request.MediaType, cancellationToken);

        var externalIds = externalResults.Select(r => r.ExternalId).ToList();

        // Проверяем, какие уже есть в БД
        var existingItems = await _context.MediaItems
            .Where(m => externalIds.Contains(m.ExternalId))
            .Select(m => new { m.Id, m.ExternalId })
            .ToListAsync(cancellationToken);

        // Проверяем, какие уже в библиотеке текущего пользователя
        var userEntryMediaIds = _currentUser.UserProfileId.HasValue
            ? await _context.Entries
                .Where(e => e.UserId == _currentUser.UserProfileId.Value)
                .Select(e => e.MediaItemId)
                .ToListAsync(cancellationToken)
            : [];

        return externalResults.Select(r =>
        {
            var existing = existingItems.FirstOrDefault(e => e.ExternalId == r.ExternalId);
            return new MediaSearchResponse
            {
                LocalId = existing?.Id,
                ExternalId = r.ExternalId,
                Source = r.Source,
                MediaType = r.MediaType,
                Title = r.Title,
                OriginalTitle = r.OriginalTitle,
                ReleaseYear = r.ReleaseYear,
                CoverImageUrl = r.CoverImageUrl,
                Description = r.Description,
                AlreadyInLibrary = existing != null && userEntryMediaIds.Contains(existing.Id)
            };
        }).ToList();
    }
}
