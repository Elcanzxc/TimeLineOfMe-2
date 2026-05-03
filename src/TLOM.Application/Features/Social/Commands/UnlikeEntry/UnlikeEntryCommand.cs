using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Domain.Entities;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Social.Commands.UnlikeEntry;

public record UnlikeEntryCommand(Guid EntryId) : IRequest<Unit>;

public class UnlikeEntryCommandHandler : IRequestHandler<UnlikeEntryCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UnlikeEntryCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(UnlikeEntryCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserProfileId ?? throw new ForbiddenException();

        var like = await _context.Likes
            .FirstOrDefaultAsync(l => l.UserId == userId && l.EntryId == request.EntryId, cancellationToken)
            ?? throw new NotFoundException(nameof(Like), request.EntryId);

        _context.Likes.Remove(like);
        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
