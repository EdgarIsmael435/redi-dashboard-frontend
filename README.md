# REDi — Dashboard Frontend

Panel de administración en tiempo real para operadores del sistema REDi. Permite gestionar el flujo de recargas móviles recibidas vía WhatsApp, visualizar estados con Socket.IO, administrar colas de atención por cliente y controlar acceso por roles.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React 19 |
| Build tool | Vite 7 + SWC |
| Routing | React Router 7 |
| Tiempo real | Socket.IO Client 4 |
| Estilos | Tailwind CSS 4 |
| Animaciones | Framer Motion 12 |
| Iconos | Lucide React |
| HTTP | Axios |
| Selectores | React Select |
| Exportación | xlsx (SheetJS) |

## Características principales

- **Vista en tiempo real** — Las recargas entrantes aparecen instantáneamente vía Socket.IO sin recargar la página.
- **Gestión de estados** — Cambio de estado por recarga: pendiente → en proceso → completada.
- **Control por roles** — Acceso diferenciado entre administradores y operadores.
- **Cola de atención** — Asignación de recargas por operador disponible.
- **Exportación a Excel** — Generación de reportes en `.xlsx` desde el panel.
- **Diseño glassmorphism** — UI moderna con animaciones via Framer Motion, optimizada para uso operativo continuo.

## Variables de entorno

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## Instalación y ejecución

```bash
# Clonar el repositorio
git clone https://github.com/EdgarIsmael435/redi-dashboard-frontend.git
cd redi-dashboard-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar VITE_API_URL y VITE_SOCKET_URL apuntando al backend

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Requisitos previos

- Node.js 18+
- Backend [`redi-bot-backend`](https://github.com/EdgarIsmael435/redi-bot-backend) corriendo y accesible

## Despliegue en producción

El build generado en `dist/` se sirve como sitio estático vía Nginx:

```nginx
server {
    listen 80;
    root /var/www/redi-dashboard/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Repositorio relacionado

- **API y bot de WhatsApp:** [redi-bot-backend](https://github.com/EdgarIsmael435/redi-bot-backend)
