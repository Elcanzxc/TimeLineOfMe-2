namespace TLOM.Domain.Exceptions;

/// <summary>
/// Исключение: конфликт данных (например, дубликат) → маппится на HTTP 409.
/// </summary>
public class ConflictException : DomainException
{
    public ConflictException(string message)
        : base(message)
    {
    }
}
