using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Features.Users.Responses;
using TLOM.Domain.Entities;
using TLOM.Domain.Exceptions;
using TLOM.Domain.ValueObjects;

namespace TLOM.Application.Features.Users.Commands.UpdateProfile;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, UserProfileResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public UpdateProfileCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, IMapper mapper)
    {
        _context = context;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<UserProfileResponse> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var profileId = _currentUser.UserProfileId
            ?? throw new ForbiddenException();

        var profile = await _context.UserProfiles
            .Include(p => p.Followers).Include(p => p.Following).Include(p => p.Entries)
            .FirstOrDefaultAsync(p => p.Id == profileId, cancellationToken)
            ?? throw new NotFoundException(nameof(UserProfile), profileId);

        profile.FirstName = request.FirstName;
        profile.LastName = request.LastName;
        profile.Bio = request.Bio;
        profile.DateOfBirth = request.DateOfBirth;
        profile.Address = new Address
        {
            City = request.City,
            Country = request.Country,
            Region = request.Region
        };
        
        if (request.AvatarUrl != null)
        {
            profile.AvatarUrl = request.AvatarUrl;
        }

        if (request.IsProfilePrivate.HasValue)
        {
            profile.IsProfilePrivate = request.IsProfilePrivate.Value;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<UserProfileResponse>(profile);
    }
}
