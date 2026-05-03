using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TLOM.Domain.Constants;
using TLOM.Domain.Entities;

namespace TLOM.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(n => n.EntityType)
            .HasMaxLength(DomainConstants.MaxEntityTypeLength);

        builder.Property(n => n.Message)
            .IsRequired()
            .HasMaxLength(DomainConstants.MaxNotificationMessageLength);

        // === Индексы для быстрой выборки ===
        builder.HasIndex(n => new { n.RecipientId, n.IsRead, n.CreatedAt });

        // === Связи ===
        builder.HasOne(n => n.Recipient)
            .WithMany(u => u.ReceivedNotifications)
            .HasForeignKey(n => n.RecipientId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(n => n.Actor)
            .WithMany(u => u.TriggeredNotifications)
            .HasForeignKey(n => n.ActorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
