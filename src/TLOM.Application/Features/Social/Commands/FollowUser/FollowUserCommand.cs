using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Domain.Entities;
using TLOM.Domain.Enums;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Social.Commands.FollowUser;

public record FollowUserCommand(Guid TargetUserId) : IRequest<Unit>;

public class FollowUserCommandHandler : IRequestHandler<FollowUserCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notificationService;
    private readonly IRealtimePushService? _pushService;

    public FollowUserCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, INotificationService notificationService, IRealtimePushService? pushService = null)
    {
        _context = context;
        _currentUser = currentUser;
        _notificationService = notificationService;
        _pushService = pushService;
    }

    public async Task<Unit> Handle(FollowUserCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserProfileId ?? throw new ForbiddenException();

        if (userId == request.TargetUserId)
            throw new DomainValidationException("TargetUserId", "Нельзя подписаться на самого себя.");

        if (!await _context.UserProfiles.AnyAsync(u => u.Id == request.TargetUserId, cancellationToken))
            throw new NotFoundException(nameof(UserProfile), request.TargetUserId);

        if (await _context.Follows.AnyAsync(f => f.FollowerId == userId && f.FollowingId == request.TargetUserId, cancellationToken))
            throw new ConflictException("Вы уже подписаны на этого пользователя.");

        _context.Follows.Add(new Follow
        {
            Id = Guid.NewGuid(),
            FollowerId = userId,
            FollowingId = request.TargetUserId,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync(cancellationToken);

        await _notificationService.SendAsync(
            request.TargetUserId, NotificationType.NewFollower,
            "подписался на вас", actorId: userId,
            entityType: nameof(UserProfile), entityId: userId,
            cancellationToken: cancellationToken);

        // Push real-time event for UI updates
        if (_pushService is not null)
        {
            await _pushService.PushEventAsync(request.TargetUserId, "FollowChanged",
                new { followerId = userId, targetUserId = request.TargetUserId, action = "followed" }, cancellationToken);
        }

        return Unit.Value;
    }
}
