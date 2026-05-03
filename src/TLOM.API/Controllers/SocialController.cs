using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TLOM.Application.Features.Social.Commands.CreateComment;
using TLOM.Application.Features.Social.Commands.DeleteComment;
using TLOM.Application.Features.Social.Commands.FollowUser;
using TLOM.Application.Features.Social.Commands.LikeEntry;
using TLOM.Application.Features.Social.Commands.UnfollowUser;
using TLOM.Application.Features.Social.Commands.UnlikeEntry;

namespace TLOM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SocialController : ControllerBase
{
    private readonly IMediator _mediator;

    public SocialController(IMediator mediator) => _mediator = mediator;

    // === Follow ===
    [HttpPost("follow/{targetUserId:guid}")]
    public async Task<IActionResult> Follow(Guid targetUserId, CancellationToken ct)
    {
        await _mediator.Send(new FollowUserCommand(targetUserId), ct);
        return Ok(new { message = "Подписка оформлена." });
    }

    [HttpDelete("follow/{targetUserId:guid}")]
    public async Task<IActionResult> Unfollow(Guid targetUserId, CancellationToken ct)
    {
        await _mediator.Send(new UnfollowUserCommand(targetUserId), ct);
        return NoContent();
    }

    // === Likes ===
    [HttpPost("like/{entryId:guid}")]
    public async Task<IActionResult> Like(Guid entryId, CancellationToken ct)
    {
        await _mediator.Send(new LikeEntryCommand(entryId), ct);
        return Ok(new { message = "Лайк поставлен." });
    }

    [HttpDelete("like/{entryId:guid}")]
    public async Task<IActionResult> Unlike(Guid entryId, CancellationToken ct)
    {
        await _mediator.Send(new UnlikeEntryCommand(entryId), ct);
        return NoContent();
    }

    // === Comments ===
    [HttpPost("comment")]
    public async Task<IActionResult> CreateComment([FromBody] CreateCommentCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(CreateComment), new { id = result.Id }, result);
    }

    [HttpDelete("comment/{commentId:guid}")]
    public async Task<IActionResult> DeleteComment(Guid commentId, CancellationToken ct)
    {
        await _mediator.Send(new DeleteCommentCommand(commentId), ct);
        return NoContent();
    }
}
