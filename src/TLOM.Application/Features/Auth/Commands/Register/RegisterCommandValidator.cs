using FluentValidation;
using TLOM.Domain.Constants;

namespace TLOM.Application.Features.Auth.Commands.Register;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email обязателен.")
            .EmailAddress().WithMessage("Некорректный формат email.")
            .MaximumLength(DomainConstants.MaxEmailLength);

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Пароль обязателен.")
            .MinimumLength(8).WithMessage("Пароль должен содержать минимум 8 символов.")
            .Matches("[A-Z]").WithMessage("Пароль должен содержать хотя бы одну заглавную букву.")
            .Matches("[0-9]").WithMessage("Пароль должен содержать хотя бы одну цифру.");

        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username обязателен.")
            .MinimumLength(DomainConstants.MinUsernameLength)
            .MaximumLength(DomainConstants.MaxUsernameLength)
            .Matches("^[a-zA-Z0-9_]+$").WithMessage("Username может содержать только буквы, цифры и подчёркивания.");
    }
}
