using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TLOM.Application.Features.MediaItems.Commands.ImportMediaItem;
using TLOM.Application.Features.MediaItems.Queries.SearchMedia;
using TLOM.Domain.Enums;

namespace TLOM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MediaItemsController : ControllerBase
{
    private readonly IMediator _mediator;

    public MediaItemsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("search")]
    public async Task<IActionResult> Search(
        [FromQuery] string query,
        [FromQuery] MediaType mediaType,
        CancellationToken ct)
    {
        var result = await _mediator.Send(new SearchMediaQuery
        {
            Query = query,
            MediaType = mediaType
        }, ct);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("import")]
    public async Task<IActionResult> Import([FromBody] ImportMediaItemCommand command, CancellationToken ct)
    {
        var mediaItemId = await _mediator.Send(command, ct);
        return Ok(new { mediaItemId });
    }
}
