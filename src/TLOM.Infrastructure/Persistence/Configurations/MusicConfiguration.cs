using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TLOM.Domain.Constants;
using TLOM.Domain.Entities;

namespace TLOM.Infrastructure.Persistence.Configurations;

public class MusicConfiguration : IEntityTypeConfiguration<Music>
{
    public void Configure(EntityTypeBuilder<Music> builder)
    {
        builder.ToTable("MusicTracks");

        builder.Property(m => m.Artist).HasMaxLength(DomainConstants.MaxArtistLength);
        builder.Property(m => m.Album).HasMaxLength(DomainConstants.MaxAlbumLength);

        builder.Property(m => m.Label).HasMaxLength(DomainConstants.MaxLabelLength);
        builder.Property(m => m.Language).HasMaxLength(DomainConstants.MaxLanguageLength);

        builder.Property(m => m.ReleaseType)
            .HasConversion<string>()
            .HasMaxLength(10);
    }
}
