using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TLOM.Domain.Constants;
using TLOM.Domain.Entities;

namespace TLOM.Infrastructure.Persistence.Configurations;

public class EntryEventConfiguration : IEntityTypeConfiguration<EntryEvent>
{
    public void Configure(EntityTypeBuilder<EntryEvent> builder)
    {
        builder.ToTable("EntryEvents");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.Note)
            .HasMaxLength(DomainConstants.MaxEventNoteLength);

        builder.HasIndex(e => e.EntryId);

        builder.HasOne(e => e.Entry)
            .WithMany(entry => entry.Events)
            .HasForeignKey(e => e.EntryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
