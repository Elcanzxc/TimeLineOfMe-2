using FluentValidation;

namespace TLOM.Application.Features.Entries.Commands.CreateEntry;

/// <summary>
/// Валидатор для CreateEntryCommand — срабатывает автоматически через ValidationBehavior.
/// </summary>
public class CreateEntryCommandValidator : AbstractValidator<CreateEntryCommand>
{
    public CreateEntryCommandValidator()
    {
        RuleFor(x => x.MediaItemId)
            .NotEmpty()
            .WithMessage("MediaItemId обязателен.");
            
        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 10)
            .When(x => x.Rating.HasValue)
            .WithMessage("Рейтинг должен быть от 1 до 10.");
    }
}
