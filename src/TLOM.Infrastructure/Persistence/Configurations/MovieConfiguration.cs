using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TLOM.Domain.Constants;
using TLOM.Domain.Entities;

namespace TLOM.Infrastructure.Persistence.Configurations;

public class MovieConfiguration : IEntityTypeConfiguration<Movie>
{
    public void Configure(EntityTypeBuilder<Movie> builder)
    {
        builder.ToTable("Movies");

        builder.Property(m => m.Director).HasMaxLength(DomainConstants.MaxDirectorLength);
        builder.Property(m => m.Cast).HasMaxLength(DomainConstants.MaxCastLength);
        builder.Property(m => m.Country).HasMaxLength(DomainConstants.MaxCountryNameLength);
        builder.Property(m => m.Language).HasMaxLength(DomainConstants.MaxLanguageLength);

        builder.Property(m => m.Budget).HasPrecision(18, 2);
        builder.Property(m => m.TrailerUrl).HasMaxLength(DomainConstants.MaxTrailerUrlLength);
    }
}
