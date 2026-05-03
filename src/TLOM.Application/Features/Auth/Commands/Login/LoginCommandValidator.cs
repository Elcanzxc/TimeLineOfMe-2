using FluentValidation;
using TLOM.Domain.Constants;

namespace TLOM.Application.Features.Auth.Commands.Login;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email обязателен.")
            .EmailAddress()
            .MaximumLength(DomainConstants.MaxEmailLength);

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Пароль обязателен.");
    }
}
