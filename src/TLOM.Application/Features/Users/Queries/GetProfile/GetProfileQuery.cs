using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Features.Users.Responses;
using TLOM.Domain.Entities;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Users.Queries.GetProfile;

public record GetProfileQuery(string Username) : IRequest<UserProfileResponse>;

public class GetProfileQueryHandler : IRequestHandler<GetProfileQuery, UserProfileResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetProfileQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<UserProfileResponse> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        var profile = await _context.UserProfiles
            .AsNoTracking()
            .Include(p => p.Followers)
            .Include(p => p.Following)
            .Include(p => p.Entries)
            .FirstOrDefaultAsync(p => p.Username == request.Username, cancellationToken)
            ?? throw new NotFoundException(nameof(UserProfile), request.Username);

        return _mapper.Map<UserProfileResponse>(profile);
    }
}
