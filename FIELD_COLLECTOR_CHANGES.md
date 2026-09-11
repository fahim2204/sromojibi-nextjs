# Sromojibi Field Collector (v1/fc) API Specification

Official API specification for the **Field Collector (`/api/v1/fc`)** backend endpoints in **`sromojibi-nextjs`**. These endpoints allow the **Agnix Collector** mobile app to authenticate collectors, download dynamic geographical/service metadata, and sync offline-collected worker profiles and shifts into the staging database (`fc_*`).

---

## Base URL
```
https://sromojibi.com/api/v1/fc
```
*(Local development: `http://localhost:3000/api/v1/fc`)*

---

## Authentication & Headers

Protected endpoints require a Bearer token obtained from `/api/v1/fc/auth/login`.

| Header | Type | Required | Description |
|---|---|---|---|
| `Content-Type` | String | Yes | Must be `application/json` for POST requests |
| `Authorization` | String | Required* | Format: `Bearer <token>` (Required for `/auth/me`, `/meta`, and `/sync`) |

---

## Default Pre-Seeded Accounts
If no collector users exist in the database, the backend automatically initializes:
- **Username**: `collector1` | **Password**: `Collector@12345` (Role: `COLLECTOR`)
- **Username**: `admin` | **Password**: `Collector@12345` (Role: `ADMIN`)

---

## Summary of Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/v1/fc/auth/login` | No | Authenticate collector and retrieve 30-day session token |
| `GET` | `/api/v1/fc/auth/me` | Yes | Verify token and retrieve current collector profile |
| `GET` | `/api/v1/fc/meta` | Yes | Fetch service categories & full Bangladesh division/district/upazila tree |
| `POST` | `/api/v1/fc/sync` | Yes | Upload offline collected batch data (sessions and worker profiles) |

---

## 1. POST `/api/v1/fc/auth/login`

Authenticates a field collector or admin and provisions a persistent session token valid for 30 days.

### Request
```http
POST /api/v1/fc/auth/login HTTP/1.1
Host: sromojibi.com
Content-Type: application/json
```

```json
{
  "username": "collector1",
  "password": "Collector@12345"
}
```

### Response (200 OK)
```json
{
  "data": {
    "user": {
      "id": 1,
      "username": "collector1",
      "fullName": "Field Collector 01",
      "role": "COLLECTOR",
      "phone": "01700000001"
    },
    "token": "fc_1_a89f310cd48b3924765ef9a2c10b25e79124a9e527f310e238cb091a27e31b40",
    "expiresAt": "2026-10-12T03:00:00.000Z"
  },
  "error": null,
  "meta": {
    "message": "Collector signed in successfully"
  }
}
```

### Error Responses
- **400 Bad Request**:
```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Username and password are required"
  }
}
```
- **401 Unauthorized**:
```json
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid username or password"
  }
}
```

---

## 2. GET `/api/v1/fc/auth/me`

Validates the provided Bearer token and returns the authenticated collector's details.

### Request
```http
GET /api/v1/fc/auth/me HTTP/1.1
Host: sromojibi.com
Authorization: Bearer fc_1_a89f310cd48b3924765ef...
```

### Response (200 OK)
```json
{
  "data": {
    "id": 1,
    "username": "collector1",
    "fullName": "Field Collector 01",
    "role": "COLLECTOR",
    "phone": "01700000001"
  },
  "error": null
}
```

### Error Responses
- **401 Unauthorized**:
```json
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Session expired or invalid"
  }
}
```

---

## 3. GET `/api/v1/fc/meta`

Retrieves active worker categories and the hierarchical Bangladesh geographic structure (Divisions → Districts → Upazilas) for client-side offline search and select.

### Request
```http
GET /api/v1/fc/meta HTTP/1.1
Host: sromojibi.com
Authorization: Bearer fc_1_a89f310cd48b3924765ef...
```

### Response (200 OK)
```json
{
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Electrician",
        "name_bn": "ইলেকট্রিশিয়ান",
        "slug": "electrician",
        "icon": "zap"
      },
      {
        "id": 2,
        "name": "Plumber",
        "name_bn": "প্লাম্বার (পাইপ ফিটার)",
        "slug": "plumber",
        "icon": "wrench"
      },
      {
        "id": 3,
        "name": "Rajmistri",
        "name_bn": "রাজমিস্ত্রি",
        "slug": "rajmistri",
        "icon": "hammer"
      }
    ],
    "divisions": [
      {
        "id": "div-dhaka",
        "title_en": "Dhaka",
        "title_bn": "ঢাকা",
        "districts": [
          {
            "id": "dist-dhaka",
            "title_en": "Dhaka",
            "title_bn": "ঢাকা",
            "upazilas": [
              {
                "id": "upz-mirpur",
                "title_en": "Mirpur",
                "title_bn": "মিরপুর"
              },
              {
                "id": "upz-dhanmondi",
                "title_en": "Dhanmondi",
                "title_bn": "ধানমন্ডি"
              }
            ]
          }
        ]
      }
    ]
  },
  "error": null
}
```

---

## 4. POST `/api/v1/fc/sync`

Batch synchronization endpoint. Ingests offline-collected sessions and worker profiles. Automatically checks for duplicate phone numbers against existing live worker profiles and flags them in staging.

### Request Headers
```http
POST /api/v1/fc/sync HTTP/1.1
Host: sromojibi.com
Content-Type: application/json
Authorization: Bearer fc_1_a89f310cd48b3924765ef...
```

### Request Body Schema (TypeScript)

```typescript
interface SyncPayload {
  sessions?: Array<{
    id: string;              // Client-generated UUID
    locationName: string;    // e.g. "Mirpur 10, Dhaka"
    area?: string;           // e.g. "Section 10, Block C"
    divisionId?: string;     // Reference division.id
    districtId?: string;     // Reference district.id
    upazilaId?: string;      // Reference upazila.id
    latitude?: number;       // GPS Latitude (Decimal 10,7)
    longitude?: number;      // GPS Longitude (Decimal 10,7)
    accuracy?: number;       // GPS Accuracy in meters
    startedAt: string;       // ISO 8601 string
    endedAt?: string;        // ISO 8601 string
    totalCollected?: number; // Total count of workers in shift
    notes?: string;          // Collector notes
  }>;

  workers?: Array<{
    id: string;              // Client-generated UUID
    sessionId: string;       // References sessions.id
    fullName: string;        // Worker's full name (e.g. "Karim Mia")
    phone: string;           // Worker's mobile number
    serviceType: string;     // Category/trade title (e.g. "Electrician")
    categoryId?: number;     // Reference category.id
    divisionId?: string;
    districtId?: string;
    upazilaId?: string;
    village?: string;        // Specific area / road / village
    experience?: string;     // e.g. "7 years"
    details?: string;        // Skill summary or specialties
    photos?: string[];       // Array of uploaded photo URLs
    rawMetadata?: Record<string, any>;
    createdAt?: string;      // ISO 8601 string
  }>;
}
```

### Complete Request Body Example

```json
{
  "sessions": [
    {
      "id": "sess_91b2c3d4-1",
      "locationName": "Mirpur 10 Circle, Dhaka",
      "area": "Block C",
      "divisionId": "div-dhaka",
      "districtId": "dist-dhaka",
      "upazilaId": "upz-mirpur",
      "latitude": 23.8070851,
      "longitude": 90.3686823,
      "accuracy": 9.4,
      "startedAt": "2026-09-12T02:00:00.000Z",
      "endedAt": "2026-09-12T03:30:00.000Z",
      "totalCollected": 1,
      "notes": "Surveyed electricians around Shah Ali Plaza"
    }
  ],
  "workers": [
    {
      "id": "work_8a7b6c5d-1",
      "sessionId": "sess_91b2c3d4-1",
      "fullName": "Md. Rafiqul Islam",
      "phone": "01712998877",
      "serviceType": "Electrician",
      "categoryId": 1,
      "divisionId": "div-dhaka",
      "districtId": "dist-dhaka",
      "upazilaId": "upz-mirpur",
      "village": "Road 4, Block C, Section 10",
      "experience": "8 years",
      "details": "House wiring, DB box setup, fan & motor winding specialist",
      "photos": ["https://storage.sromojibi.com/fc/worker_8a7b6c5d_1.jpg"],
      "createdAt": "2026-09-12T02:45:00.000Z"
    }
  ]
}
```

### Response (200 OK)

```json
{
  "data": {
    "syncedSessionIds": ["sess_91b2c3d4-1"],
    "syncedWorkerIds": ["work_8a7b6c5d-1"],
    "duplicatesDetected": []
  },
  "error": null,
  "meta": {
    "message": "Sync processed successfully"
  }
}
```

### Duplicate Detection Response Example
If a worker's phone number matches an existing profile in the production `WorkerProfile` table, the worker is saved to staging (`fc_collected_worker`), tagged with `is_duplicate: true`, and highlighted in `duplicatesDetected`:

```json
{
  "data": {
    "syncedSessionIds": ["sess_91b2c3d4-1"],
    "syncedWorkerIds": ["work_8a7b6c5d-1"],
    "duplicatesDetected": [
      {
        "id": "work_8a7b6c5d-1",
        "phone": "01712998877",
        "reason": "Matches live WorkerProfile #42 (Md. Rafiqul Islam)"
      }
    ]
  },
  "error": null,
  "meta": {
    "message": "Sync processed successfully"
  }
}
```

### Error Responses
- **401 Unauthorized**:
```json
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Session expired or invalid"
  }
}
```
- **500 Internal Server Error**:
```json
{
  "data": null,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Failed to process sync"
  }
}
```

---

## 5. Quick cURL Testing Examples

### 1. Login to get token:
```bash
curl -X POST https://sromojibi.com/api/v1/fc/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "collector1", "password": "Collector@12345"}'
```

### 2. Fetch Metadata (using returned token):
```bash
curl -X GET https://sromojibi.com/api/v1/fc/meta \
  -H "Authorization: Bearer <TOKEN>"
```

### 3. Sync Offline Batch:
```bash
curl -X POST https://sromojibi.com/api/v1/fc/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "sessions": [
      {
        "id": "test-sess-001",
        "locationName": "Mirpur 10",
        "startedAt": "2026-09-12T02:00:00Z"
      }
    ],
    "workers": [
      {
        "id": "test-work-001",
        "sessionId": "test-sess-001",
        "fullName": "Test Mistri",
        "phone": "01700000000",
        "serviceType": "Plumber"
      }
    ]
  }'
```
