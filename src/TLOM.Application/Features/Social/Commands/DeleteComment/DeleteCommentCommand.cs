using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Domain.Entities;
using TLOM.Domain.Enums;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Social.Commands.DeleteComment;

public record DeleteCommentCommand(Guid CommentId) : IRequest<Unit>;

public class DeleteCommentCommandHandler : IRequestHandler<DeleteCommentCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _auditService;

    public DeleteCommentCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
    }

    public async Task<Unit> Handle(DeleteCommentCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserProfileId ?? throw new ForbiddenException();

        var comment = await _context.Comments
            .Include(c => c.Entry)
            .FirstOrDefaultAsync(c => c.Id == request.CommentId, cancellationToken)
            ?? throw new NotFoundException(nameof(Comment), request.CommentId);

        // Resource-based: автор комментария, владелец записи, или админ
        if (comment.UserId != userId && comment.Entry.UserId != userId && !_currentUser.IsAdmin)
            throw new ForbiddenException("Вы можете удалять только свои комментарии или комментарии под своими записями.");

        comment.IsDeleted = true;
        comment.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        await _auditService.LogAsync(
            _currentUser.AccountId!.Value, AuditAction.Deleted,
            nameof(Comment), comment.Id,
            oldValues: new { comment.Text, comment.EntryId },
            cancellationToken: cancellationToken);

        return Unit.Value;
    }
}
