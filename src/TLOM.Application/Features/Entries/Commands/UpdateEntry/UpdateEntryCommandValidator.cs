using FluentValidation;
using TLOM.Domain.Constants;

namespace TLOM.Application.Features.Entries.Commands.UpdateEntry;

public class UpdateEntryCommandValidator : AbstractValidator<UpdateEntryCommand>
{
    public UpdateEntryCommandValidator()
    {
        RuleFor(x => x.EntryId)
            .NotEmpty()
            .WithMessage("EntryId обязателен.");

        RuleFor(x => x.Status)
            .IsInEnum()
            .WithMessage("Некорректный статус.");

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 10)
            .When(x => x.Rating.HasValue);

        RuleFor(x => x.Review)
            .MaximumLength(2000)
            .When(x => !string.IsNullOrEmpty(x.Review));
    }
}
