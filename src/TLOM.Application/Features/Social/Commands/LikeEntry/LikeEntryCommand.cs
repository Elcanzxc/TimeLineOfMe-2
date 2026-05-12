using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Domain.Entities;
using TLOM.Domain.Enums;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Social.Commands.LikeEntry;

public record LikeEntryCommand(Guid EntryId) : IRequest<Unit>;

public class LikeEntryCommandHandler : IRequestHandler<LikeEntryCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notificationService;
    private readonly IRealtimePushService? _pushService;

    public LikeEntryCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, INotificationService notificationService, IRealtimePushService? pushService = null)
    {
        _context = context;
        _currentUser = currentUser;
        _notificationService = notificationService;
        _pushService = pushService;
    }

    public async Task<Unit> Handle(LikeEntryCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserProfileId ?? throw new ForbiddenException();

        var entry = await _context.Entries
            .FirstOrDefaultAsync(e => e.Id == request.EntryId, cancellationToken)
            ?? throw new NotFoundException(nameof(Entry), request.EntryId);

        if (entry.UserId == userId)
            throw new DomainValidationException("EntryId", "Нельзя лайкнуть свою запись.");

        if (entry.IsPrivate)
            throw new ForbiddenException("Нельзя лайкнуть приватную запись.");

        if (await _context.Likes.AnyAsync(l => l.UserId == userId && l.EntryId == request.EntryId, cancellationToken))
            throw new ConflictException("Вы уже лайкнули эту запись.");

        _context.Likes.Add(new Like
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            EntryId = request.EntryId,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync(cancellationToken);

        await _notificationService.SendAsync(
            entry.UserId, NotificationType.EntryLiked,
            "лайкнул вашу запись", actorId: userId,
            entityType: nameof(Entry), entityId: entry.Id,
            cancellationToken: cancellationToken);

        // Push real-time event
        if (_pushService is not null)
        {
            var likesCount = await _context.Likes.CountAsync(l => l.EntryId == request.EntryId, cancellationToken);
            await _pushService.PushEventAsync(entry.UserId, "EntryLiked",
                new { entryId = request.EntryId, likerId = userId, likesCount, action = "liked" }, cancellationToken);
            // Also push to the liker to update their own UI
            await _pushService.PushEventAsync(userId, "EntryLiked",
                new { entryId = request.EntryId, likerId = userId, likesCount, action = "liked" }, cancellationToken);
        }

        return Unit.Value;
    }
}
