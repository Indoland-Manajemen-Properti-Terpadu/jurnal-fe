# Rule: Accessibility

Standar aksesibilitas di `jurnal-fe`.

## WCAG Compliance

Target: WCAG 2.1 Level AA.

## Prinsip

1. Perceivable - Dapat dilihat/didengar.
2. Operable - Dapat dioperasikan.
3. Understandable - Dapat dipahami.
4. Robust - Kompatibel dengan assistive technology.

## Mantine Accessibility

Mantine v8 sudah built-in accessibility untuk komponen.

### Button

```typescript
// ✅ Benar - label jelas
<Button aria-label="Save document">Save</Button>
```

### Form

```typescript
// ✅ Benar - label terhubung
<TextInput
  label="Email"
  id="email"
  error={error}
  aria-describedby={error ? 'email-error' : undefined}
/>
```

### Modal

```typescript
// ✅ Benar - title wajib
<Modal opened={opened} onClose={close} title="Confirm Delete">
  ...
</Modal>
```

## Focus Management

```typescript
// ✅ Benar - trap focus di modal
<Modal opened={opened} onClose={close} trapFocus>
  ...
</Modal>
```

## Keyboard Navigation

- Semua interactive element harus accessible via keyboard.
- Tab order logis.
- Visible focus indicator.

```typescript
// ✅ Benar
<Button component="a" href="/users">
  Users
</Button>

// ❌ Salah - tidak accessible
<div onClick={handleClick}>Click me</div>
```

## Color Contrast

- Text harus memiliki contrast ratio minimal 4.5:1.
- Gunakan design token yang sudah compliant.

## Larangan

- Jangan hilangkan focus indicator (`outline: none` tanpa pengganti).
- Jangan gunakan `div` atau `span` untuk interactive element.
- Jangan rely on color alone untuk convey information.

## Validation

Full validation memerlukan:
- Manual testing dengan screen reader.
- Keyboard-only navigation test.
- Automated tool (axe, Lighthouse).
