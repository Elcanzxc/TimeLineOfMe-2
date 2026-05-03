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
    }
}
