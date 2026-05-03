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
            .ForMember(dest => dest.LikesCount, opt => opt.MapFrom(src => src.Likes.Count))
            .ForMember(dest => dest.CommentsCount, opt => opt.MapFrom(src => src.Comments.Count));

        CreateMap<EntryEvent, EntryEventResponse>();
    }
}
