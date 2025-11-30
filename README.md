# Fragments Lab 9 – AWS S3 Integration

This project implements a fragments storage service with AWS S3 as the backend for fragment data and metadata, including full CRUD operations and integration with ECS and CI/CD workflows. It demonstrates using the AWS SDK, LocalStack for local development, and automated testing.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Local Development](#local-development)
5. [Integration Tests](#integration-tests)
6. [AWS Deployment](#aws-deployment)
7. [Optional MinIO Support](#optional-minio-support)
8. [Environment Variables](#environment-variables)
9. [Running the Project](#running-the-project)
10. [License](#license)

---

## Overview

This project allows users to create, read, update, and delete fragments (text or binary data). The service stores metadata and fragment data in AWS S3, providing a scalable and durable storage backend.

Key goals of this lab:

- Move fragment storage from in-memory databases to S3
- Support integration tests for CRUD operations
- Enable local testing with LocalStack
- Configure ECS deployment with IAM roles

---

## Features

- **Fragment Storage in S3:** All fragment data and metadata is persisted in S3 buckets.
- **CRUD API:** RESTful endpoints for creating, retrieving, deleting fragments.
- **LocalStack Support:** Test AWS S3 operations locally with Docker.
- **CI/CD Integration:** Automated build and deployment using GitHub Actions and ECS.
- **IAM Roles:** ECS tasks assume a role for secure access to AWS resources.

---

## Architecture

- **Data Layer:**
  - `s3Client` abstracts interactions with S3.
  - Metadata is stored as JSON objects, fragment data as raw bytes.

**API Layer:**

- Express.js handles multiple endpoints under `/v1/fragments`:
  - `POST /v1/fragments` – Create a new fragment. Supports `text/*` and `application/json` content types. Unit tests included.
  - `GET /v1/fragments` – List all fragment IDs for an authenticated user.
    - `GET /v1/fragments?expand=1` returns expanded fragment metadata.
  - `GET /v1/fragments/:id` – Retrieve an existing fragment's data with the correct `Content-Type`. Unit tests included.
  - `GET /v1/fragments/:id/info` – Retrieve only the metadata of an existing fragment. Unit tests included.
  - `GET /v1/fragments/:id.ext` – Retrieve a fragment’s data converted to a supported type. Initially supports only text/JSON.
  - `DELETE /v1/fragments/:id` – Delete a fragment’s data and metadata. Unit tests included.

- Additional behaviors:
  - Reject unauthenticated requests
  - Reject unsupported content types
  - Handle fragments with different charsets
  - Health-check endpoint (`GET /v1/health`)

- **Authentication:** Uses basic authentication to verify users.

- **Integration Tests:**
  - Hurl tests

- **Deployment:**
  - Docker image built and pushed to Amazon ECR.
  - ECS Task Definition references ECR image and uses IAM LabRole for permissions.

---

## Local Development

1. **Start LocalStack and DynamoDB:**

```bash
docker compose up --build -d
```

2. **Seed S3 bucket and DynamoDB table:**

```bash
./scripts/local-aws-setup.sh
```

3. **Start fragments server:**

```bash
docker compose up --build --no-deps -d fragments
```

4. **Run integration tests:**

```bash
npm run test:integration
```

## Integration Tests

## Integration Tests

The project includes multiple integration tests to ensure that all API endpoints work correctly with S3 as the backend. Tests are implemented using Hurl and cover authentication, CRUD operations, content types, and health checks.

- **tests/integration/post-fragments-unauthenticated.hurl** – verifies that unauthenticated requests are rejected.
- **tests/integration/404.hurl** – checks that non-existent fragment requests return a 404.
- **tests/integration/post-fragments-json.hurl** – tests creating and retrieving JSON fragments .
- **tests/integration/post-fragments-unsupported-type.hurl** – verifies that unsupported content types are handled properly.
- **tests/integration/post-fragments-charset.hurl** – tests fragments with different character sets.
- **tests/integration/health-check.hurl** – ensures the server health-check endpoint works.
- **tests/integration/post-fragments.hurl** – tests standard fragment creation and retrieval.
- **tests/integration/lab-9-s3.hurl** – performs full Lab 9 workflow: POST → GET → DELETE → GET sequence on a fragment stored in S3.

## AWS Deployment

- Push Docker image to ECR via GitHub Actions workflow (cd.yml).
- **Task Definition:**
  - fragments-definition.json references the pushed image.
  - Environment variables include LOG_LEVEL, NODE_ENV, and AWS_S3_BUCKET_NAME.
  - Both executionRoleArn and taskRoleArn use LabRole.
