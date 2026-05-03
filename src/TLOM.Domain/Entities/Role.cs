using TLOM.Domain.Common;
using TLOM.Domain.Enums;

namespace TLOM.Domain.Entities;

/// <summary>
/// Роль пользователя (User, Admin). Управление доступом к контенту и модерации.
/// </summary>
public class Role : BaseEntity
{
    public RoleName Name { get; set; }

    // === Navigation Properties ===
    public ICollection<Account> Accounts { get; set; } = [];
}
