using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;

namespace TLOM.Application.Features.Auth.Commands.ForgotPassword;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailSender _emailSender;

    public ForgotPasswordCommandHandler(
        IApplicationDbContext context,
        IEmailSender emailSender)
    {
        _context = context;
        _emailSender = emailSender;
    }

    public async Task<bool> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Email == request.Email, cancellationToken);

        // Мы возвращаем true даже если аккаунт не найден, чтобы не раскрывать базу email-ов
        if (account == null)
            return true;

        var resetToken = Guid.NewGuid().ToString("N");
        account.PasswordResetToken = resetToken;
        account.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);

        await _context.SaveChangesAsync(cancellationToken);

        var resetLink = $"http://localhost:5173/reset-password?email={account.Email}&token={resetToken}";
        
        await _emailSender.SendEmailAsync(
            account.Email,
            "TLOM Password Reset",
            $"<p>You requested a password reset.</p><p>Click the link below to reset your password. It expires in 1 hour.</p><a href='{resetLink}'>Reset Password</a>");

        return true;
    }
}
