# CodeLens API Documentation

## Overview

The CodeLens API provides endpoints for analyzing codebases, generating documentation, and exporting results in various formats.

**Base URL**: `http://localhost:3001/api`

---

## Authentication

Currently, the API does not require authentication. This may change in future versions.

---

## Endpoints

### Analysis

#### POST /analyze

Analyze a codebase and extract documentation metadata.

**Request Body:**
```json
{
  "path": "/path/to/project",
  "options": {
    "languages": ["typescript", "javascript", "python"],
    "includeTests": false,
    "maxDepth": 10
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [...],
    "modules": [...],
    "dependencies": {...},
    "metrics": {...}
  }
}
```

#### GET /analyze/:id

Retrieve analysis results by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "analysis-123",
    "status": "completed",
    "results": {...}
  }
}
```

---

### Documentation Generation

#### POST /generate

Generate documentation from analysis results.

**Request Body:**
```json
{
  "analysisId": "analysis-123",
  "format": "html",
  "options": {
    "includeDiagrams": true,
    "theme": "dark"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentationUrl": "/docs/analysis-123",
    "generatedAt": "2026-01-28T14:00:00Z"
  }
}
```

---

### Export

#### POST /export

Export documentation in various formats.

**Request Body:**
```json
{
  "documentationId": "doc-123",
  "format": "pdf",
  "options": {
    "includeSourceCode": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "/downloads/doc-123.pdf"
  }
}
```

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {...}
  }
}
```

### Common Error Codes

- `INVALID_PATH` - The provided path is invalid or inaccessible
- `ANALYSIS_FAILED` - Code analysis encountered an error
- `GENERATION_FAILED` - Documentation generation failed
- `EXPORT_FAILED` - Export operation failed
- `NOT_FOUND` - Requested resource not found

---

## Rate Limiting

Currently no rate limiting is implemented. This may change in production.

---

## WebSocket Events

The API supports real-time updates via WebSocket connections.

**Connection URL**: `ws://localhost:3001/ws`

### Events

#### `analysis:progress`
Emitted during code analysis with progress updates.

```json
{
  "event": "analysis:progress",
  "data": {
    "percentage": 45,
    "currentFile": "src/components/App.tsx"
  }
}
```

#### `generation:complete`
Emitted when documentation generation is complete.

```json
{
  "event": "generation:complete",
  "data": {
    "documentationId": "doc-123"
  }
}
```

---

## Examples

### Analyze a TypeScript Project

```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/path/to/project",
    "options": {
      "languages": ["typescript"]
    }
  }'
```

### Generate HTML Documentation

```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "analysis-123",
    "format": "html"
  }'
```

---

## SDK Support

Official SDKs are planned for:
- JavaScript/TypeScript
- Python
- Go

---

For more information, see the [Architecture Documentation](ARCHITECTURE.md).