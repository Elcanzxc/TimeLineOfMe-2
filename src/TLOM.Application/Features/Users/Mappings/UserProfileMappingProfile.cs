using AutoMapper;
using TLOM.Application.Features.Users.Responses;
using TLOM.Domain.Entities;

namespace TLOM.Application.Features.Users.Mappings;

public class UserProfileMappingProfile : Profile
{
    public UserProfileMappingProfile()
    {
        CreateMap<UserProfile, UserProfileResponse>()
            .ForMember(d => d.City, o => o.MapFrom(s => s.Address != null ? s.Address.City : null))
            .ForMember(d => d.Country, o => o.MapFrom(s => s.Address != null ? s.Address.Country : null))
            .ForMember(d => d.Region, o => o.MapFrom(s => s.Address != null ? s.Address.Region : null))
            .ForMember(d => d.FollowersCount, o => o.MapFrom(s => s.Followers.Count))
            .ForMember(d => d.FollowingCount, o => o.MapFrom(s => s.Following.Count))
            .ForMember(d => d.EntriesCount, o => o.MapFrom(s => s.Entries.Count));
    }
}
