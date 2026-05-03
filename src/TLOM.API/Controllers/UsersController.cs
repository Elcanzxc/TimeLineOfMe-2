using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TLOM.Application.Features.Users.Commands.UpdateProfile;
using TLOM.Application.Features.Users.Queries.GetProfile;

namespace TLOM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator) => _mediator = mediator;

    [HttpGet("{username}")]
    public async Task<IActionResult> GetProfile(string username, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetProfileQuery(username), ct);
        return Ok(result);
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("me/onboarding")]
    public async Task<IActionResult> CompleteOnboarding([FromBody] TLOM.Application.Features.Users.Commands.CompleteOnboarding.CompleteOnboardingCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(result);
    }
}
