using FluentValidation;
using TLOM.Domain.Constants;

namespace TLOM.Application.Features.Entries.Commands.UpdateEntryStatus;

public class UpdateEntryStatusCommandValidator : AbstractValidator<UpdateEntryStatusCommand>
{
    public UpdateEntryStatusCommandValidator()
    {
        RuleFor(x => x.EntryId)
            .NotEmpty()
            .WithMessage("EntryId обязателен.");

        RuleFor(x => x.NewStatus)
            .IsInEnum()
            .WithMessage("Некорректный статус.");

        RuleFor(x => x.Note)
            .MaximumLength(DomainConstants.MaxEventNoteLength)
            .WithMessage($"Заметка не должна превышать {DomainConstants.MaxEventNoteLength} символов.");
    }
}
