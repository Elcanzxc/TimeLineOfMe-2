using TLOM.Domain.Enums;

namespace TLOM.Application.Features.Entries.Responses;

/// <summary>
/// Response DTO для EntryEvent — элемент хронологии.
/// </summary>
public class EntryEventResponse
{
    public Guid Id { get; set; }

    public EntryStatus Status { get; set; }

    public DateTime DateTime { get; set; }

    public string? Note { get; set; }
}
