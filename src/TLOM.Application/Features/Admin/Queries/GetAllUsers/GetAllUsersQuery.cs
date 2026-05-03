using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Common.Models;
using TLOM.Domain.Constants;

namespace TLOM.Application.Features.Admin.Queries.GetAllUsers;

public record GetAllUsersQuery : IRequest<OffsetPagedResult<AdminUserResponse>>
{
    public int Page { get; init; } = PaginationDefaults.DefaultPage;
    public int PageSize { get; init; } = PaginationDefaults.DefaultOffsetPageSize;
    public string? Search { get; init; }
}

public class AdminUserResponse
{
    public Guid AccountId { get; set; }
    public Guid ProfileId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int EntriesCount { get; set; }
    public DateTime DateCreated { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, OffsetPagedResult<AdminUserResponse>>
{
    private readonly IApplicationDbContext _context;

    public GetAllUsersQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<OffsetPagedResult<AdminUserResponse>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Accounts.AsNoTracking()
            .Include(a => a.Role)
            .Include(a => a.UserProfile)
            .Where(a => a.UserProfile != null);

        if (!string.IsNullOrEmpty(request.Search))
        {
            var search = request.Search.ToLower();
            query = query.Where(a =>
                a.Email.ToLower().Contains(search) ||
                a.UserProfile!.Username.ToLower().Contains(search));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var pageSize = Math.Min(request.PageSize, PaginationDefaults.MaxOffsetPageSize);

        var items = await query
            .OrderByDescending(a => a.DateCreated)
            .Skip((request.Page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AdminUserResponse
            {
                AccountId = a.Id,
                ProfileId = a.UserProfile!.Id,
                Email = a.Email,
                Username = a.UserProfile.Username,
                Role = a.Role.Name.ToString(),
                IsActive = a.IsActive,
                EntriesCount = a.UserProfile.Entries.Count,
                DateCreated = a.DateCreated,
                LastLoginAt = a.LastLoginAt
            })
            .ToListAsync(cancellationToken);

        return new OffsetPagedResult<AdminUserResponse>(items, totalCount, request.Page, pageSize);
    }
}
