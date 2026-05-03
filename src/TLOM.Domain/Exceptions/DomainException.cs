namespace TLOM.Domain.Exceptions;

/// <summary>
/// Базовое доменное исключение. Все кастомные исключения наследуют от него.
/// </summary>
public class DomainException : Exception
{
    public DomainException(string message)
        : base(message)
    {
    }

    public DomainException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
