using AutoMapper;
using TLOM.Application.Features.Entries.Responses;
using TLOM.Domain.Entities;

namespace TLOM.Application.Features.Entries.Mappings;

/// <summary>
/// AutoMapper профиль для фичи Entries — маппинг Entity → Response.
/// </summary>
public class EntryMappingProfile : Profile
{
    public EntryMappingProfile()
    {
        CreateMap<Entry, EntryResponse>()
            .ForMember(dest => dest.MediaItemTitle, opt => opt.MapFrom(src => src.MediaItem.Title))
            .ForMember(dest => dest.MediaItemCoverImageUrl, opt => opt.MapFrom(src => src.MediaItem.CoverImageUrl))
            .ForMember(dest => dest.MediaType, opt => opt.MapFrom(src => src.MediaItem.MediaType))
            .ForMember(dest => dest.UserUsername, opt => opt.MapFrom(src => src.User.Username))
            .ForMember(dest => dest.UserAvatarUrl, opt => opt.MapFrom(src => src.User.AvatarUrl))
            .ForMember(dest => dest.LikesCount, opt => opt.MapFrom(src => src.Likes.Count))
            .ForMember(dest => dest.CommentsCount, opt => opt.MapFrom(src => src.Comments.Count))
            .ForMember(dest => dest.Genres, opt => opt.MapFrom(src => src.MediaItem.Genres.Select(g => g.Name).ToList()));

        CreateMap<EntryEvent, EntryEventResponse>();
    }
}
