# Rule: Security

Keamanan aplikasi `jurnal-fe`.

## Authentication

### Token Storage

- Access token: memory saja, jangan localStorage.
- Refresh token: httpOnly cookie (backend setup).

### Token Handling

```typescript
// ✅ Benar - token di memory
let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

// ❌ Salah
localStorage.setItem('accessToken', token);
```

### Logout

- Clear semua state di memory.
- Clear cookie via API call.
- Redirect ke login.

## API Security

### Base URL

- Gunakan environment variable.
- Jangan hardcode production URL.

```typescript
// ✅ Benar
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ❌ Salah
const BASE_URL = 'https://api.production.com';
```

### Request

- Selalu set Content-Type untuk body request.
- Jangan kirim token di URL params.

## XSS Prevention

### Rich Text / TipTap

- Sanitize HTML input.
- Jangan render raw HTML tanpa sanitasi.

```typescript
// ✅ Benar
import DOMPurify from 'dompurify';
const sanitized = DOMPurify.sanitize(dirtyHtml);
```

### File Upload

- Validasi file type di client.
- Limit file size.
- Jangan eksekusi file upload sebagai script.

## Sensitive Data

### Logging

```typescript
// ❌ Larangan
console.log('token:', accessToken);
console.log('password:', password);
console.log('userData:', response.data); // jika ada token/secret
```

### Error Message

- Jangan expose internal error ke user.
- Jangan tampilkan stack trace di production.

## Larangan

- Jangan simpan token di localStorage/sessionStorage.
- Jangan log kredensial ke console.
- Jangan hardcode secret/API key.
- Jangan render user input sebagai HTML tanpa sanitasi.
