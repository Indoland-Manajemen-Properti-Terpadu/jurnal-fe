# Rule: Style and UI

Standar styling dan UI di `jurnal-fe`.

## Tech Stack

- Mantine v8 (LOCKED - tidak upgrade ke v9).
- Tailwind v4 utilities only (preflight disabled).
- Design token dari Figma.

## Design Token

Sumber: https://www.figma.com/design/I3tHoLYN005e1bUjQWlkAL/Design-System-Lite

### Color

```typescript
// ✅ Benar - gunakan token
<Button color="blue.6">Submit</Button>;
<Text c="gray.7">Description</Text>;

// ❌ Salah - hardcode
<Button style={{ backgroundColor: '#1d4ed8' }}>Submit</Button>;
```

### Spacing

```typescript
// ✅ Benar
<Box p="md" mb="lg">

// ❌ Salah
<Box style={{ padding: '16px', marginBottom: '24px' }}>
```

### Radius

```typescript
// ✅ Benar
<Paper radius="md">

// ❌ Salah
<Paper style={{ borderRadius: '8px' }}>
```

## Typography

Font family: **Figtree** (bukan Montserrat).

```typescript
// ✅ Benar
<Text size="lg" fw={500}>Title</Text>

// ❌ Salah
<Text style={{ fontSize: '18px', fontWeight: 500 }}>Title</Text>
```

## Component Usage

### Mantine Components

- Gunakan Mantine component bila ada.
- Jangan buat custom component untuk fitur yang sudah ada di Mantine.

### Props Pattern

```typescript
// ✅ Benar - spread props
interface UserCardProps {
  user: User;
}

export const UserCard = ({ user }: UserCardProps) => {
  return <Card>{user.name}</Card>;
};
```

## State UI

Setiap komponen yang fetch data harus handle:

1. Loading state.
2. Empty state.
3. Error state.

```typescript
const { data, isLoading, error } = useData();

if (isLoading) return <Loading />;
if (error) return <ErrorAlert />;
if (!data?.length) return <EmptyState />;
return <DataList data={data} />;
```

## Larangan

- Jangan hardcode color/spacing/radius jika token tersedia.
- Jangan override Mantine style dengan `!important`.
- Jangan gunakan API Mantine v9.
- Jangan gunakan Tailwind preflight classes yang conflict dengan Mantine.
