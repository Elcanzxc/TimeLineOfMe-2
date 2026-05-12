using System.Security.Claims;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Features.Auth.Responses;
using TLOM.Domain.Entities;
using TLOM.Domain.Enums;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, RegisterResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _configuration;
    private readonly ILogger<RegisterCommandHandler> _logger;

    public RegisterCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IEmailSender emailSender,
        IConfiguration configuration,
        ILogger<RegisterCommandHandler> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _emailSender = emailSender;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<RegisterResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (await _context.Accounts.AnyAsync(a => a.Email == request.Email, cancellationToken))
            throw new ConflictException("Пользователь с таким email уже существует.");

        var userRole = await _context.Roles.FirstAsync(r => r.Name == RoleName.User, cancellationToken);

        var token = Guid.NewGuid().ToString("N");

        var account = new Account
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            EmailConfirmed = false,
            EmailConfirmationToken = token,
            RoleId = userRole.Id,
            IsActive = true,
            DateCreated = DateTime.UtcNow
        };

        // Auto-generate a temporary username from email
        var baseUsername = request.Email.Split('@')[0].Replace(".", "_");
        var username = baseUsername;
        var counter = 1;
        while (await _context.UserProfiles.AnyAsync(p => p.Username == username, cancellationToken))
        {
            username = $"{baseUsername}_{counter++}";
        }

        var profile = new UserProfile
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            Username = username
        };

        _context.Accounts.Add(account);
        _context.UserProfiles.Add(profile);
        await _context.SaveChangesAsync(cancellationToken);

        // Отправка письма подтверждения. Если SMTP не настроен (локальная разработка),
        // автоматически подтверждаем email, чтобы пользователь мог войти.
        try
        {
            var clientUrl = _configuration["ClientUrl"] ?? "http://localhost:5173";
            var confirmationLink = $"{clientUrl}/confirm-email?userId={account.Id}&token={token}";
            await _emailSender.SendEmailAsync(
                account.Email,
                "Confirm your Time Line Of Me account",
                $"<p>Welcome to TLOM, {profile.Username}!</p><p>Please confirm your email by clicking the link below:</p><a href='{confirmationLink}'>Confirm Email</a>");

            return new RegisterResponse
            {
                RequiresEmailConfirmation = true,
                Message = "Регистрация успешна. Пожалуйста, проверьте вашу почту для подтверждения аккаунта."
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send confirmation email to {Email}. Auto-confirming account.", request.Email);

            // Если письмо не отправилось — автоматически подтверждаем email
            account.EmailConfirmed = true;
            account.EmailConfirmationToken = null;
            await _context.SaveChangesAsync(cancellationToken);

            return new RegisterResponse
            {
                RequiresEmailConfirmation = false,
                Message = "Регистрация успешна. Вы можете войти в аккаунт."
            };
        }
    }
}
