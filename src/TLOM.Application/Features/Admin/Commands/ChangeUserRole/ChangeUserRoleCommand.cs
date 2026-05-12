using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Admin.Commands.ChangeUserRole;

public record ChangeUserRoleCommand(Guid AccountId, Guid RoleId) : IRequest<Unit>;

public class ChangeUserRoleCommandHandler : IRequestHandler<ChangeUserRoleCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditService _auditService;
    private readonly ICurrentUserService _currentUser;

    public ChangeUserRoleCommandHandler(IApplicationDbContext context, IAuditService auditService, ICurrentUserService currentUser)
    {
        _context = context;
        _auditService = auditService;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(ChangeUserRoleCommand request, CancellationToken cancellationToken)
    {
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == request.AccountId, cancellationToken)
            ?? throw new NotFoundException("Account", request.AccountId);

        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Id == request.RoleId, cancellationToken)
            ?? throw new NotFoundException("Role", request.RoleId);

        var oldRoleId = account.RoleId;
        account.RoleId = role.Id;
        
        await _context.SaveChangesAsync(cancellationToken);

        await _auditService.LogAsync(
            _currentUser.AccountId!.Value,
            TLOM.Domain.Enums.AuditAction.Updated,
            "AccountRole",
            account.Id,
            oldValues: new { RoleId = oldRoleId },
            newValues: new { RoleId = role.Id },
            cancellationToken);

        return Unit.Value;
    }
}
