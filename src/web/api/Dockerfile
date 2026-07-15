FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

RUN apt-get update && apt-get install -y --no-install-recommends \
    clang \
    zlib1g-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY GarethDuncanDevWebApi/GarethDuncanDevWebApi.csproj GarethDuncanDevWebApi/
COPY GarethDuncanDev.Search/GarethDuncanDev.Search.csproj GarethDuncanDev.Search/
RUN dotnet restore GarethDuncanDevWebApi/GarethDuncanDevWebApi.csproj

COPY GarethDuncanDevWebApi/ GarethDuncanDevWebApi/
COPY GarethDuncanDev.Search/ GarethDuncanDev.Search/

RUN dotnet publish GarethDuncanDevWebApi/GarethDuncanDevWebApi.csproj \
    -c Release \
    -r linux-x64 \
    -o /app/publish \
    --self-contained true
