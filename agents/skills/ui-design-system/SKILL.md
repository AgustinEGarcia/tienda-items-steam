---
name: ui-design-system
description: Guía de diseño de interfaz de usuario de alto impacto y paletas temáticas violetas puras para CS2 Inventory Hub.
---

# Sistema de Diseño UI — CS2 Inventory Hub (Edición Violeta Pura)

## 1. Principios de Diseño
- **Cohesión Cromática Total:** 100% libre de tonos amarillos/naranjas desentonados. Toda la jerarquía de botones, badges, filtros y efectos de cristal orbita en torno al espectro violeta y amatista.
- **Segregación de Roles (Admin vs Público):** Controles de sincronización forzada hacia Steam, herramientas de prueba y selectores de tema visual quedan estrictamente reservados para la sesión autenticada de administrador.
- **Glassmorphism y Profundidad:** Superficies translúcidas (`backdrop-blur-md` a `backdrop-blur-xl`), bordes sutiles de 1px con brillo perimetral reactivo al hover (`box-shadow: 0 0 22px var(--theme-glow)`).
- **Legibilidad y Contraste (WCAG AA):** Tipografía de alto contraste con colores claros sobre fondos ultra oscuros.

## 2. Las 4 Paletas Violetas

### Opción A: Midnight Amethyst & Pure Glass (Estilo Linear / Raycast)
- **Background:** `#090714` (Obsidiana con tinte amatista).
- **Píldoras y Botones Activos:** `#9333ea` (Violeta pulido con resplandor suave).
- **Bordes:** `rgba(168, 85, 247, 0.18)` con hover `rgba(192, 132, 252, 0.6)`.
- **Sensación:** Minimalista, de altísima gama, sobrio y elegante.

### Opción B: Neon Synthwave & Iridescent (Estilo CS2 Fade / Vice)
- **Background:** `#06040c` (Espacio cósmico).
- **Píldoras y Botones Activos:** Degradado fluido `from-violet-600 via-purple-600 to-fuchsia-600`.
- **Bordes:** `rgba(217, 70, 239, 0.22)` con resplandor fucsia/magenta neón.
- **Sensación:** Muy dinámico, vibrante, juvenil e inmersivo.

### Opción C: Royal Iris & Deep Slate (Estilo Valve / Steam Deck / Discord)
- **Background:** `#0d0c18` (Pizarra carbón con matices iris oscuro).
- **Píldoras y Botones Activos:** `#6d28d9` (Púrpura real desaturado).
- **Bordes:** `rgba(124, 58, 237, 0.16)`.
- **Sensación:** Táctico, profesional, lectura descansada durante sesiones largas.

### Opción D: Pitch Black & Ultraviolet (Estilo Nothing OS / Cyberpunk)
- **Background:** `#000000` (Negro absoluto).
- **Píldoras y Botones Activos:** Carbón oscuro con bordes láser ultravioleta `#c084fc`.
- **Bordes:** Líneas nítidas de 1px de altísimo contraste.
- **Sensación:** Vanguardista, ultra veloz, estética técnica y limpia.
