using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TLOM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEntryDates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "FinishedAt",
                table: "Entries",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartedAt",
                table: "Entries",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FinishedAt",
                table: "Entries");

            migrationBuilder.DropColumn(
                name: "StartedAt",
                table: "Entries");
        }
    }
}
