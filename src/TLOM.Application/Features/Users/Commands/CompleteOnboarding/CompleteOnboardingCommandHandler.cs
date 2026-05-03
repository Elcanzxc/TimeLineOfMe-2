using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Features.Users.Responses;
using TLOM.Domain.Entities;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Users.Commands.CompleteOnboarding;

public class CompleteOnboardingCommandHandler : IRequestHandler<CompleteOnboardingCommand, UserProfileResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public CompleteOnboardingCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, IMapper mapper)
    {
        _context = context;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<UserProfileResponse> Handle(CompleteOnboardingCommand request, CancellationToken cancellationToken)
    {
        var profileId = _currentUser.UserProfileId
            ?? throw new ForbiddenException();

        var profile = await _context.UserProfiles
            .Include(p => p.Followers).Include(p => p.Following).Include(p => p.Entries)
            .FirstOrDefaultAsync(p => p.Id == profileId, cancellationToken)
            ?? throw new NotFoundException(nameof(UserProfile), profileId);

        if (profile.IsProfileCompleted)
        {
            throw new DomainValidationException(new Dictionary<string, string[]>
            {
                { "Profile", new[] { "Onboarding has already been completed." } }
            });
        }

        // Verify username uniqueness
        if (profile.Username != request.Username)
        {
            bool usernameExists = await _context.UserProfiles
                .AnyAsync(p => p.Username == request.Username && p.Id != profileId, cancellationToken);
            
            if (usernameExists)
            {
                throw new DomainValidationException(new Dictionary<string, string[]>
                {
                    { "Username", new[] { "This username is already taken." } }
                });
            }
            profile.Username = request.Username;
        }

        profile.Bio = request.Bio;
        profile.FirstName = request.FirstName;
        profile.LastName = request.LastName;
        profile.DateOfBirth = request.DateOfBirth;
        if (!string.IsNullOrEmpty(request.AvatarUrl))
        {
            profile.AvatarUrl = request.AvatarUrl;
        }

        profile.IsProfileCompleted = true;

        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<UserProfileResponse>(profile);
    }
}
