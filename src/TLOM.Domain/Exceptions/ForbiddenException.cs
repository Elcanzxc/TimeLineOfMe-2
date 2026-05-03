namespace TLOM.Domain.Exceptions;

/// <summary>
/// Исключение: доступ запрещён → маппится на HTTP 403.
/// Используется при попытке изменить чужой ресурс.
/// </summary>
public class ForbiddenException : DomainException
{
    public ForbiddenException(string message = "У вас нет прав для выполнения этого действия.")
        : base(message)
    {
    }
}
