using System.Text.Json;
using TLOM.Application.Common.Interfaces;
using TLOM.Domain.Entities;
using TLOM.Domain.Enums;
using TLOM.Infrastructure.Persistence;

namespace TLOM.Infrastructure.Services;

public class AuditService : IAuditService
{
    private readonly ApplicationDbContext _context;

    public AuditService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(
        Guid accountId,
        AuditAction action,
        string entityType,
        Guid entityId,
        object? oldValues = null,
        object? newValues = null,
        CancellationToken cancellationToken = default)
    {
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            AccountId = accountId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            OldValues = oldValues is not null ? JsonSerializer.Serialize(oldValues) : null,
            NewValues = newValues is not null ? JsonSerializer.Serialize(newValues) : null,
            Timestamp = DateTime.UtcNow
        };

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
