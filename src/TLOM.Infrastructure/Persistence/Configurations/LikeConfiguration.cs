using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TLOM.Domain.Entities;

namespace TLOM.Infrastructure.Persistence.Configurations;

public class LikeConfiguration : IEntityTypeConfiguration<Like>
{
    public void Configure(EntityTypeBuilder<Like> builder)
    {
        builder.ToTable("Likes");

        builder.HasKey(l => l.Id);

        // === Уникальный индекс: один лайк на запись от одного юзера ===
        builder.HasIndex(l => new { l.UserId, l.EntryId })
            .IsUnique();

        // === Связи ===
        builder.HasOne(l => l.User)
            .WithMany(u => u.Likes)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(l => l.Entry)
            .WithMany(e => e.Likes)
            .HasForeignKey(l => l.EntryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
