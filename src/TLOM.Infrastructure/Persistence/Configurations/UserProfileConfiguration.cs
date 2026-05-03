using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TLOM.Domain.Constants;
using TLOM.Domain.Entities;

namespace TLOM.Infrastructure.Persistence.Configurations;

public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.ToTable("UserProfiles");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.FirstName)
            .HasMaxLength(DomainConstants.MaxFirstNameLength);

        builder.Property(p => p.LastName)
            .HasMaxLength(DomainConstants.MaxLastNameLength);

        builder.Property(p => p.Username)
            .IsRequired()
            .HasMaxLength(DomainConstants.MaxUsernameLength);

        builder.Property(p => p.Bio)
            .HasMaxLength(DomainConstants.MaxBioLength);

        builder.Property(p => p.AvatarUrl)
            .HasMaxLength(DomainConstants.MaxAvatarUrlLength);

        // === Address как Owned Entity ===
        builder.OwnsOne(p => p.Address, address =>
        {
            address.Property(a => a.City).HasMaxLength(DomainConstants.MaxCityLength).HasColumnName("City");
            address.Property(a => a.Country).HasMaxLength(DomainConstants.MaxCountryLength).HasColumnName("Country");
            address.Property(a => a.Region).HasMaxLength(DomainConstants.MaxRegionLength).HasColumnName("Region");
        });

        // === Индексы ===
        builder.HasIndex(p => p.Username).IsUnique();
        builder.HasIndex(p => p.AccountId).IsUnique();
    }
}
