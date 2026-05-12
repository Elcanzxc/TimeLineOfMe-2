using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Domain.Entities;
using TLOM.Domain.Enums;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Social.Commands.UnfollowUser;

public record UnfollowUserCommand(Guid TargetUserId) : IRequest<Unit>;

public class UnfollowUserCommandHandler : IRequestHandler<UnfollowUserCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notificationService;

    public UnfollowUserCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, INotificationService notificationService)
    {
        _context = context;
        _currentUser = currentUser;
        _notificationService = notificationService;
    }

    public async Task<Unit> Handle(UnfollowUserCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserProfileId ?? throw new ForbiddenException();

        var follow = await _context.Follows
            .FirstOrDefaultAsync(f => f.FollowerId == userId && f.FollowingId == request.TargetUserId, cancellationToken)
            ?? throw new NotFoundException(nameof(Follow), request.TargetUserId);

        _context.Follows.Remove(follow);
        await _context.SaveChangesAsync(cancellationToken);

        await _notificationService.SendAsync(
            request.TargetUserId, NotificationType.NewFollower,
            "отписался от вас", actorId: userId,
            entityType: nameof(UserProfile), entityId: userId,
            cancellationToken: cancellationToken);

        return Unit.Value;
    }
}
