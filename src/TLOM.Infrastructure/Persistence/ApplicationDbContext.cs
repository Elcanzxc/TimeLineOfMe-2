using System.Reflection;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Domain.Entities;
using TLOM.Infrastructure.Persistence.Interceptors;
using TLOM.Infrastructure.Persistence.Seed;

namespace TLOM.Infrastructure.Persistence;

/// <summary>
/// Реализация IApplicationDbContext — центральная точка доступа к БД.
/// SQL Server через EF Core Code-First.
/// </summary>
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly AuditableEntityInterceptor _auditableInterceptor;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        AuditableEntityInterceptor auditableInterceptor)
        : base(options)
    {
        _auditableInterceptor = auditableInterceptor;
    }

    // === Identity ===
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Role> Roles => Set<Role>();

    // === Profile ===
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();

    // === Media Content (TPT) ===
    public DbSet<MediaItem> MediaItems => Set<MediaItem>();
    public DbSet<Movie> Movies => Set<Movie>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<Music> MusicTracks => Set<Music>();

    // === Timeline ===
    public DbSet<Entry> Entries => Set<Entry>();
    public DbSet<EntryEvent> EntryEvents => Set<EntryEvent>();

    // === Social ===
    public DbSet<Follow> Follows => Set<Follow>();
    public DbSet<Like> Likes => Set<Like>();
    public DbSet<Comment> Comments => Set<Comment>();

    // === Notifications ===
    public DbSet<Notification> Notifications => Set<Notification>();

    // === Audit ===
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.AddInterceptors(_auditableInterceptor);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Автоматически применяет все IEntityTypeConfiguration из текущей сборки
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Seed-данные
        RoleSeedData.Seed(modelBuilder);

        base.OnModelCreating(modelBuilder);
    }
}
