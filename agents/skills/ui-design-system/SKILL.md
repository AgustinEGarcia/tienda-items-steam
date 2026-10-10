---
name: ui-design-system
description: Guía de diseño de interfaz de usuario de alto impacto y paletas temáticas (Dark Violet, Cyberpunk, Velvet) para CS2 Inventory Hub.
---

# Sistema de Diseño UI — CS2 Inventory Hub

## 1. Principios de Diseño
- **Estética Inmersiva CS2:** Tema oscuro con contrastes luminosos que realcen la estética del armamento, colecciones y acabados (Neo-Noir, Fade, Ultraviolet).
- **Glassmorphism y Profundidad:** Superficies translúcidas (`backdrop-blur-md` a `backdrop-blur-xl`), bordes sutiles de 1px con brillo reactivo al hover.
- **Micro-interacciones Fluidas:** Elevación de tarjetas (`translateY(-4px)`), resplandor perimetral difuso (*glow*), feedback visual instantáneo.
- **Legibilidad y Contraste (WCAG AA):** Tipografía nítida con colores claros sobre fondos ultra oscuros, jerarquía tipográfica estricta para valores monetarios.

## 2. Paletas de Tonos Violetas

### Tema 1: Cyberpunk Neon Violet
- **Background:** `#080612` (Espacio cósmico profundo).
- **Card Background:** `rgba(18, 14, 33, 0.75)` con `backdrop-blur-md`.
- **Primary Accent:** `#c084fc` (Violeta neón eléctrico).
- **Secondary Accent:** `#ec4899` (Fucsia neón de alta energía).
- **Glow Color:** `rgba(192, 132, 252, 0.35)`.
- **Border:** `rgba(192, 132, 252, 0.18)` con hover `rgba(192, 132, 252, 0.6)`.

### Tema 2: Deep Velvet Luxury
- **Background:** `#0b0914` (Púrpura noche aterciopelado).
- **Card Background:** `rgba(22, 18, 38, 0.8)` con `backdrop-blur-lg`.
- **Primary Accent:** `#8b5cf6` (Amatista imperial pulido).
- **Secondary Accent:** `#fbbf24` (Acento oro de coleccionista).
- **Glow Color:** `rgba(139, 92, 246, 0.25)`.
- **Border:** `rgba(139, 92, 246, 0.15)` con hover `rgba(251, 191, 36, 0.5)`.

### Tema 3: Obsidian Ultraviolet
- **Background:** `#040407` (Obsidiana puro).
- **Card Background:** `rgba(14, 14, 24, 0.85)` con `backdrop-blur-md`.
- **Primary Accent:** `#6366f1` (Índigo táctico ultravioleta).
- **Secondary Accent:** `#06b6d4` (Cian polar de alto contraste).
- **Glow Color:** `rgba(99, 102, 241, 0.3)`.
- **Border:** `rgba(99, 102, 241, 0.2)` con hover `rgba(6, 182, 212, 0.5)`.

## 3. Tokens de Rareza Oficiales CS2
- **Consumer Grade (Común):** `#b0c3d9` (Gris azulado).
- **Industrial Grade:** `#5e98d9` (Azul claro).
- **Mil-Spec Grade:** `#4b69ff` (Azul militar).
- **Restricted:** `#8847ff` (Púrpura restringido).
- **Classified:** `#d32ce6` (Fucsia clasificado).
- **Covert:** `#eb4b4b` (Rojo encubierto).
- **Special / Contraband:** `#ffd700` / `#e4ae39` (Dorado excepcional / Cuchillos y Guantes).
