IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Hospitales] (
    [Id] int NOT NULL IDENTITY,
    [Nombre] nvarchar(150) NOT NULL,
    [Ciudad] nvarchar(100) NOT NULL,
    CONSTRAINT [PK_Hospitales] PRIMARY KEY ([Id])
);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261108204441_InitialCreate', N'10.0.14');

COMMIT;
GO

