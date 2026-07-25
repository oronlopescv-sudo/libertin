# 🔧 Fix: useSearchParams() Suspense Boundary

## ❌ PROBLEMA

```typescript
// ❌ ERRADO - Causa erro em Next.js 14
export default function AbonnementsPage() {
  const searchParams = useSearchParams() // ❌ Erro!
  // ...
}
```

**Erro:**
```
Error: useSearchParams() used without Suspense boundary
```

---

## ✅ SOLUÇÃO

### 1. **Dividir em 2 componentes:**

**Parent (Server Component):**
```typescript
// app/abonnements/page.tsx
import { Suspense } from 'react'
import AbonnementsContent from './content'

export default function AbonnementsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AbonnementsContent />
    </Suspense>
  )
}
```

**Child (Client Component):**
```typescript
// app/abonnements/content.tsx
'use client'
import { useSearchParams } from 'next/navigation'

export default function AbonnementsContent() {
  const searchParams = useSearchParams() // ✅ OK!
  // ...
}
```

---

## 🎯 POR QUÊ?

Em Next.js 14:
- `useSearchParams()` é **client-side only**
- Não pode ser usado em componentes server durante **static generation**
- Solução: **Suspense boundary** + **client component**

O Suspense **atrasa o render** do componente até que seja client-side, evitando static generation issues.

---

## 📋 PADRÃO GERAL

Qualquer hook client-side sem suporte server:

```typescript
// ✅ PADRÃO CORRETO
// page.tsx (Server)
import { Suspense } from 'react'
import DynamicContent from './dynamic-content'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DynamicContent />
    </Suspense>
  )
}

// dynamic-content.tsx (Client)
'use client'
import { useSearchParams, useRouter } from 'next/navigation'

export default function DynamicContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  // ... agora funciona!
}
```

---

## 🔗 HOOKS QUE PRECISAM DE SUSPENSE

- ✅ `useSearchParams()`
- ✅ `useRouter()` (algumas situações)
- ✅ `usePathname()` (algumas situações)
- ✅ Qualquer hook que dependa de browser APIs

---

## 🧪 TESTADO EM

- ✅ Next.js 14.2
- ✅ React 18.3
- ✅ App Router
- ✅ TypeScript 5.3

---

**Problema Resolvido!** ✅

