# News Analysis Module Implementation Plan

This plan details the implementation of a production-ready News Analysis Module for your AI-powered Fake News Detection Platform.

## User Review Required

> [!WARNING]
> Please verify the target directory. Your current workspace is `student-management-system`. Do you want me to create these files in `d:\Lectures\Semester 5\CSE3032 - Software Process Management\student-management-system\src` or in a different location?

> [!IMPORTANT]
> The implementation uses `zod` for validation, `bullmq` for queues, and `@google/genai` (or `@google/generative-ai`) for Gemini API. Ensure these packages are installed in your project.

## Open Questions

- What is the path to your existing `auth` middleware so I can properly import it in the routes file?
- Are you using the official `@google/generative-ai` SDK, or making direct REST calls to the Gemini API?
- Do you have an existing Redis connection file to reuse for BullMQ, or should I create a new Redis connection setup?

## Proposed Changes

### Core Types & Constants
#### [NEW] `src/modules/news-analysis/news-analysis.constants.ts`
Constants for classification types, risk levels, processing statuses, and queue names.
#### [NEW] `src/modules/news-analysis/news-analysis.types.ts`
TypeScript interfaces for the DB schema, job payloads, and API responses.

### Data Access Layer
#### [NEW] `src/modules/news-analysis/news-analysis.model.ts`
Mongoose schema definition with specified fields and indexes.
#### [NEW] `src/modules/news-analysis/news-analysis.repository.ts`
Repository class abstracting MongoDB operations (create, findById, update, etc.).

### Business Logic & Validation
#### [NEW] `src/modules/news-analysis/news-analysis.dto.ts`
Data Transfer Objects interfaces.
#### [NEW] `src/modules/news-analysis/news-analysis.validators.ts`
Zod schemas for validating incoming requests.
#### [NEW] `src/modules/news-analysis/news-analysis.service.ts`
Main service handling business logic, DB interactions via Repository, and enqueuing jobs to BullMQ.

### API Layer
#### [NEW] `src/modules/news-analysis/news-analysis.controller.ts`
Controller handling HTTP requests and formatting standard API responses.
#### [NEW] `src/modules/news-analysis/news-analysis.routes.ts`
Express router definitions and auth middleware integration.

### Background Processing & AI Integration
#### [NEW] `src/queue/news-analysis.queue.ts`
BullMQ queue initialization and configuration.
#### [NEW] `src/jobs/workers/news-analysis.worker.ts`
BullMQ worker processing the queue, updating status, calling Gemini, and saving results.
#### [NEW] `src/services/ai/gemini.service.ts`
Service responsible for constructing prompts and communicating with the Gemini API.

## Verification Plan

### Automated Tests
- Unit tests can be added later using Jest to test validation logic, service business rules, and worker processing logic.

### Manual Verification
- Send a POST request to `/api/v1/news-analysis` with valid and invalid content.
- Monitor Redis/BullMQ to ensure the job is enqueued and processed.
- Verify the DB document status transitions from `PENDING` -> `PROCESSING` -> `COMPLETED`.
- Verify the Gemini API returns valid JSON and updates the DB.
