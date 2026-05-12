using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Domain.Entities;
using TLOM.Domain.Enums;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.MediaItems.Commands.ImportMediaItem;

/// <summary>
/// Импортирует медиа-контент из внешнего API в локальную БД.
/// Если уже существует (по ExternalId+Source) — возвращает существующий.
/// </summary>
public record ImportMediaItemCommand : IRequest<Guid>
{
    public string ExternalId { get; init; } = string.Empty;
    public ExternalSource Source { get; init; }
    public MediaType MediaType { get; init; }
}

public class ImportMediaItemCommandHandler : IRequestHandler<ImportMediaItemCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IExternalMediaSearchService _searchService;

    public ImportMediaItemCommandHandler(IApplicationDbContext context, IExternalMediaSearchService searchService)
    {
        _context = context;
        _searchService = searchService;
    }

    public async Task<Guid> Handle(ImportMediaItemCommand request, CancellationToken cancellationToken)
    {
        // Проверяем, есть ли уже в БД
        var existing = await _context.MediaItems
            .FirstOrDefaultAsync(m => m.ExternalId == request.ExternalId && m.ExternalSource == request.Source, cancellationToken);

        if (existing is not null)
            return existing.Id;

        // Загружаем из внешнего API
        var externalData = await _searchService.GetByExternalIdAsync(request.ExternalId, request.Source, cancellationToken)
            ?? throw new NotFoundException("MediaItem", $"{request.Source}:{request.ExternalId}");

        var genresList = new List<Genre>();
        if (!string.IsNullOrWhiteSpace(externalData.Genre))
        {
            var genreNames = externalData.Genre.Split(new[] { ',', '/' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            foreach (var g in genreNames)
            {
                var existingGenre = await _context.Genres.FirstOrDefaultAsync(x => x.Name == g, cancellationToken);
                if (existingGenre != null)
                {
                    genresList.Add(existingGenre);
                }
                else
                {
                    genresList.Add(new Genre { Id = Guid.NewGuid(), Name = g });
                }
            }
        }

        MediaItem mediaItem = request.MediaType switch
        {
            MediaType.Movie => new Movie
            {
                Id = Guid.NewGuid(),
                Title = externalData.Title,
                OriginalTitle = externalData.OriginalTitle,
                ReleaseYear = externalData.ReleaseYear,
                CoverImageUrl = externalData.CoverImageUrl,
                Description = externalData.Description,
                ExternalId = externalData.ExternalId,
                ExternalSource = externalData.Source,
                MediaType = MediaType.Movie,
                Director = externalData.Director,
                Genres = genresList,
                Duration = externalData.DurationMinutes ?? 0
            },
            MediaType.Book => new Book
            {
                Id = Guid.NewGuid(),
                Title = externalData.Title,
                OriginalTitle = externalData.OriginalTitle,
                ReleaseYear = externalData.ReleaseYear,
                CoverImageUrl = externalData.CoverImageUrl,
                Description = externalData.Description,
                ExternalId = externalData.ExternalId,
                ExternalSource = externalData.Source,
                MediaType = MediaType.Book,
                Author = externalData.Author,
                PageCount = externalData.PageCount ?? 0,
                Genres = genresList
            },
            MediaType.Game => new Game
            {
                Id = Guid.NewGuid(),
                Title = externalData.Title,
                OriginalTitle = externalData.OriginalTitle,
                ReleaseYear = externalData.ReleaseYear,
                CoverImageUrl = externalData.CoverImageUrl,
                Description = externalData.Description,
                ExternalId = externalData.ExternalId,
                ExternalSource = externalData.Source,
                MediaType = MediaType.Game,
                Developer = externalData.Developer,
                Genres = genresList
            },
            MediaType.Music => new Music
            {
                Id = Guid.NewGuid(),
                Title = externalData.Title,
                OriginalTitle = externalData.OriginalTitle,
                ReleaseYear = externalData.ReleaseYear,
                CoverImageUrl = externalData.CoverImageUrl,
                Description = externalData.Description,
                ExternalId = externalData.ExternalId,
                ExternalSource = externalData.Source,
                MediaType = MediaType.Music,
                Artist = externalData.Artist,
                Duration = (externalData.DurationMinutes ?? 0) * 60,
                Genres = genresList
            },
            _ => throw new DomainValidationException("MediaType", "Неподдерживаемый тип медиа.")
        };

        _context.MediaItems.Add(mediaItem);
        await _context.SaveChangesAsync(cancellationToken);

        return mediaItem.Id;
    }
}
