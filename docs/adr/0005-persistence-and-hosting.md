# 0005. Persistence and hosting

- Status: Accepted
- Date: 2026-10-12, accepted 2026-10-16

## Context

Projects, workpacks and jobcards need durable storage; images (R6, later) will need file storage.
Hosting and identity depend on company IT (open questions Q1, Q2, Q10). Answers from 2026-10-16:

- The company hosts apps as Docker containers on Azure. IT provides no database (Q1).
- Identity is Microsoft Entra ID (Q2).
- About 4 authors, no live co-editing (Q4); no offline editing (Q5).
- Dries maintains the app for now; it may be outsourced later (Q11).
- Data classification is assumed Confidential, to confirm before go-live (Q10).

## Decision

- Deployed as Docker containers on the company's Azure container platform. Keep the app
  cloud-neutral (plain containers, standard PostgreSQL), so a change of platform stays cheap.
- PostgreSQL, as the managed service Azure Database for PostgreSQL, owned by the app. Relational
  tables for project / workpack / jobcard (for ownership, ordering, querying), with activities
  stored as validated JSONB on the jobcard initially.
- Concurrent edits: optimistic locking. A save fails with a conflict when the jobcard changed since
  it was loaded; the user reloads. No real-time collaboration.
- Microsoft Entra ID (OIDC) for authentication; access limited to project members.
- Data in an EU Azure region (assumption from Q10).
- Object storage (Azure Blob Storage) for image assets, when R6 is picked up.
- Managed Azure services only, so there are no servers to patch for a single maintainer.
- The data team's Databricks / Microsoft Fabric platform consumes jobcard data through the later
  read API / export; it is not the app's store.

## Consequences

- IT registers the app in Entra ID and decides which users get access.
- Retention and classification (Q10) must be confirmed before go-live; they may add an audit log,
  longer backups or archive-instead-of-delete.
