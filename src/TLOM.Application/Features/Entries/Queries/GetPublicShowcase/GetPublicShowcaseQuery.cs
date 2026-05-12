using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Features.Entries.Responses;

namespace TLOM.Application.Features.Entries.Queries.GetPublicShowcase;

public record GetPublicShowcaseQuery : IRequest<List<EntryResponse>>;

public class GetPublicShowcaseQueryHandler : IRequestHandler<GetPublicShowcaseQuery, List<EntryResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetPublicShowcaseQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<EntryResponse>> Handle(GetPublicShowcaseQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.Entries
            .AsNoTracking()
            .Include(e => e.User)
            .Include(e => e.MediaItem)
            .Include(e => e.Likes)
            .Include(e => e.Comments)
            .Where(e => !e.IsPrivate)
            .OrderByDescending(e => e.CreatedAt)
            .Take(5)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<EntryResponse>>(items);
    }
}
