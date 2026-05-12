using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Features.Social.Responses;

namespace TLOM.Application.Features.Social.Queries.GetEntryComments;

public record GetEntryCommentsQuery : IRequest<List<CommentResponse>>
{
    public Guid EntryId { get; init; }
}

public class GetEntryCommentsQueryHandler : IRequestHandler<GetEntryCommentsQuery, List<CommentResponse>>
{
    private readonly IApplicationDbContext _context;

    public GetEntryCommentsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<CommentResponse>> Handle(GetEntryCommentsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Comments
            .Where(c => c.EntryId == request.EntryId && !c.IsDeleted)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CommentResponse
            {
                Id = c.Id,
                UserId = c.UserId,
                Username = c.User.Username,
                AvatarUrl = c.User.AvatarUrl,
                EntryId = c.EntryId,
                Text = c.Text,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }
}
