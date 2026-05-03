using MediatR;
using Microsoft.AspNetCore.Mvc;
using TLOM.Application.Features.Auth.Commands.GoogleLogin;
using TLOM.Application.Features.Auth.Commands.Login;
using TLOM.Application.Features.Auth.Commands.RefreshToken;
using TLOM.Application.Features.Auth.Commands.Register;

namespace TLOM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator) => _mediator = mediator;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(result);
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(result);
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] Guid userId, [FromQuery] string token, CancellationToken ct)
    {
        var command = new TLOM.Application.Features.Auth.Commands.ConfirmEmail.ConfirmEmailCommand { UserId = userId, Token = token };
        var result = await _mediator.Send(command, ct);
        return Ok(new { success = result });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] TLOM.Application.Features.Auth.Commands.ForgotPassword.ForgotPasswordCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(new { success = result });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] TLOM.Application.Features.Auth.Commands.ResetPassword.ResetPasswordCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(new { success = result });
    }
}
