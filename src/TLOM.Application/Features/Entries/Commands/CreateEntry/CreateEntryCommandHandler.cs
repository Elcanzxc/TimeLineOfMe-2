using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Features.Entries.Responses;
using TLOM.Domain.Entities;
using TLOM.Domain.Enums;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Entries.Commands.CreateEntry;

/// <summary>
/// Handler для CreateEntryCommand.
/// Бизнес-логика: проверка MediaItem, создание Entry + первый EntryEvent,
/// запись AuditLog, отправка Notification админам, инвалидация кэша.
/// </summary>
public class CreateEntryCommandHandler : IRequestHandler<CreateEntryCommand, EntryResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _auditService;
    private readonly INotificationService _notificationService;
    private readonly ICacheService _cacheService;
    private readonly IMapper _mapper;

    public CreateEntryCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IAuditService auditService,
        INotificationService notificationService,
        ICacheService cacheService,
        IMapper mapper)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
        _notificationService = notificationService;
        _cacheService = cacheService;
        _mapper = mapper;
    }

    public async Task<EntryResponse> Handle(CreateEntryCommand request, CancellationToken cancellationToken)
    {
        var userProfileId = _currentUser.UserProfileId
            ?? throw new ForbiddenException("Пользователь не аутентифицирован.");

        // Проверяем существование MediaItem
        var mediaItemExists = await _context.MediaItems
            .AnyAsync(m => m.Id == request.MediaItemId, cancellationToken);

        if (!mediaItemExists)
        {
            throw new NotFoundException(nameof(MediaItem), request.MediaItemId);
        }

        // Проверяем дубликат: нельзя добавить один и тот же MediaItem дважды
        var alreadyExists = await _context.Entries
            .AnyAsync(e => e.UserId == userProfileId && e.MediaItemId == request.MediaItemId, cancellationToken);

        if (alreadyExists)
        {
            throw new ConflictException("Этот контент уже добавлен в ваш таймлайн.");
        }

        var entry = new Entry
        {
            Id = Guid.NewGuid(),
            UserId = userProfileId,
            MediaItemId = request.MediaItemId,
            Status = request.Status ?? EntryStatus.Planned,
            IsPrivate = request.IsPrivate,
            IsFavorite = false,
            Rating = request.Rating,
            Review = request.Review,
            StartedAt = request.StartedAt,
            FinishedAt = request.FinishedAt
        };

        var entryEvent = new EntryEvent
        {
            Id = Guid.NewGuid(),
            EntryId = entry.Id,
            Status = entry.Status,
            DateTime = DateTime.UtcNow,
            Note = request.Note ?? request.Review
        };

        _context.Entries.Add(entry);
        _context.EntryEvents.Add(entryEvent);
        await _context.SaveChangesAsync(cancellationToken);

        // Аудит-лог
        await _auditService.LogAsync(
            _currentUser.AccountId!.Value,
            AuditAction.Created,
            nameof(Entry),
            entry.Id,
            newValues: new { entry.MediaItemId, entry.Status },
            cancellationToken: cancellationToken);

        // Уведомление админам
        await _notificationService.SendToAdminsAsync(
            $"Пользователь добавил новую запись в таймлайн",
            actorId: userProfileId,
            entityType: nameof(Entry),
            entityId: entry.Id,
            cancellationToken: cancellationToken);

        // Инвалидация кэша
        await _cacheService.RemoveByPatternAsync($"entries:user:{userProfileId}*", cancellationToken);
        await _cacheService.RemoveByPatternAsync($"stats:user:{userProfileId}*", cancellationToken);

        // Загружаем Entry с навигациями для маппинга
        var createdEntry = await _context.Entries
            .Include(e => e.MediaItem)
            .Include(e => e.Events)
            .Include(e => e.Likes)
            .Include(e => e.Comments)
            .FirstAsync(e => e.Id == entry.Id, cancellationToken);

        return _mapper.Map<EntryResponse>(createdEntry);
    }
}
