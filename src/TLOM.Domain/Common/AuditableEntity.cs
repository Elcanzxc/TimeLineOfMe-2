namespace TLOM.Domain.Common;

/// <summary>
/// Сущность с полями аудита (CreatedAt, UpdatedAt).
/// Автоматически заполняется через AuditableEntityInterceptor в Infrastructure.
/// </summary>
public abstract class AuditableEntity : BaseEntity
{
    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
