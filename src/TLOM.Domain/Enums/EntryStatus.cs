namespace TLOM.Domain.Enums;

/// <summary>
/// Статусы записи (Entry) в таймлайне.
/// </summary>
public enum EntryStatus
{
    Planned = 0,
    InProgress = 1,
    Completed = 2,
    Dropped = 3,
    OnHold = 4
}
