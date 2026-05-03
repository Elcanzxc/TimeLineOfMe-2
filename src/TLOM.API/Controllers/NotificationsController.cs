using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TLOM.Application.Features.Notifications.Commands;
using TLOM.Application.Features.Notifications.Queries.GetNotifications;

namespace TLOM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] string? cursor,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool unreadOnly = false,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetNotificationsQuery
        {
            Cursor = cursor,
            PageSize = pageSize,
            UnreadOnly = unreadOnly
        }, ct);
        return Ok(result);
    }

    [HttpPut("{notificationId:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid notificationId, CancellationToken ct)
    {
        await _mediator.Send(new MarkNotificationAsReadCommand(notificationId), ct);
        return NoContent();
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
    {
        await _mediator.Send(new MarkAllNotificationsAsReadCommand(), ct);
        return NoContent();
    }
}
