namespace TLOM.Domain.Common;

/// <summary>
/// Интерфейс для мягкого удаления сущностей (Soft Delete).
/// </summary>
public interface ISoftDeletable
{
    bool IsDeleted { get; set; }
    DateTime? DeletedAt { get; set; }
}
