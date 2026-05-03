namespace TLOM.Domain.Common;

/// <summary>
/// Базовая сущность — все доменные сущности наследуют от неё.
/// Содержит только идентификатор.
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; set; }
}
