# 0005. Persistence and hosting

- Status: Proposed
- Date: 2026-10-12

## Context

Jobcards, workpacks and projects need durable storage; images need file storage. Hosting and
identity depend on company IT (open questions Q1, Q2, Q10).

## Proposal

- PostgreSQL: relational tables for project / workpack / jobcard (for ownership, ordering,
  querying), with steps and images stored as validated JSONB on the jobcard initially.
- Object storage (Azure Blob or S3, matching the hosting choice) for image assets.
- Corporate SSO (OIDC) for authentication.
- Deployed as containers.

## To decide

Confirm hosting provider, SSO provider and data classification with IT, then accept or amend.
