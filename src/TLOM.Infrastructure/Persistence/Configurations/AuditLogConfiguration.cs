using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TLOM.Domain.Constants;
using TLOM.Domain.Entities;

namespace TLOM.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Action)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(10);

        builder.Property(a => a.EntityType)
            .IsRequired()
            .HasMaxLength(DomainConstants.MaxAuditEntityTypeLength);

        builder.Property(a => a.IpAddress)
            .HasMaxLength(DomainConstants.MaxIpAddressLength);

        builder.Property(a => a.UserAgent)
            .HasMaxLength(DomainConstants.MaxUserAgentLength);

        // OldValues/NewValues — JSON без ограничения длины (nvarchar(max))

        // === Индексы для фильтрации в админ-панели ===
        builder.HasIndex(a => a.AccountId);
        builder.HasIndex(a => a.Timestamp);
        builder.HasIndex(a => new { a.EntityType, a.EntityId });

        // === Связь ===
        builder.HasOne(a => a.Account)
            .WithMany(acc => acc.AuditLogs)
            .HasForeignKey(a => a.AccountId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
