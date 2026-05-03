using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TLOM.Application.Features.Stats.Queries.GetUserStats;

namespace TLOM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StatsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("me")]
    public async Task<IActionResult> GetMyStats(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetUserStatsQuery(), ct);
        return Ok(result);
    }

    [HttpGet("{userId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetUserStats(Guid userId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetUserStatsQuery(userId), ct);
        return Ok(result);
    }
}
