using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Common.Models;
using TLOM.Domain.Constants;
using TLOM.Domain.Enums;

namespace TLOM.Application.Features.Admin.Queries.GetAuditLogs;

public record GetAuditLogsQuery : IRequest<OffsetPagedResult<AuditLogResponse>>
{
    public int Page { get; init; } = PaginationDefaults.DefaultPage;
    public int PageSize { get; init; } = PaginationDefaults.DefaultOffsetPageSize;
    public Guid? AccountId { get; init; }
    public AuditAction? Action { get; init; }
    public string? EntityType { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}

public class AuditLogResponse
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public string AccountEmail { get; set; } = string.Empty;
    public AuditAction Action { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpAddress { get; set; }
    public DateTime Timestamp { get; set; }
}

public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, OffsetPagedResult<AuditLogResponse>>
{
    private readonly IApplicationDbContext _context;

    public GetAuditLogsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<OffsetPagedResult<AuditLogResponse>> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.AuditLogs.AsNoTracking().Include(a => a.Account).AsQueryable();

        if (request.AccountId.HasValue) query = query.Where(a => a.AccountId == request.AccountId.Value);
        if (request.Action.HasValue) query = query.Where(a => a.Action == request.Action.Value);
        if (!string.IsNullOrEmpty(request.EntityType)) query = query.Where(a => a.EntityType == request.EntityType);
        if (request.FromDate.HasValue) query = query.Where(a => a.Timestamp >= request.FromDate.Value);
        if (request.ToDate.HasValue) query = query.Where(a => a.Timestamp <= request.ToDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);
        var pageSize = Math.Min(request.PageSize, PaginationDefaults.MaxOffsetPageSize);

        var items = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((request.Page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogResponse
            {
                Id = a.Id,
                AccountId = a.AccountId,
                AccountEmail = a.Account.Email,
                Action = a.Action,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                OldValues = a.OldValues,
                NewValues = a.NewValues,
                IpAddress = a.IpAddress,
                Timestamp = a.Timestamp
            })
            .ToListAsync(cancellationToken);

        return new OffsetPagedResult<AuditLogResponse>(items, totalCount, request.Page, pageSize);
    }
}
