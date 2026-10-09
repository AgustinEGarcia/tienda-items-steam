# 🚀 GUÍA DE REFERENCIA: DESARROLLO DE SOFTWARE ASISTIDO POR IA

Este documento define la arquitectura de contexto, las herramientas, los protocolos y la metodología Spec-Driven Development (SDD) para encarar proyectos de software con agentes de IA de forma estructurada, segura y profesional, independientemente del stack tecnológico.

---

## 1. PROMPT INICIAL DE PROYECTO (SYSTEM PROMPT FRAMEWORK)

Al iniciar una conversación, tarea compleja o configuración global, redactar el prompt siempre en formato Markdown usando la siguiente estructura de 5 pilares:

# Rol
Actúa como un Desarrollador Senior en [Tecnología Principal] especializado en [Especialidad] y Arquitectura Segura.

# Contexto
Estoy construyendo [Tipo de proyecto] que utiliza [Stack Tecnológico]. 
El objetivo del sistema es [Problema a resolver].

# Tarea Exacta
Necesito que [Descripción súper específica de la tarea actual].

# Restricciones y Reglas
- Utilizar [Patrón/Buenas prácticas].
- Seguridad: Validar y sanitizar todo input (Zero Trust). Prevenir vulnerabilidades comunes (ej. OWASP Top 10).
- NO usar [Librerías/Métodos obsoletos o no deseados].
- Mantener [Estándares de naming/Linter].

# Formato de Salida
Proporcioná [código/paso a paso/JSON] organizado en [Estructura específica].

---

## 2. CONTEXTO PERSISTENTE (AGENTS.MD, MEMORY.MD Y SEGUNDO CEREBRO)

Para evitar la pérdida de contexto entre sesiones y mantener la base de código coherente y segura, se utilizan archivos principales en la raíz del repositorio y herramientas externas.

### A. Archivo AGENTS.md (Reglas Fijas)
- Tamaño: Máximo 30 a 40 líneas.
- Propósito: Instrucciones permanentes que el agente lee automáticamente al iniciar.
- Contenido: Stack, convenciones de código, manejo de secretos, sanitización de datos, flujos de trabajo y política de commits.

### B. Archivo MEMORY.md (Cuaderno de Campo Evolutivo)
- Tamaño: Máximo 50 líneas (resumir o purgar periódicamente).
- Propósito: Registro dinámico de avances y decisiones técnicas inmediatas.

# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- [Funcionalidad / Versión]: Estado de implementación actual.

## Decisiones (y por qué)
- [Decisión Técnica]: Justificación rápida. Para decisiones estructurales grandes, ver docs/adr/.

## Aprendizajes y errores a evitar
- [Error o bug superado a no repetir].

## Próximos pasos
- [Pendiente inmediato].

### C. Gestión de Conocimiento Extendida (Engram / ADRs)
- Segundo Cerebro (Engram): Cualquier idea de refactorización a futuro, snippets reutilizables, o investigación teórica que exceda las 50 líneas de MEMORY.md debe ser documentada por fuera del repositorio (ej. Engram).
- ADRs (Architecture Decision Records): Para decisiones de alto impacto (arquitectura o seguridad), el agente debe generar un registro formal en la carpeta docs/adr/ para preservar la historia técnica.

### D. Reglas de Integración para AGENTS.md
Añadir el siguiente bloque a tu AGENTS.md para estandarizar el comportamiento:

## Protocolo de Proyecto
- Al empezar, lee MEMORY.md para conocer el estado y docs/constitution.md para los principios.
- Al terminar una tarea, actualiza MEMORY.md. Mantenlo breve (~50 líneas).
- Commits: Usa OBLIGATORIAMENTE Conventional Commits (feat:, fix:, chore:, refactor:, etc.).
- Seguridad y Datos: PROHIBIDO hardcodear credenciales, tokens o contraseñas. Usa SIEMPRE variables de entorno y documéntalas en un archivo .env.example vacío. Nunca confíes en el input del usuario (Sanitiza y tipa estrictamente).
- Issue Tracking: Las tareas de tasks.md pueden sincronizarse con tickets de Jira/Linear.

## Protocolo de Inicio de Nueva Funcionalidad
Antes de escribir código, prepárame un plan con:
1. Cómo la vas a implementar, respetando las reglas de AGENTS.md.
2. Qué archivos vas a modificar y qué cambia en cada uno.
3. Los casos límite (incluyendo vectores de ataque o fallos) y las dudas que debo decidir yo antes de empezar.
4. Qué actualizarías en AGENTS.md y en MEMORY.md.
Ten en cuenta el estado actual del proyecto: @MEMORY.md
⚠️ No modifiques ningún archivo hasta que apruebe el plan.

---

## 3. EXTENSIÓN DE CAPACIDADES: SKILLS & MCPS

### A. Skills Modulares (skills.sh)
Se instalan mediante: npx skills add vercel-labs/agent-skills
- find-skills: Descubre e instala nuevas skills bajo demanda.
- grill-me: Cuestiona e interroga el plan antes de implementar.
- systematic-debugging: Depura metódicamente (reproducir, aislar, formular hipótesis, verificar).
- frontend-design: crea interfaces con un diseño cuidado y
profesional.
- web-design-guidelines: revisa la interfaz y detecta problemas de
accesibilidad, UX y diseño.

### B. Servidores MCP (Model Context Protocol)
- UI/E2E Testing (ej. Playwright / Appium): Abre la aplicación, ejecuta pruebas UI y saca capturas.
- Context7 (Upstash): Documentación actualizada de librerías.
- Brave Search / Puppeteer: Búsqueda web en vivo para auditar vulnerabilidades recientes o documentaciones.
- GitHub: Gestión de repositorios, issues y branches.
- Figma: Extracción de tokens y estilos de diseño.
- Bases de Datos (Supabase / SQLite MCP): Inspección directa de DBs para entender esquemas antes de codificar.
- Sentry / Logsnag: Lectura de logs de errores en vivo para diagnosticar bugs de producción.

### C. Regla de Verificación en Vivo (AGENTS.md)
## Verificación y Calidad
- Después de cada cambio, verifica visual o funcionalmente la tarea usando la herramienta correspondiente a tu stack (ej. Chrome DevTools/Playwright para web, Postman/cURL para APIs backend, Appium para móviles).

---

## 4. SPEC-DRIVEN DEVELOPMENT (SDD) & SINTAXIS EARS

SDD establece que primero se define la especificación completa (funcional y de seguridad) antes de escribir código (Secure by Design).

### Plantillas EARS (Easy Approach to Requirements Syntax)
- Permanente: EL SISTEMA <comportamiento permanente>.
- Evento: CUANDO <evento>, EL SISTEMA <respuesta>.
- Estado: MIENTRAS <estado>, EL SISTEMA <respuesta>.
- Condición no deseada: SI <condición no deseada (ej. intento de acceso no autorizado)>, ENTONCES EL SISTEMA <respuesta>.

### El Ciclo de Vida SDD (8 Pasos)
1. Constitución (docs/constitution.md): 6 principios innegociables (Al menos uno debe ser de Seguridad/Privacidad).
2. Especificación (specs/NNN-*/spec.md): El QUÉ y el POR QUÉ usando EARS.
3. Clarificación: Auditoría en rol QA/Security Senior. (Nota: Se puede repetir tras el paso 4 o 5).
4. Planificación (specs/NNN-*/plan.md): Arquitectura, funciones puras, pseudocódigo y UI (o especificación de endpoints/OpenAPI si es un backend).
5. Tareas (specs/NNN-*/tasks.md): Bloques de 20-30 min con checkboxes.
6. Implementación: Ejecutar UNA tarea a la vez con TDD usando el Test Runner del stack (ej. pytest, Jest, JUnit, node --test).
7. Validación: Comprobación RF por RF con los tests automáticos y/o revisión manual.
8. Mantenimiento: Todo cambio impacta primero en la spec, luego en código.

---

## 5. CONFIGURACIÓN FÍSICA DE SDD (SKILLS Y COMANDOS)

### A. Skill Central: agents/skills/sdd/SKILL.md
---
name: sdd
description: Úsala siempre que trabajes con Spec-Driven Development (docs/constitution.md o cualquier archivo dentro de specs/).
---

# Spec-Driven Development (SDD)

## Flujo
Constitución → Spec → Clarificación → Plan → Tareas → Implementación → Validación → Cambio.
- Nunca pases a la siguiente fase sin aprobación.
- La spec manda: si no está en la spec, no se implementa.
- Todo cambio de requisitos va primero a la spec, luego al plan/tareas, y por último al código.
- Cada spec vive en: specs/NNN-nombre/ con spec.md, plan.md y tasks.md.
- Actualiza MEMORY.md al cambiar de fase.

## Plantilla de spec (spec.md)
# Spec NNN — <Nombre>
Estado: borrador | aprobada | implementada

## Contexto, Usuarios e Historias (HU-1)
## Definiciones, Casos límite y Fuera de alcance
## Requisitos no funcionales y de Seguridad (Cifrado, Rate limits, Autenticación)
## Requisitos Funcionales (EARS)
- RF-x: CUANDO <evento>, EL SISTEMA <respuesta>.
- RF-x: SI <condición no deseada>, ENTONCES EL SISTEMA <respuesta>.

## Plan (plan.md) y Tareas (tasks.md)
Plan: Funciones puras, pseudocódigo, Interfaz (o endpoints API si es backend), justificaciones.
Tareas: - [ ] **Tn. <Descripción>.** Hecho cuando: <comprobación>. Máx 30 min.

## Implementación
Una tarea por vez: tests en rojo, código, correr tests del stack en verde, marcar y parar.

---

### B. Tabla de Comandos CLI / Prompts Parametrizados (.opencode/commands/)

| Comando | Fase SDD | Agente | Descripción del Prompt |
| :--- | :--- | :---: | :--- |
| /sdd | Meta | — | Muestra la guía del flujo y plantilla de la spec. |
| /sdd-constitution | Constitución | plan | Genera docs/constitution.md con principios innegociables (incluyendo seguridad). |
| /sdd-spec | Especificación | plan | Entrevista (1 por vez) para generar specs/$1/spec.md en EARS. |
| /sdd-clarify | Clarificación | plan | Audita como QA Senior buscando ambigüedades, fallos lógicos y casos límite. |
| /sdd-plan | Planificación | plan | Crea specs/$1/plan.md con arquitectura, pseudocódigo y endpoints/UI. |
| /sdd-tasks | Tareas | plan | Desglosa en specs/$1/tasks.md (tareas de 20-30 min). |
| /sdd-implement | Implementación | build | Implementa ÚNICAMENTE la tarea indicada ($2). Usa TDD con el runner del stack y se detiene. |
| /sdd-validate | Validación | build | Valida RF por RF con tests y UI/API correspondientes. |
| /sdd-change | Mantenimiento | plan | Impacta un nuevo requisito primero en spec.md y muestra el diff. |
| /sdd-refactor | Limpieza | build | Mejora código (DRY, tipado) SIN alterar ningún Requisito Funcional (RF). |
| /sdd-audit | Seguridad | plan | Busca vulnerabilidades (ej. OWASP), audita dependencias obsoletas y revisa performance previo a un merge. |
| /sdd-ops | DevOps/CI | build | Genera/actualiza configuración de despliegue seguro (Dockerfile, CI/CD pipelines). |
| /sdd-status | Monitoreo | plan | Muestra estado de la spec, tareas completadas e indica el siguiente paso. |

---

## 6. ESTRUCTURA DE ARCHIVOS DEL PROYECTO

.
├── AGENTS.md                          # Reglas globales, stack, convenciones y seguridad
├── MEMORY.md                          # Estado dinámico y decisiones rápidas
├── .env.example                       # Plantilla de variables de entorno seguras (Sin claves reales)
├── Dockerfile                         # (Opcional) Empaquetado y aislamiento del entorno
├── docker-compose.yml                 # (Opcional) Orquestación de servicios locales
├── agents/
│   └── skills/
│       └── sdd/
│           └── SKILL.md               # Skill global de SDD
├── .opencode/
│   └── commands/                      # Comandos CLI parametrizados (/sdd-*)
│       ├── sdd-constitution.md
│       ├── sdd-spec.md
│       ├── sdd-clarify.md
│       ├── sdd-plan.md
│       ├── sdd-tasks.md
│       ├── sdd-implement.md
│       ├── sdd-validate.md
│       ├── sdd-change.md
│       ├── sdd-refactor.md            # Limpieza segura
│       ├── sdd-audit.md               # Análisis estático y auditoría de dependencias
│       ├── sdd-ops.md                 # Despliegue y CI/CD
│       └── sdd-status.md
├── docs/
│   ├── constitution.md                # 6 Principios innegociables del proyecto
│   └── adr/                           # Architecture Decision Records (Historial técnico)
└── specs/
    └── 001-nombre-feature/            # Espacio aislado por funcionalidad
        ├── spec.md                    # Requisitos EARS y de Seguridad
        ├── plan.md                    # Arquitectura, funciones puras y endpoints/UI
        └── tasks.md                   # Checklist de tareas