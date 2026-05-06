# Rule: Routing and Navigation

Standar routing di `jurnal-fe`.

## Router

Menggunakan React Router v6.

## Lokasi

- Route definitions: `src/router/index.tsx`.
- Module routes: `src/module/*/routes.tsx` (optional).

## Route Structure

```typescript
// src/router/index.tsx
const routes = [
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/users',
    element: <UserList />,
  },
  {
    path: '/users/:id',
    element: <UserDetail />,
  },
];
```

## Protected Routes

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
```

## Navigation

### Programmatic

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/users');           // push
navigate(-1);                 // back
navigate('/users', { replace: true }); // replace
```

### Links

```typescript
import { Link } from 'react-router-dom';

// ✅ Benar
<Link to="/users">Users</Link>

// ❌ Salah - full reload
<a href="/users">Users</a>
```

## URL Params

```typescript
import { useParams } from 'react-router-dom';

const { id } = useParams<{ id: string }>();
```

## Query Params

```typescript
import { useSearchParams } from 'react-router-dom';

const [searchParams, setSearchParams] = useSearchParams();
const page = searchParams.get('page') || '1';
```

## Larangan

- Jangan gunakan `<a href>` untuk internal navigation.
- Jangan hardcode route path di banyak tempat.
- Jangan lupa protected route untuk halaman yang butuh auth.
