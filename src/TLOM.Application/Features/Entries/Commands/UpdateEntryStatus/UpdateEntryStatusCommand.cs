using MediatR;
using TLOM.Application.Features.Entries.Responses;
using TLOM.Domain.Enums;

namespace TLOM.Application.Features.Entries.Commands.UpdateEntryStatus;

/// <summary>
/// Команда смены статуса записи.
/// Создаёт новый EntryEvent и обновляет текущий статус Entry.
/// </summary>
public record UpdateEntryStatusCommand : IRequest<EntryResponse>
{
    public Guid EntryId { get; init; }

    public EntryStatus NewStatus { get; init; }

    public string? Note { get; init; }
}
