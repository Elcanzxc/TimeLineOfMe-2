using MediatR;
using TLOM.Application.Features.Entries.Responses;

namespace TLOM.Application.Features.Entries.Commands.CreateEntry;

/// <summary>
/// Команда создания записи в таймлайне.
/// Входные данные: ExternalId + ExternalSource + тип контента.
/// Система ищет/создаёт MediaItem, затем создаёт Entry + первый EntryEvent.
/// </summary>
public record CreateEntryCommand : IRequest<EntryResponse>
{
    /// <summary>
    /// ID MediaItem (уже существующего или найденного через поиск).
    /// </summary>
    public Guid MediaItemId { get; init; }

    /// <summary>
    /// Начальная заметка (опционально).
    /// </summary>
    public string? Note { get; init; }
}
