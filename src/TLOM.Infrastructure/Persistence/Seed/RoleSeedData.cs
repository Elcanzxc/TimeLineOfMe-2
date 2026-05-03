using Microsoft.EntityFrameworkCore;
using TLOM.Domain.Entities;
using TLOM.Domain.Enums;

namespace TLOM.Infrastructure.Persistence.Seed;

/// <summary>
/// Seed-данные для ролей — User и Admin.
/// Фиксированные Guid обеспечивают идемпотентность миграций.
/// </summary>
public static class RoleSeedData
{
    public static readonly Guid UserRoleId = Guid.Parse("00000000-0000-0000-0000-000000000001");
    public static readonly Guid AdminRoleId = Guid.Parse("00000000-0000-0000-0000-000000000002");

    public static void Seed(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = UserRoleId, Name = RoleName.User },
            new Role { Id = AdminRoleId, Name = RoleName.Admin }
        );
    }
}
