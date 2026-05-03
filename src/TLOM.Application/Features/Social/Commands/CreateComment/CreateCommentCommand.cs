using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Features.Social.Responses;
using TLOM.Domain.Constants;
using TLOM.Domain.Entities;
using TLOM.Domain.Enums;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Social.Commands.CreateComment;

public record CreateCommentCommand : IRequest<CommentResponse>
{
    public Guid EntryId { get; init; }
    public string Text { get; init; } = string.Empty;
}

public class CreateCommentCommandValidator : AbstractValidator<CreateCommentCommand>
{
    public CreateCommentCommandValidator()
    {
        RuleFor(x => x.EntryId).NotEmpty();
        RuleFor(x => x.Text)
            .NotEmpty().WithMessage("Текст комментария обязателен.")
            .MinimumLength(DomainConstants.MinCommentTextLength)
            .MaximumLength(DomainConstants.MaxCommentTextLength);
    }
}

public class CreateCommentCommandHandler : IRequestHandler<CreateCommentCommand, CommentResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notificationService;

    public CreateCommentCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, INotificationService notificationService)
    {
        _context = context;
        _currentUser = currentUser;
        _notificationService = notificationService;
    }

    public async Task<CommentResponse> Handle(CreateCommentCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserProfileId ?? throw new ForbiddenException();

        var entry = await _context.Entries
            .FirstOrDefaultAsync(e => e.Id == request.EntryId, cancellationToken)
            ?? throw new NotFoundException(nameof(Entry), request.EntryId);

        if (entry.IsPrivate && entry.UserId != userId)
            throw new ForbiddenException("Нельзя комментировать приватную запись.");

        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            EntryId = request.EntryId,
            Text = request.Text
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync(cancellationToken);

        if (entry.UserId != userId)
        {
            await _notificationService.SendAsync(
                entry.UserId, NotificationType.NewComment,
                "оставил комментарий к вашей записи", actorId: userId,
                entityType: nameof(Entry), entityId: entry.Id,
                cancellationToken: cancellationToken);
        }

        var username = await _context.UserProfiles
            .Where(p => p.Id == userId)
            .Select(p => p.Username)
            .FirstAsync(cancellationToken);

        return new CommentResponse
        {
            Id = comment.Id,
            UserId = userId,
            Username = username,
            EntryId = request.EntryId,
            Text = comment.Text,
            CreatedAt = comment.CreatedAt
        };
    }
}
