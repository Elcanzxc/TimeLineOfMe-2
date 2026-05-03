using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TLOM.Application.Common.Interfaces;
using TLOM.Application.Features.Entries.Responses;
using TLOM.Domain.Entities;
using TLOM.Domain.Enums;
using TLOM.Domain.Exceptions;

namespace TLOM.Application.Features.Entries.Commands.UpdateEntryStatus;

public class UpdateEntryStatusCommandHandler : IRequestHandler<UpdateEntryStatusCommand, EntryResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _auditService;
    private readonly ICacheService _cacheService;
    private readonly IMapper _mapper;

    public UpdateEntryStatusCommandHandler(
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

    public async Task<EntryResponse> Handle(UpdateEntryStatusCommand request, CancellationToken cancellationToken)
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

        // Обновляем статус Entry
        entry.Status = request.NewStatus;

        // Создаём новый EntryEvent — хронология сохраняется навсегда
        var entryEvent = new EntryEvent
        {
            Id = Guid.NewGuid(),
            EntryId = entry.Id,
            Status = request.NewStatus,
            DateTime = DateTime.UtcNow,
            Note = request.Note
        };

        _context.EntryEvents.Add(entryEvent);
        await _context.SaveChangesAsync(cancellationToken);

        // Аудит-лог
        await _auditService.LogAsync(
            _currentUser.AccountId!.Value,
            AuditAction.Updated,
            nameof(Entry),
            entry.Id,
            oldValues: new { Status = oldStatus },
            newValues: new { Status = request.NewStatus },
            cancellationToken: cancellationToken);

        // Инвалидация кэша
        await _cacheService.RemoveByPatternAsync($"entries:user:{userProfileId}*", cancellationToken);

        return _mapper.Map<EntryResponse>(entry);
    }
}
