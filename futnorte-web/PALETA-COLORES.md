# Paleta de Colores - Futnorte

Este documento describe la paleta de colores personalizada del proyecto. Todos los colores están centralizados en `tailwind.config.js` para facilitar cambios globales.

## 📋 Tabla de Contenidos
- [Colores Principales](#colores-principales)
- [Colores Semánticos](#colores-semánticos)
- [Colores de UI](#colores-de-ui)
- [Cómo Cambiar la Paleta](#cómo-cambiar-la-paleta)

---

## Colores Principales

### Primary (Azul)
Color principal de la aplicación, usado para acciones primarias y elementos destacados.

```css
primary-50  → #eff6ff (azul muy claro)
primary-500 → #3b82f6 (azul medio)
primary-600 → #2563eb (azul principal)
primary-900 → #1e3a8a (azul oscuro)
```

**Uso:**
- Botones primarios
- Links importantes
- Indicadores de estado "CREADO"
- Spinners de carga

**Ejemplos:**
```html
<button class="bg-primary-600 hover:bg-primary-700">Aceptar</button>
<div class="border-primary-500 text-primary-600">Información</div>
```

---

### Secondary (Indigo/Púrpura)
Color secundario para elementos complementarios.

```css
secondary-50  → #eef2ff
secondary-500 → #6366f1 (indigo medio)
secondary-600 → #4f46e5 (indigo principal)
secondary-900 → #312e81
```

**Uso:**
- Headers de secciones
- Elementos decorativos
- Iconos especiales

---

### Accent (Purple/Pink)
Color de acento para elementos interactivos y hover states.

```css
accent-50   → #faf5ff
accent-500  → #a855f7 (púrpura medio)
accent-600  → #9333ea (púrpura principal)
accent-pink → #ec4899 (rosa)
accent-pink-light → #f9a8d4
accent-pink-dark  → #db2777
```

**Uso:**
- Efectos hover en navegación
- Gradientes del header
- Botón "Nuevo Torneo"
- Elementos de énfasis

**Ejemplos:**
```html
<div class="bg-gradient-to-r from-accent-600 to-accent-pink">
<i class="text-accent-600 group-hover:text-accent-700">
```

---

## Colores Semánticos

### Success (Verde)
Indica éxito, acciones positivas o estados activos.

```css
success-50  → #f0fdf4
success-500 → #22c55e (verde medio)
success-600 → #16a34a (verde principal)
success-900 → #14532d
```

**Uso:**
- Mensajes de éxito
- Botones de guardar/confirmar
- Indicadores de torneos "EN_CURSO"
- Estados activos

**Ejemplos:**
```html
<button class="bg-success-600 hover:bg-success-700">Guardar</button>
<div class="bg-success-50 border-success-200">Operación exitosa</div>
```

---

### Warning (Amarillo/Naranja)
Advertencias o acciones que requieren atención.

```css
warning-50  → #fffbeb
warning-500 → #f59e0b (amarillo-naranja medio)
warning-600 → #d97706 (amarillo-naranja principal)
warning-900 → #78350f
```

**Uso:**
- Mensajes de advertencia
- Indicadores de atención
- Gradientes especiales
- Iconos de trofeos

---

### Danger (Rojo)
Errores, eliminaciones o acciones destructivas.

```css
danger-50  → #fef2f2
danger-500 → #ef4444 (rojo medio)
danger-600 → #dc2626 (rojo principal)
danger-900 → #7f1d1d
```

**Uso:**
- Botones de eliminar
- Mensajes de error
- Modales de confirmación de eliminación
- Indicadores de torneos "CANCELADO"

**Ejemplos:**
```html
<button class="bg-danger-600 hover:bg-danger-700">Eliminar</button>
<div class="bg-danger-50 border-danger-200">Error</div>
```

---

### Info (Cyan/Sky)
Información general y estados informativos.

```css
info-50  → #f0f9ff
info-500 → #0ea5e9
info-600 → #0284c7
info-900 → #0c4a6e
```

**Uso:**
- Tooltips
- Mensajes informativos
- Badges de información

---

## Colores de UI

### Neutral (Grises)
Reemplaza todos los grays y slates. Usados para texto, bordes y fondos neutros.

```css
neutral-50  → #f8fafc (fondo muy claro)
neutral-100 → #f1f5f9
neutral-200 → #e2e8f0 (bordes suaves)
neutral-300 → #cbd5e1
neutral-500 → #64748b (texto secundario)
neutral-600 → #475569 (texto terciario)
neutral-700 → #334155 (texto normal)
neutral-900 → #0f172a (texto oscuro)
```

**Uso:**
- Todo el texto general
- Bordes de componentes
- Fondos de aplicación
- Estados disabled

**Ejemplos:**
```html
<p class="text-neutral-700">Texto normal</p>
<div class="border-neutral-200 bg-neutral-50">Card</div>
<span class="text-neutral-500">Texto secundario</span>
```

---

### Hover (Salmón/Rosa)
Color especial para efectos hover específicos.

```css
hover → #fa8072 (salmón)
hover-light → #ffb3a7
hover-dark → #e86f5f
```

**Uso:**
- Hover en cards de torneos
- Transiciones especiales

**Ejemplos:**
```html
<i class="text-neutral-600 group-hover:text-hover">
```

---

## Cómo Cambiar la Paleta

### Cambio Completo de Identidad de Marca

Para cambiar toda la identidad visual de la aplicación, edita `tailwind.config.js`:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Cambia estos valores hexadecimales
        primary: {
          500: '#TU_COLOR_AQUI',
          600: '#TU_COLOR_MAS_OSCURO',
          // ... resto de tonos
        },
        // ... otros colores
      }
    }
  }
}
```

### Ejemplos de Cambios Comunes

#### Cambiar de Azul a Verde como color principal
```javascript
primary: {
  50: '#f0fdf4',
  500: '#22c55e',
  600: '#16a34a',
  900: '#14532d',
},
```

#### Cambiar tema oscuro de acentos
```javascript
accent: {
  500: '#8b5cf6',  // Violeta en lugar de púrpura
  600: '#7c3aed',
  pink: '#d946ef', // Fucsia en lugar de rosa
},
```

#### Cambiar neutrales a un tono más cálido
```javascript
neutral: {
  50: '#fafaf9',   // stone-50
  200: '#e7e5e4',  // stone-200
  700: '#44403c',  // stone-700
  // etc.
},
```

### Después de Cambiar Colores

1. **No necesitas tocar ningún archivo HTML** - Todos los componentes ya usan los colores semánticos
2. Reinicia el servidor de desarrollo:
   ```bash
   npm start
   ```
3. Los cambios se aplicarán automáticamente a toda la aplicación

---

## Mapeo de Colores Antiguos → Nuevos

Para referencia, así se mapearon los colores durante la migración:

| Color Antiguo | Color Nuevo | Uso |
|--------------|-------------|-----|
| `gray-*`, `slate-*` | `neutral-*` | Texto, bordes, fondos |
| `blue-*` | `primary-*` | Color principal |
| `indigo-*` | `secondary-*` | Color secundario |
| `purple-*` | `accent-*` | Acentos y hover |
| `pink-*` | `accent-pink*` | Gradientes |
| `red-*` | `danger-*` | Errores y eliminaciones |
| `green-*`, `emerald-*` | `success-*` | Éxito y confirmaciones |
| `yellow-*`, `orange-*`, `amber-*` | `warning-*` | Advertencias |
| `rose-500` | `hover` | Hover especial |

---

## Gradientes Predefinidos

El archivo de configuración también incluye gradientes predefinidos (aunque actualmente no se usan como clases, están disponibles):

```javascript
gradient: {
  'purple-pink': { from: '#9333ea', to: '#ec4899' },
  'blue-purple': { from: '#3b82f6', via: '#6366f1', to: '#7e22ce' },
  'green-blue': { from: '#22c55e', to: '#3b82f6' },
  'yellow-orange': { from: '#fbbf24', to: '#f97316' }
}
```

---

## Ventajas de esta Arquitectura

✅ **Cambio centralizado**: Modifica un solo archivo para actualizar toda la aplicación
✅ **Semántica clara**: Los nombres indican el propósito (`danger` vs `red-600`)
✅ **Consistencia**: Todos los componentes usan la misma paleta
✅ **Mantenibilidad**: Fácil de entender y modificar
✅ **Escalabilidad**: Agregar nuevos colores es simple

---

**Última actualización:** 2025-10-06
**Versión de Tailwind:** 3.x
