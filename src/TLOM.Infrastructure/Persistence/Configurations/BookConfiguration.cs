using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TLOM.Domain.Constants;
using TLOM.Domain.Entities;

namespace TLOM.Infrastructure.Persistence.Configurations;

public class BookConfiguration : IEntityTypeConfiguration<Book>
{
    public void Configure(EntityTypeBuilder<Book> builder)
    {
        builder.ToTable("Books");

        builder.Property(b => b.Author).HasMaxLength(DomainConstants.MaxAuthorLength);

        builder.Property(b => b.Publisher).HasMaxLength(DomainConstants.MaxPublisherLength);
        builder.Property(b => b.ISBN).HasMaxLength(DomainConstants.MaxIsbnLength);
        builder.Property(b => b.Language).HasMaxLength(DomainConstants.MaxLanguageLength);
        builder.Property(b => b.Series).HasMaxLength(DomainConstants.MaxSeriesLength);
    }
}
