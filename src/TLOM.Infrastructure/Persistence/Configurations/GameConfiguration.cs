using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TLOM.Domain.Constants;
using TLOM.Domain.Entities;

namespace TLOM.Infrastructure.Persistence.Configurations;

public class GameConfiguration : IEntityTypeConfiguration<Game>
{
    public void Configure(EntityTypeBuilder<Game> builder)
    {
        builder.ToTable("Games");

        builder.Property(g => g.Developer).HasMaxLength(DomainConstants.MaxDeveloperLength);
        builder.Property(g => g.Publisher).HasMaxLength(DomainConstants.MaxPublisherLength);
        builder.Property(g => g.Platform).HasMaxLength(DomainConstants.MaxPlatformLength);

        builder.Property(g => g.AgeRating).HasMaxLength(DomainConstants.MaxAgeRatingLength);
        builder.Property(g => g.Engine).HasMaxLength(DomainConstants.MaxEngineLength);
    }
}
