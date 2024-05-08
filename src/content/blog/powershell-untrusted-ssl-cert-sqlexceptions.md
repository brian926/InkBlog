---
title: PowerShell Untrusted SSL Cert SqlExceptions
author: Brian Antunes
description: With the latest update to the PowerShell module SqlServer,
  SqlExceptions are thrown if SSL certs are untrusted
tags:
  - PowerShell
  - SQL
  - SSL
category: PowerShell
authorTwitter: ""
date: 2024-05-08T15:57:00.000Z
thumbnail: /src/content/blog/thumbnails/powershellicon.png
---
## The Problem

While running one of my PowerShell scripts, I received an error when running `Invoke-SqlCmd -ServerInstance localhost` against my local SQL Server 2019 Dev Edition. This was odd as I had never had this issue in the past and do not recall the need for a trusted SSL Certificate in the past. The error that was thrown was the following,

```
Invoke-Sqlcmd: A connection was successfully established with the server, but then an error occurred during the login process. (provider: SSL Provider, error: 0 - The certificate chain was issued by an authority that is not trusted.)
```

## The Cause

After some further investigation, it turns out this error is due to the PowerShell module SqlServer Version 22.2 and specifically the SqlClient within it.\
On default in the past, SqlClient connections set **Encrypt** to a value `false` which means connections don't require a trusted certificate to encrypt traffic. However, to provide more secure connections this was recently changed by updating this value to `true`.\
\
[GitHub Merge - Update Encrypt property default value to true](https://github.com/dotnet/SqlClient/pull/1210)

This new behavior now means,
1. The server must be configured with a valid certificate
2. The client must trust this certificate
3. If the above two conditions are not both met, a `SqlException` will be thrown

This also includes connections on development machines where valid certificates are not present.
[Impactful Breaking Changes - Encrypt defaults to true for SQL Server connections](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-7.0/breaking-changes?tabs=v7#encrypt-defaults-to-true-for-sql-server-connections)

This eventually tricked down to PowerShell with this change finally coming to the latest version of `SqlServer`.
[Error message for new "trusted" connections feature](https://github.com/microsoft/SQLServerPSModule/issues/49)

## The Solution

The solution to this varies on the environment, but three recommended ways to proceed are
1. Install a valid certificate on the server, ensuring that it is signed by an authority trusted by your client
2. If a certificate is provided but not trusted by the client, then set `TrustServerCertificate=True` to allow bypassing the normal trust mechanisms.
3. Explicitly add `Encrypt=False` to the connection string

> [!WARNING]
> Options 2 & 3 will leave your server insecure as traffic isn't encrypted

As for PowerShell, you can add the `TrustServerCertificate` which is new in v22. This indicates whether the channel will be encrypted but will bypassing walking the certificate chain to validate trust. Thus, self-signed certificates will be trusted even though they're not signed by a trusted CA. So the completely command will look like the following when running against your own localhost,

`Invoke-SqlCmd -ServerInstance localhost -Query $addUserQuery -TrustServerCertificate`
