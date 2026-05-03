using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TLOM.Application.Common.Interfaces;

namespace TLOM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IFileStorageService _fileStorage;

    public FilesController(IFileStorageService fileStorage)
    {
        _fileStorage = fileStorage;
    }

    [Authorize]
    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile(IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        using var stream = file.OpenReadStream();
        var url = await _fileStorage.UploadFileAsync(stream, file.FileName, file.ContentType, ct);

        return Ok(new { url });
    }
}
