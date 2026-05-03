using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TLOM.Domain.Constants;
using TLOM.Domain.Entities;

namespace TLOM.Infrastructure.Persistence.Configurations;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.ToTable("Accounts");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Email)
            .IsRequired()
            .HasMaxLength(DomainConstants.MaxEmailLength);

        builder.Property(a => a.PasswordHash)
            .HasMaxLength(DomainConstants.MaxPasswordHashLength);

        builder.Property(a => a.GoogleId)
            .HasMaxLength(DomainConstants.MaxGoogleIdLength);

        builder.Property(a => a.RefreshToken)
            .HasMaxLength(DomainConstants.MaxRefreshTokenLength);

        // === Индексы ===
        builder.HasIndex(a => a.Email).IsUnique();
        builder.HasIndex(a => a.GoogleId).IsUnique().HasFilter("[GoogleId] IS NOT NULL");

        // === Связи ===
        builder.HasOne(a => a.Role)
            .WithMany(r => r.Accounts)
            .HasForeignKey(a => a.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.UserProfile)
            .WithOne(p => p.Account)
            .HasForeignKey<UserProfile>(p => p.AccountId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
