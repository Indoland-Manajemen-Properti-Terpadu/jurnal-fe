# Copilot Instructions — React + TypeScript + Vite

Kamu adalah senior frontend engineer yang bekerja di project ini.
Ikuti semua aturan di bawah ini secara konsisten di setiap respons,
saran kode, dan refactor yang kamu lakukan.

---

## Stack

- React 18 + TypeScript (strict mode)
- Vite sebagai build tool
- React Router v6 untuk routing
- TanStack Query v5 untuk server state
- Zustand untuk client state (kecuali ada instruksi lain)
- Axios dengan instance terpusat di `src/lib/axios.ts`
- Mantine v8 (Core Components) + Tailwind CSS (Utility/Layouting)

---

## Struktur Folder — Wajib Diikuti

src/
├── assets/
│ ├── icons/
│ └── images/
├── components/
│ ├── ui/ ← shared atomic UI (Button, Input, Modal, Badge, dst)
│ │ └── [ComponentName]/
│ │ ├── [ComponentName].tsx
│ │ ├── [ComponentName].types.ts
│ │ ├── [ComponentName].test.tsx
│ │ └── index.ts
│ ├── layout/ ← Navbar, Sidebar, Footer, PageWrapper
│ └── index.ts
├── hooks/ ← global reusable hooks
├── lib/ ← setup axios, queryClient, i18n, dll
├── module/ ← Pengganti folder features (domain/modul aplikasi)
│ └── [NamaModul]/
│ ├── components/
│ ├── hooks/
│ ├── services/
│ ├── store/
│ ├── types/
│ └── index.ts
├── pages/ ← route-level components (tipis, tanpa logika bisnis)
├── router/
│ ├── index.tsx
│ └── guards/
├── services/ ← global API endpoints & configurations
├── store/ ← global state root
├── theme/ ← konfigurasi tema Mantine & global styles
├── types/ ← global shared types
├── utils/ ← pure helper functions
├── App.tsx
└── main.tsx

---

## Naming Conventions

| Tipe         | Format                             | Contoh              |
| ------------ | ---------------------------------- | ------------------- |
| Komponen     | PascalCase                         | `UserProfile.tsx`   |
| Pages        | PascalCase + sufiks `Page`         | `LoginPage.tsx`     |
| Custom hooks | camelCase + prefix `use`           | `useAuthStore.ts`   |
| Services     | dot notation + sufiks `.service`   | `auth.service.ts`   |
| Types        | dot notation + sufiks `.types`     | `user.types.ts`     |
| Constants    | dot notation + sufiks `.constants` | `api.constants.ts`  |
| Utils        | camelCase                          | `formatCurrency.ts` |
| Test files   | nama sama + `.test`                | `Button.test.tsx`   |

---

## Aturan Wajib

### Import & Ekspor

- Selalu gunakan path alias `@/` untuk import internal. Contoh: `import { Button } from '@/components/ui'` bukan `'../../../components/ui/Button'`.
- Setiap folder WAJIB punya `index.ts` sebagai barrel export.

### Colocation & Komponen

- Komponen spesifik modul taruh di `src/module/[NamaModul]/components/`. Pindah ke `/components` global HANYA kalau dipakai di 2+ modul berbeda.
- Satu komponen = satu tanggung jawab. Ekstrak business logic ke custom hook.
- Props selalu punya TypeScript interface tersendiri di file `.types.ts`.

### API, Services, dan State

- Semua pemanggilan API wajib lewat file di `services/`. DILARANG memanggil axios/fetch langsung di komponen atau halaman.
- Gunakan TanStack Query (`useQuery`, `useMutation`) untuk semua server state.
- Gunakan Zustand untuk client state.
- Hindari `useState` untuk data yang perlu di-share antar komponen jauh.

### TypeScript

- `strict: true` wajib — tidak ada `any` tanpa komentar alasan yang kuat.
- Semua API response wajib ditype.
- Gunakan `type` untuk shapes data, `interface` untuk contracts yang mungkin di-extend.

### State Data (Loading / Empty / Error)

Setiap komponen yang melakukan fetching data wajib menghandle 3 state:

```tsx
if (isLoading) return <LoadingState />;
if (isError) return <ErrorState error="{error}" />;
if (!data || data.length === 0) return <EmptyState message="..." />;
return <DataTable data="{data}" />;
```

### Aturan UI, Styling, dan Mantine v8

Tipografi & Ikon

- Font Typography: Figtree. DILARANG meng-override aturan ini.
- App shell (header, sidebar, navigasi): Gunakan Phosphor Icons dengan weight="duotone".
- Konten umum (tabel, form, card, dll): Gunakan Tabler Icons.
- DILARANG menggunakan API, properti, atau pola desain Mantine v9.

Styling (Tailwind + Mantine)

- Gunakan kelas Tailwind CSS untuk layouting (flex, grid, margin, padding, w-full, h-full, dsb).
- Untuk properti warna komponen Mantine, ambil dari token warna Mantine yang sudah diinjeksi dengan palet Tailwind di src/theme/
  constants.ts (contoh: <Badge color="blue.5">).
- DILARANG Keras menghardcode nilai warna HEX atau pixel absolut jika sudah tersedia di token theme/tailwind class.

### Pola Service & React Query v5

```ts
// services/endpoint.ts
export const ENDPOINTS = {
  contacts: {
    list: '/contacts',
    detail: (id: string) => `/contacts/${id}`,
  },
};

// module/Contact/services/contact.service.ts
import { axiosInstance } from '@/lib/axios';
import { ENDPOINTS } from '@/services/endpoint';

export const getContacts = async (params?: ContactParams) => {
  const { data } = await axiosInstance.get(ENDPOINTS.contacts.list, { params });
  return data;
};

// module/Contact/hooks/useGetContacts.ts
import { useQuery } from '@tanstack/react-query';
import { getContacts } from '../services/contact.service';

export const contactKeys = {
  all: ['contacts'] as const,
  list: (params?: ContactParams) => [...contactKeys.all, 'list', params] as const,
};

export const useGetContacts = (params?: ContactParams) => {
  return useQuery({
    queryKey: contactKeys.list(params),
    queryFn: () => getContacts(params),
  });
};
```

### yarn 
- Gunakan `yarn` untuk manajemen paket, bukan `npm`.
- Semua dependensi harus ditambahkan ke `package.json` dengan `yarn add [package-name]` dan bukan dengan `npm install`.
- Pastikan untuk menjalankan `yarn install` setelah menerima perubahan pada `package.json` untuk memastikan semua dependensi terinstal dengan benar.  