using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Auth.Commands.ResetPassword;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public ResetPasswordCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<bool> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Email == request.Email, cancellationToken)
            ?? throw new NotFoundException("Account", request.Email);

        if (account.PasswordResetToken != request.Token)
            throw new DomainValidationException("Token", "Неверный токен сброса пароля.");

        if (account.PasswordResetTokenExpiry == null || account.PasswordResetTokenExpiry < DateTime.UtcNow)
            throw new DomainValidationException("Token", "Токен сброса пароля истек.");

        account.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        account.PasswordResetToken = null;
        account.PasswordResetTokenExpiry = null;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
