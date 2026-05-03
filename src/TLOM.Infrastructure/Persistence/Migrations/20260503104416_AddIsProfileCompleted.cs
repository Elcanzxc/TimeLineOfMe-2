using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TLOM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddIsProfileCompleted : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsProfileCompleted",
                table: "UserProfiles",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsProfileCompleted",
                table: "UserProfiles");
        }
    }
}
