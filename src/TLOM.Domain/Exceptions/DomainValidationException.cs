namespace TLOM.Domain.Exceptions;

/// <summary>
/// Доменное исключение валидации → маппится на HTTP 400.
/// Отличается от FluentValidation — используется для бизнес-правил внутри Domain.
/// </summary>
public class DomainValidationException : DomainException
{
    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public DomainValidationException(IReadOnlyDictionary<string, string[]> errors)
        : base("Обнаружены ошибки валидации.")
    {
        Errors = errors;
    }

    public DomainValidationException(string propertyName, string errorMessage)
        : base($"Ошибка валидации: {errorMessage}")
    {
        Errors = new Dictionary<string, string[]>
        {
            { propertyName, [errorMessage] }
        };
    }
}
