using FluentValidation;

namespace TLOM.Application.Features.Entries.Queries.GetEntry;

public class GetEntryQueryValidator : AbstractValidator<GetEntryQuery>
{
    public GetEntryQueryValidator()
    {
        RuleFor(x => x.EntryId)
            .NotEmpty()
            .WithMessage("EntryId обязателен.");
    }
}
