using FluentValidation;

namespace TLOM.Application.Features.Users.Commands.CompleteOnboarding;

public class CompleteOnboardingCommandValidator : AbstractValidator<CompleteOnboardingCommand>
{
    public CompleteOnboardingCommandValidator()
    {
        RuleFor(v => v.Username)
            .NotEmpty().WithMessage("Username is required.")
            .MinimumLength(3).WithMessage("Username must be at least 3 characters.")
            .MaximumLength(30).WithMessage("Username must not exceed 30 characters.")
            .Matches("^[a-zA-Z0-9_]+$").WithMessage("Username can only contain letters, numbers, and underscores.");

        RuleFor(v => v.FirstName)
            .MaximumLength(50).WithMessage("First name must not exceed 50 characters.");

        RuleFor(v => v.LastName)
            .MaximumLength(50).WithMessage("Last name must not exceed 50 characters.");

        RuleFor(v => v.DateOfBirth)
            .LessThan(DateTime.UtcNow).WithMessage("Date of birth cannot be in the future.");

        RuleFor(v => v.Bio)
            .MaximumLength(500).WithMessage("Bio must not exceed 500 characters.");
    }
}
