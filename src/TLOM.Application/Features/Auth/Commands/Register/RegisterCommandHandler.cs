using System.Security.Claims;
using MediatR;
using Microsoft.Extensions.Configuration;
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

    public RegisterCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IEmailSender emailSender,
        IConfiguration configuration)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _emailSender = emailSender;
        _configuration = configuration;
    }

    public async Task<RegisterResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (await _context.Accounts.AnyAsync(a => a.Email == request.Email, cancellationToken))
            throw new ConflictException("Пользователь с таким email уже существует.");

        if (await _context.UserProfiles.AnyAsync(p => p.Username == request.Username, cancellationToken))
            throw new ConflictException("Этот username уже занят.");

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

        var profile = new UserProfile
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            Username = request.Username
        };

        _context.Accounts.Add(account);
        _context.UserProfiles.Add(profile);
        await _context.SaveChangesAsync(cancellationToken);

        // Отправка письма (ссылка может быть на фронтенд /confirm-email или напрямую на бэкенд)
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
}
