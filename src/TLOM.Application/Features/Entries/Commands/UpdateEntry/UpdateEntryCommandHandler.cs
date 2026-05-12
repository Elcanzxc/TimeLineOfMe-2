using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Features.Entries.Responses;
using TLOM.Domain.Entities;
using TLOM.Domain.Enums;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Entries.Commands.UpdateEntry;

public class UpdateEntryCommandHandler : IRequestHandler<UpdateEntryCommand, EntryResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _auditService;
    private readonly ICacheService _cacheService;
    private readonly IMapper _mapper;

    public UpdateEntryCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IAuditService auditService,
        ICacheService cacheService,
        IMapper mapper)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
        _cacheService = cacheService;
        _mapper = mapper;
    }

    public async Task<EntryResponse> Handle(UpdateEntryCommand request, CancellationToken cancellationToken)
    {
        var userProfileId = _currentUser.UserProfileId
            ?? throw new ForbiddenException("Пользователь не аутентифицирован.");

        var entry = await _context.Entries
            .Include(e => e.MediaItem)
            .Include(e => e.Events)
            .Include(e => e.Likes)
            .Include(e => e.Comments)
            .FirstOrDefaultAsync(e => e.Id == request.EntryId, cancellationToken)
            ?? throw new NotFoundException(nameof(Entry), request.EntryId);

        // Resource-based авторизация: только владелец может менять статус
        if (entry.UserId != userProfileId)
        {
            throw new ForbiddenException("Вы можете изменять только свои записи.");
        }

        var oldStatus = entry.Status;
        
        var oldValues = new { 
            Status = entry.Status, 
            Rating = entry.Rating, 
            Review = entry.Review, 
            IsPrivate = entry.IsPrivate 
        };

        // Обновляем поля Entry
        entry.Status = request.Status;
        entry.Rating = request.Rating;
        entry.Review = request.Review;
        entry.IsPrivate = request.IsPrivate;
        entry.StartedAt = request.StartedAt;
        entry.FinishedAt = request.FinishedAt;

        // Если статус изменился, создаём событие
        if (oldStatus != request.Status)
        {
            var entryEvent = new EntryEvent
            {
                Id = Guid.NewGuid(),
                EntryId = entry.Id,
                Status = request.Status,
                DateTime = DateTime.UtcNow,
                Note = request.Review
            };
            _context.EntryEvents.Add(entryEvent);
        }

        await _context.SaveChangesAsync(cancellationToken);

        var newValues = new { 
            Status = request.Status, 
            Rating = request.Rating, 
            Review = request.Review, 
            IsPrivate = request.IsPrivate 
        };

        // Аудит-лог
        await _auditService.LogAsync(
            _currentUser.AccountId!.Value,
            AuditAction.Updated,
            nameof(Entry),
            entry.Id,
            oldValues: oldValues,
            newValues: newValues,
            cancellationToken: cancellationToken);

        // Инвалидация кэша
        await _cacheService.RemoveByPatternAsync($"entries:user:{userProfileId}*", cancellationToken);

        return _mapper.Map<EntryResponse>(entry);
    }
}
