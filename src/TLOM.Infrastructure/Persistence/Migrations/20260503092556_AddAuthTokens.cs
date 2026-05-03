using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TLOM.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAuthTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EmailConfirmationToken",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordResetToken",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PasswordResetTokenExpiry",
                table: "Accounts",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailConfirmationToken",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "PasswordResetToken",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "PasswordResetTokenExpiry",
                table: "Accounts");
        }
    }
}
