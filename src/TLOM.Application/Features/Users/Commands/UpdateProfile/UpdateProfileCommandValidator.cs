using FluentValidation;
using TLOM.Domain.Constants;

namespace TLOM.Application.Features.Users.Commands.UpdateProfile;

public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.FirstName).MaximumLength(DomainConstants.MaxFirstNameLength);
        RuleFor(x => x.LastName).MaximumLength(DomainConstants.MaxLastNameLength);
        RuleFor(x => x.Bio).MaximumLength(DomainConstants.MaxBioLength);
        RuleFor(x => x.City).MaximumLength(DomainConstants.MaxCityLength);
        RuleFor(x => x.Country).MaximumLength(DomainConstants.MaxCountryLength);
        RuleFor(x => x.Region).MaximumLength(DomainConstants.MaxRegionLength);
    }
}
