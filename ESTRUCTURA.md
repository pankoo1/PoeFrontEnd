# 📁 Estructura del Proyecto POERuteo Frontend

## 🎯 Descripción
Frontend para el sistema de control y gestión de reposición en supermercados (ruteo de reponedores).

---

## 📂 Estructura de Carpetas

```
src/
├── pages/                    # Páginas organizadas por rol
│   ├── landing/             # Páginas públicas
│   │   └── Index.tsx        # Landing page principal
│   ├── auth/                # Autenticación
│   │   └── Login.tsx        # Página de login
│   ├── common/              # Páginas compartidas
│   │   ├── NotFound.tsx     # Error 404
│   │   └── Profile.tsx      # Perfil genérico
│   ├── admin/               # Administrador de empresa
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   ├── Products.tsx
│   │   ├── AdminTareasPage.tsx
│   │   ├── MapPage.tsx
│   │   ├── Reportes.tsx
│   │   └── TareasPage.tsx
│   ├── supervisor/          # Supervisor
│   │   ├── SupervisorDashboard.tsx
│   │   ├── SupervisorProfile.tsx
│   │   ├── SupervisorMapPage.tsx
│   │   ├── SupervisorTareas.tsx
│   │   └── ReponedoresPage.tsx
│   ├── reponedor/           # Reponedor
│   │   ├── ReponedorDashboard.tsx
│   │   ├── ReponedorProfile.tsx
│   │   ├── ReponedorMapPage.tsx
│   │   ├── ReponedorTareas.tsx
│   │   ├── ReponedorSemanal.tsx
│   │   └── ReponedoresTareasPage.tsx
│   └── backoffice/          # SuperAdmin
│       ├── BackofficeDashboard.tsx
│       ├── BackofficeEmpresas.tsx
│       ├── BackofficeEmpresaDetalle.tsx
│       ├── BackofficeAuditoria.tsx
│       ├── BackofficeCotizaciones.tsx
│       └── BackofficeFacturas.tsx
│
├── components/              # Componentes reutilizables
│   ├── landing/            # Componentes de landing page
│   │   ├── LandingNavbar.tsx
│   │   ├── LandingHero.tsx
│   │   ├── LandingFeatures.tsx
│   │   ├── LandingContactForm.tsx
│   │   └── LandingFooter.tsx
│   ├── layout/             # Layouts compartidos
│   │   └── BackofficeLayout.tsx
│   ├── shared/             # Componentes compartidos
│   │   ├── Logo.tsx
│   │   └── ProtectedRoute.tsx
│   ├── map/                # Componentes de mapa
│   │   ├── MapViewer.tsx
│   │   ├── map-designer/
│   │   └── plano-editor/
│   ├── forms/              # Formularios
│   └── ui/                 # Shadcn UI components
│
├── services/               # Servicios API
│   ├── api.ts             # API principal
│   └── map.service.ts     # Servicio de mapas
│
├── contexts/              # React Contexts
│   ├── AuthContext.tsx
│   └── ReponedoresContext.tsx
│
├── types/                 # Definiciones TypeScript
│   ├── mapa.ts
│   ├── producto.ts
│   └── tarea.ts
│
├── hooks/                 # Custom hooks
│   └── use-mobile.tsx
│
├── lib/                   # Librerías y utilidades
│   └── utils.ts
│
├── config/                # Configuraciones
│
└── tests/                 # Tests unitarios
```

---

## 🎭 Roles del Sistema

### 1. **SuperAdmin** (Backoffice)
- Gestión de empresas clientes
- Auditoría del sistema
- Cotizaciones y facturación
- Acceso completo al sistema

### 2. **Admin** (Administrador de Empresa)
- Dashboard de su empresa
- Gestión de usuarios
- Gestión de productos
- Creación y asignación de tareas
- Reportes y métricas

### 3. **Supervisor**
- Dashboard de supervisión
- Gestión de reponedores
- Visualización de rutas en mapa
- Seguimiento de tareas

### 4. **Reponedor**
- Dashboard personal
- Tareas asignadas
- Navegación con mapa
- Reporte semanal

---

## 🛣️ Rutas Principales

```typescript
/                              # Landing page pública
/login                         # Login

# Backoffice (SuperAdmin)
/backoffice                    # Dashboard
/backoffice/empresas           # Gestión de empresas
/backoffice/empresas/:id       # Detalle de empresa
/backoffice/auditoria          # Auditoría
/backoffice/cotizaciones       # Cotizaciones
/backoffice/facturas           # Facturación

# Admin
/dashboard                     # Dashboard admin
/users                         # Gestión de usuarios
/products                      # Gestión de productos
/map                          # Mapa de rutas
/reportes                     # Reportes

# Supervisor
/supervisor/dashboard          # Dashboard supervisor
/supervisor/reponedores        # Gestión de reponedores
/supervisor/map               # Mapa de supervisión
/supervisor/tareas            # Tareas del equipo

# Reponedor
/reponedor/dashboard          # Dashboard reponedor
/reponedor/tareas             # Mis tareas
/reponedor/map               # Mapa de ruta
/reponedor/semanal           # Reporte semanal
```

---

## 🔧 Tecnologías

- **React 18** con TypeScript
- **React Router v6** para navegación
- **Shadcn/UI** para componentes
- **Tailwind CSS** para estilos
- **Lucide React** para iconos
- **Vite** como bundler
- **Vitest** para testing

---

## 📦 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run test         # Ejecutar tests
npm run lint         # Linter
```

---

## 🗂️ Convenciones

1. **Nombres de archivos**: PascalCase para componentes (`.tsx`)
2. **Carpetas**: lowercase con guiones
3. **Componentes**: Un componente por archivo
4. **Imports**: Usar alias `@/` para imports absolutos
5. **Tipos**: Definir interfaces en carpeta `types/`

---

## 🚀 Próximas Mejoras

- [ ] Crear layouts específicos por rol (AdminLayout, SupervisorLayout, ReponedorLayout)
- [ ] Consolidar servicios de API
- [ ] Añadir más tipos TypeScript
- [ ] Mejorar testing coverage
- [ ] Documentación de componentes

---

**Última actualización**: 29 de noviembre de 2025
