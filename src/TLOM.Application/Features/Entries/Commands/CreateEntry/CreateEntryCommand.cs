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

    public string? Note { get; init; }

    public TLOM.Domain.Enums.EntryStatus? Status { get; init; }
    public int? Rating { get; init; }
    public string? Review { get; init; }
    public DateTime? StartedAt { get; init; }
    public DateTime? FinishedAt { get; init; }
    public bool IsPrivate { get; init; } = false;
}
