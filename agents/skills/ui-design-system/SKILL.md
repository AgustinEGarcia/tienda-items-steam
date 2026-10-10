---
name: ui-design-system
description: Sistema de diseño oficial permanente (Royal Iris & Deep Slate) para CS2 Inventory Hub.
---

# Sistema de Diseño UI — CS2 Inventory Hub (Royal Iris)

## 1. Identidad Visual Oficial: Royal Iris & Deep Slate
Inspirado en los principios ergonómicos y tácticos de software de escritorio como Valve UI, Steam Deck y Discord:
- **Base / Fondo Global:** `#0d0c18` (Pizarra carbón con matices iris oscuro).
- **Acento Primario:** `#7c3aed` (Púrpura real desaturado) y `#6d28d9` (Violeta táctico profundo).
- **Acento en Hover:** `#8b5cf6` (Amatista claro).
- **Píldoras y Botones Activos:** `#6d28d9` con tipografía blanca nítida y sombra perimetral de profundidad.
- **Píldoras Inactivas:** `rgba(109, 40, 217, 0.1)` con borde sutil `rgba(124, 58, 237, 0.16)`.
- **Efectos Glassmorphism:** Paneles en `rgba(21, 19, 36, 0.88)` con `backdrop-blur-md` y resplandor difuso `rgba(124, 58, 237, 0.28)`.

## 2. Segregación y Privacidad de Roles
- **Público / Visitantes:** Visualizan el catálogo, métricas de inventario, cotización en tiempo real USD/ARS, filtros por cuenta y buscador. No tienen acceso a botones de sincronización manual hacia Steam ni herramientas internas.
- **Administrador:** Acceso protegido a `/admin` para gestionar cuentas SteamID64, editar soberanamente el tipo de cambio del dólar y forzar sincronizaciones controladas.

## 3. Tokens de Rareza Oficiales CS2
- **Consumer Grade (Común):** `#b0c3d9` (Gris azulado).
- **Industrial Grade:** `#5e98d9` (Azul claro).
- **Mil-Spec Grade:** `#4b69ff` (Azul militar).
- **Restricted:** `#8847ff` (Púrpura restringido).
- **Classified:** `#d32ce6` (Fucsia clasificado).
- **Covert:** `#eb4b4b` (Rojo encubierto).
- **Special / Contraband:** `#ffd700` / `#e4ae39` (Dorado excepcional / Cuchillos y Guantes).
