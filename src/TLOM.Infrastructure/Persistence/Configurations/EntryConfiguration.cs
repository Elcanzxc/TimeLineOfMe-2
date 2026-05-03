using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TLOM.Domain.Constants;
using TLOM.Domain.Entities;

namespace TLOM.Infrastructure.Persistence.Configurations;

public class EntryConfiguration : IEntityTypeConfiguration<Entry>
{
    public void Configure(EntityTypeBuilder<Entry> builder)
    {
        builder.ToTable("Entries");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.Review)
            .HasMaxLength(DomainConstants.MaxReviewLength);

        // === Уникальный индекс: один Entry на пользователя на контент ===
        builder.HasIndex(e => new { e.UserId, e.MediaItemId })
            .IsUnique();

        // === Индексы для фильтрации ===
        builder.HasIndex(e => e.UserId);
        builder.HasIndex(e => e.Status);

        // === Связи ===
        builder.HasOne(e => e.User)
            .WithMany(u => u.Entries)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.MediaItem)
            .WithMany(m => m.Entries)
            .HasForeignKey(e => e.MediaItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
