using MediatR;
using TLOM.Application.Features.Entries.Responses;

namespace TLOM.Application.Features.Entries.Queries.GetEntry;

/// <summary>
/// Запрос получения одной записи по ID.
/// </summary>
public record GetEntryQuery : IRequest<EntryResponse>
{
    public Guid EntryId { get; init; }
}
