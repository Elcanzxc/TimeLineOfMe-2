using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TLOM.Application.Features.Feed.Queries.GetFeed;
using TLOM.Domain.Enums;

namespace TLOM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FeedController : ControllerBase
{
    private readonly IMediator _mediator;

    public FeedController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetFeed(
        [FromQuery] string? cursor,
        [FromQuery] int pageSize = 20,
        [FromQuery] MediaType? mediaType = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetFeedQuery
        {
            Cursor = cursor,
            PageSize = pageSize,
            MediaTypeFilter = mediaType
        }, ct);
        return Ok(result);
    }
}
