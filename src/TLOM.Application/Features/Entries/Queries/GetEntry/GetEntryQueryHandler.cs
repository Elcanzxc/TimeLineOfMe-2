using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Features.Entries.Responses;
using TLOM.Domain.Entities;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Entries.Queries.GetEntry;

public class GetEntryQueryHandler : IRequestHandler<GetEntryQuery, EntryResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public GetEntryQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _context = context;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<EntryResponse> Handle(GetEntryQuery request, CancellationToken cancellationToken)
    {
        var entry = await _context.Entries
            .AsNoTracking()
            .Include(e => e.MediaItem)
            .Include(e => e.Events.OrderBy(ev => ev.DateTime))
            .Include(e => e.Likes)
            .Include(e => e.Comments)
            .FirstOrDefaultAsync(e => e.Id == request.EntryId, cancellationToken)
            ?? throw new NotFoundException(nameof(Entry), request.EntryId);

        // Приватные записи видны только владельцу
        if (entry.IsPrivate && entry.UserId != _currentUser.UserProfileId)
        {
            throw new NotFoundException(nameof(Entry), request.EntryId);
        }

        return _mapper.Map<EntryResponse>(entry);
    }
}
