using TLOM.Domain.Enums;

namespace TLOM.Application.Common.Interfaces;

/// <summary>
/// Запись аудит-логов — реализуется в Infrastructure.
/// </summary>
public interface IAuditService
{
    /// <summary>
    /// Записать действие пользователя в аудит-лог.
    /// </summary>
    Task LogAsync(
        Guid accountId,
        AuditAction action,
        string entityType,
        Guid entityId,
        object? oldValues = null,
        object? newValues = null,
        CancellationToken cancellationToken = default);
}
