using MediatR;
using TLOM.Application.Features.Entries.Responses;
using TLOM.Domain.Enums;

namespace TLOM.Application.Features.Entries.Commands.UpdateEntry;

/// <summary>
/// Команда обновления записи (статус, оценка, отзыв, приватность).
/// Если статус меняется, создаётся новый EntryEvent.
/// </summary>
public record UpdateEntryCommand : IRequest<EntryResponse>
{
    public Guid EntryId { get; init; }

    public EntryStatus Status { get; init; }
    
    public int? Rating { get; init; }
    
    public string? Review { get; init; }
    
    public DateTime? StartedAt { get; init; }
    
    public DateTime? FinishedAt { get; init; }
    
    public bool IsPrivate { get; init; }
}
