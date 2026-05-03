using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TLOM.Application.Features.Entries.Commands.CreateEntry;
using TLOM.Application.Features.Entries.Commands.DeleteEntry;
using TLOM.Application.Features.Entries.Commands.UpdateEntryStatus;
using TLOM.Application.Features.Entries.Queries.GetEntry;
using TLOM.Application.Features.Entries.Queries.GetUserEntries;
using TLOM.Domain.Enums;

namespace TLOM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EntriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public EntriesController(IMediator mediator) => _mediator = mediator;

    [HttpGet("{entryId:guid}")]
    public async Task<IActionResult> GetEntry(Guid entryId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetEntryQuery { EntryId = entryId }, ct);
        return Ok(result);
    }

    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetUserEntries(
        Guid userId,
        [FromQuery] string? cursor,
        [FromQuery] int pageSize = 20,
        [FromQuery] EntryStatus? status = null,
        [FromQuery] MediaType? mediaType = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetUserEntriesQuery
        {
            UserId = userId,
            Cursor = cursor,
            PageSize = pageSize,
            StatusFilter = status,
            MediaTypeFilter = mediaType
        }, ct);
        return Ok(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateEntry([FromBody] CreateEntryCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetEntry), new { entryId = result.Id }, result);
    }

    [Authorize]
    [HttpPut("{entryId:guid}/status")]
    public async Task<IActionResult> UpdateEntryStatus(Guid entryId, [FromBody] UpdateEntryStatusCommand command, CancellationToken ct)
    {
        var updated = command with { EntryId = entryId };
        var result = await _mediator.Send(updated, ct);
        return Ok(result);
    }

    [Authorize]
    [HttpDelete("{entryId:guid}")]
    public async Task<IActionResult> DeleteEntry(Guid entryId, CancellationToken ct)
    {
        await _mediator.Send(new DeleteEntryCommand(entryId), ct);
        return NoContent();
    }
}
