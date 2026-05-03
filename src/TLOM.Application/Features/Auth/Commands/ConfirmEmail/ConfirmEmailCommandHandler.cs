using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Auth.Commands.ConfirmEmail;

public class ConfirmEmailCommandHandler : IRequestHandler<ConfirmEmailCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ConfirmEmailCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ConfirmEmailCommand request, CancellationToken cancellationToken)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == request.UserId, cancellationToken)
            ?? throw new NotFoundException("Account", request.UserId);

        if (account.EmailConfirmed)
            return true; // Уже подтвержден

        if (account.EmailConfirmationToken != request.Token)
            throw new DomainValidationException("Token", "Неверный токен подтверждения.");

        account.EmailConfirmed = true;
        account.EmailConfirmationToken = null;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
