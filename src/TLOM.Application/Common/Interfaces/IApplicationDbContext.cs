using Microsoft.EntityFrameworkCore;
using TLOM.Domain.Entities;

namespace TLOM.Application.Common.Interfaces;

/// <summary>
/// Абстракция доступа к данным — реализуется в Infrastructure через EF Core DbContext.
/// Выступает как Repository + Unit of Work (DbContext уже реализует оба паттерна).
/// </summary>
public interface IApplicationDbContext
{
    // === Identity ===
    DbSet<Account> Accounts { get; }
    DbSet<Role> Roles { get; }

    // === Profile ===
    DbSet<UserProfile> UserProfiles { get; }

    // === Media Content (TPT) ===
    DbSet<MediaItem> MediaItems { get; }
    DbSet<Movie> Movies { get; }
    DbSet<Book> Books { get; }
    DbSet<Game> Games { get; }
    DbSet<Music> MusicTracks { get; }

    // === Timeline ===
    DbSet<Entry> Entries { get; }
    DbSet<EntryEvent> EntryEvents { get; }

    // === Social ===
    DbSet<Follow> Follows { get; }
    DbSet<Like> Likes { get; }
    DbSet<Comment> Comments { get; }

    // === Notifications ===
    DbSet<Notification> Notifications { get; }

    // === Audit ===
    DbSet<AuditLog> AuditLogs { get; }

    /// <summary>
    /// Сохранение всех изменений в БД.
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
