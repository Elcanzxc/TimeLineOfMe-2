namespace TLOM.Domain.Exceptions;

/// <summary>
/// Исключение: сущность не найдена → маппится на HTTP 404.
/// </summary>
public class NotFoundException : DomainException
{
    public NotFoundException(string entityName, object key)
        : base($"Сущность \"{entityName}\" с идентификатором ({key}) не найдена.")
    {
    }
}
