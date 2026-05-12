using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TLOM.Domain.Constants;
using TLOM.Domain.Entities;

namespace TLOM.Infrastructure.Persistence.Configurations;

public class MediaItemConfiguration : IEntityTypeConfiguration<MediaItem>
{
    public void Configure(EntityTypeBuilder<MediaItem> builder)
    {
        // TPT — каждый наследник получает свою таблицу
        builder.UseTptMappingStrategy();

        builder.ToTable("MediaItems");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Title)
            .IsRequired()
            .HasMaxLength(DomainConstants.MaxTitleLength);

        builder.Property(m => m.OriginalTitle)
            .HasMaxLength(DomainConstants.MaxOriginalTitleLength);

        builder.Property(m => m.Description)
            .HasMaxLength(DomainConstants.MaxDescriptionLength);

        builder.Property(m => m.CoverImageUrl)
            .HasMaxLength(DomainConstants.MaxCoverImageUrlLength);

        builder.Property(m => m.GlobalRating)
            .HasPrecision(3, 1);

        builder.Property(m => m.ExternalId)
            .IsRequired()
            .HasMaxLength(DomainConstants.MaxExternalIdLength);

        builder.Property(m => m.ExternalSource)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(m => m.MediaType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(10);

        // === Уникальный индекс: один контент в БД в единственном экземпляре ===
        builder.HasIndex(m => new { m.ExternalId, m.ExternalSource })
            .IsUnique();

        // === Связи ===
        builder.HasMany(m => m.Genres)
            .WithMany(g => g.MediaItems)
            .UsingEntity(j => j.ToTable("MediaItemGenres"));
    }
}
