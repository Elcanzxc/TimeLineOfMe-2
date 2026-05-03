FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/TLOM.API/TLOM.API.csproj", "src/TLOM.API/"]
COPY ["src/TLOM.Application/TLOM.Application.csproj", "src/TLOM.Application/"]
COPY ["src/TLOM.Domain/TLOM.Domain.csproj", "src/TLOM.Domain/"]
COPY ["src/TLOM.Infrastructure/TLOM.Infrastructure.csproj", "src/TLOM.Infrastructure/"]
RUN dotnet restore "src/TLOM.API/TLOM.API.csproj"

COPY . .
WORKDIR "/src/src/TLOM.API"
RUN dotnet build "TLOM.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TLOM.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TLOM.API.dll"]
