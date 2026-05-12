using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TLOM.Application.Features.Social.Commands.CreateComment;
using TLOM.Application.Features.Social.Commands.DeleteComment;
using TLOM.Application.Features.Social.Commands.FollowUser;
using TLOM.Application.Features.Social.Commands.LikeEntry;
using TLOM.Application.Features.Social.Commands.UnfollowUser;
using TLOM.Application.Features.Social.Commands.UnlikeEntry;
using TLOM.Application.Features.Social.Queries.GetEntryComments;
using TLOM.Application.Features.Social.Queries.GetFollowers;
using TLOM.Application.Features.Social.Queries.GetFollowing;
using TLOM.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace TLOM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SocialController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public SocialController(IMediator mediator, IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _mediator = mediator;
        _context = context;
        _currentUser = currentUser;
    }

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

    [HttpGet("follow/{targetUserId:guid}/status")]
    public async Task<IActionResult> GetFollowStatus(Guid targetUserId, CancellationToken ct)
    {
        var userId = _currentUser.UserProfileId;
        if (userId == null) return Unauthorized();

        var isFollowing = await _context.Follows
            .AnyAsync(f => f.FollowerId == userId.Value && f.FollowingId == targetUserId, ct);

        return Ok(new { isFollowing });
    }

    [HttpGet("followers/{userProfileId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFollowers(Guid userProfileId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetFollowersQuery(userProfileId), ct);
        return Ok(result);
    }

    [HttpGet("following/{userProfileId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFollowing(Guid userProfileId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetFollowingQuery(userProfileId), ct);
        return Ok(result);
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

    [HttpGet("like/{entryId:guid}/status")]
    public async Task<IActionResult> GetLikeStatus(Guid entryId, CancellationToken ct)
    {
        var userId = _currentUser.UserProfileId;
        if (userId == null) return Unauthorized();

        var isLiked = await _context.Likes
            .AnyAsync(l => l.UserId == userId.Value && l.EntryId == entryId, ct);
        var likesCount = await _context.Likes
            .CountAsync(l => l.EntryId == entryId, ct);

        return Ok(new { isLiked, likesCount });
    }

    [HttpGet("like/{entryId:guid}/likers")]
    [AllowAnonymous]
    public async Task<IActionResult> GetLikers(Guid entryId, CancellationToken ct)
    {
        var likers = await _context.Likes
            .Where(l => l.EntryId == entryId)
            .OrderByDescending(l => l.CreatedAt)
            .Join(_context.UserProfiles, l => l.UserId, u => u.Id, (l, u) => new
            {
                u.Id,
                u.Username,
                u.AvatarUrl,
                l.CreatedAt
            })
            .Take(50)
            .ToListAsync(ct);

        return Ok(likers);
    }

    // === Comments ===
    [HttpGet("comments/{entryId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetComments(Guid entryId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetEntryCommentsQuery { EntryId = entryId }, ct);
        return Ok(result);
    }

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

