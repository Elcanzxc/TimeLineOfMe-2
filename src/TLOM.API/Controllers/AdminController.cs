using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TLOM.Application.Features.Admin.Queries.GetAllUsers;
using TLOM.Application.Features.Admin.Queries.GetAuditLogs;
using TLOM.Domain.Enums;

namespace TLOM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminController(IMediator mediator) => _mediator = mediator;

    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? accountId = null,
        [FromQuery] AuditAction? action = null,
        [FromQuery] string? entityType = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetAuditLogsQuery
        {
            Page = page,
            PageSize = pageSize,
            AccountId = accountId,
            Action = action,
            EntityType = entityType,
            FromDate = fromDate,
            ToDate = toDate
        }, ct);
        return Ok(result);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetAllUsersQuery
        {
            Page = page,
            PageSize = pageSize,
            Search = search
        }, ct);
        return Ok(result);
    }
}
