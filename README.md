# Ecommerce API Server – Arquitectura y Flujo de Datos

## Visión General

- API REST construida con Express y Sequelize sobre Postgres.
- Base de rutas bajo `'/api'` (`server_ecomerse/server.js:20-23`).
- Salud del sistema en `GET /health` con verificación de conexión a DB (`server_ecomerse/server.js:48-55`).
- Sincronización de modelos controlada por `.env` (`DB_FORCE_SYNC`, `DB_ALTER_SYNC`) (`server_ecomerse/models/index.js:21-25`).
- Poblamiento inicial controlado por `SEED_INITIAL_DATA` con catálogos y productos (`server_ecomerse/config/seed.js:11-16,57-66`).

## Arquitectura del Servidor

- Arranque:
  - Autenticación DB (`sequelize.authenticate`) y logs coloreados (`server_ecomerse/server.js:31-35`).
  - Inicialización de asociaciones y `sync()` con opciones `.env` (`server_ecomerse/models/index.js:21-25`).
  - Ejecución de seeder idempotente (`server_ecomerse/server.js:35-40`).
- Ruteo:
  - Auth (público): `authRoutes` (`server_ecomerse/server.js:20`).
  - Productos (público): `productsRoutes` (`server_ecomerse/server.js:21`).
  - Perfil (protegido): `profileRoutes` (`server_ecomerse/server.js:22`, `server_ecomerse/routes/profileRoutes.js:10-19`).
  - Admin (protegido): `adminRoutes` (`server_ecomerse/server.js:23`).

## Modelos y Relaciones

- Usuario
  - `User` con PK mapeada a columna real `id` (`server_ecomerse/models/User.js:5-9`).
  - Campos: `email`, `password`, `first_name`, `last_name`, `role`, `active`, etc.
- Datos complementarios del usuario
  - `DataUser` 1–1 con `User` (`server_ecomerse/models/index.js:13-14`).
  - Campos estructurados: `address`, `city`, `postal_code`, `country`, `preferred_payment_method_id` (`server_ecomerse/models/DataUser.js:14-29`).
  - Relación opcional a método de pago preferido (`preferredPaymentMethod`) (`server_ecomerse/models/index.js:15`).
- Catálogo de métodos de pago
  - `PaymentMethod` (catálogo global): `code`, `name`, `is_active` (`server_ecomerse/models/PaymentMethod.js:13-28`).
  - Seed inicial: `card`, `paypal`, `yape`, `plin` (`server_ecomerse/config/seed.js:57-66`).
- Países y monedas
  - `Country`: `code`, `name`, `currency_code`, `currency_name`, `currency_symbol` (`server_ecomerse/models/Country.js:1-38`).
  - Seed inicial si vacío (`server_ecomerse/config/seed.js:33-45`).
- Productos y categorías
  - `Product` pertenece a `Categories` (`server_ecomerse/models/index.js:19-20`).
  - `description` como `TEXT` para descripciones largas (`server_ecomerse/models/Product.js:14-17`).
  - `is_featured` para marcar productos top (`server_ecomerse/models/Product.js:38-46`).
- Pedidos
  - `Order` 1–N `OrderItem` y `Order` N–1 `User` (`server_ecomerse/models/index.js:21-24`).

- Promociones
  - `Promotion`: tipo (`percentage|fixed`), valor y vigencia (`start_at`, `end_at`) (`server_ecomerse/models/Promotion.js:1-42`).
  - `PromotionProduct`: asociación promoción↔producto (`server_ecomerse/models/PromotionProduct.js:1-25`).
  - Asociaciones (`server_ecomerse/models/index.js:33-41`).

## Rutas y Flujos

### Autenticación

- Registro `POST /api/auth/register`:
  - Valida datos, encripta contraseña, crea `User` y `DataUser` vacío, retorna `token` JWT y usuario (`server_ecomerse/controllers/authController.js:20-71`).
- Login `POST /api/auth/login`:
  - Valida credenciales y retorna `token` y usuario (`server_ecomerse/controllers/authController.js:73-111`).
- Verificación `GET /api/auth/verify`:
  - Retorna usuario autenticado (`server_ecomerse/controllers/authController.js:113-143`).
- Cambio de contraseña `POST /api/auth/change-password`:
  - Valida contraseña actual y actualiza (`server_ecomerse/controllers/authController.js:145-177`).

### Perfil del Usuario

- Obtener perfil `GET /api/profile/:id`:
  - Retorna `User` + `DataUser` + catálogo de métodos preferidos via `preferred_payment_method_id` (`server_ecomerse/controllers/profileController.js:8-27`).
- Actualizar perfil `PUT /api/profile/:id`:
  - Actualiza `User` y `DataUser` (dirección principal y campos complementarios) (`server_ecomerse/controllers/profileController.js:31-41`).
- Direcciones
  - Listar `GET /api/profile/:id/addresses` retorna `DataUser.addresses` (`server_ecomerse/controllers/profileController.js:45-50`).
  - Agregar `POST /api/profile/:id/addresses` inserta en `addresses` y gestiona `isPrimary` (`server_ecomerse/controllers/profileController.js:52-69`).
- Métodos de pago (preferencia)
  - Listar catálogo con preferencia marcada `GET /api/profile/:id/payment-methods` (`server_ecomerse/controllers/profileController.js:69-77`).
  - Establecer preferencia `POST /api/profile/:id/payment-methods` con `paymentMethodId` (`server_ecomerse/controllers/profileController.js:79-89`).

### Productos

- Público:
  - `GET /api/products` lista con filtros (`server_ecomerse/controllers/productsController.js`).
  - `GET /api/products/featured`, `GET /api/products/categories`, `GET /api/products/:id`.
  - Destacados filtran `is_featured: true` (`server_ecomerse/controllers/productsController.js:69-75`).
- Admin:
  - CRUD completo en `adminController` (`server_ecomerse/controllers/adminController.js:91-134,136-167`).

### Admin

- Dashboard: estadísticas de productos, pedidos, usuarios (`server_ecomerse/controllers/adminController.js:63-81`).
- Actividad reciente: últimos pedidos y usuarios (`server_ecomerse/controllers/adminController.js:83-89`).
- Usuarios: listado, detalle, actualización (`server_ecomerse/controllers/adminController.js:169-202`).
- Promociones:
  - Listar `GET /api/admin/promotions` (`server_ecomerse/controllers/adminController.js:205-214`).
  - Detalle `GET /api/admin/promotions/:id` (`server_ecomerse/controllers/adminController.js:216-223`).
  - Crear `POST /api/admin/promotions` (`server_ecomerse/controllers/adminController.js:225-233`).
  - Actualizar `PUT /api/admin/promotions/:id` (`server_ecomerse/controllers/adminController.js:235-248`).
  - Eliminar `DELETE /api/admin/promotions/:id` (`server_ecomerse/controllers/adminController.js:250-257`).

## Flujo de Compras (propuesto)

1. Selección de productos:
   - Cliente consume `GET /api/products` y detalle `GET /api/products/:id`.
2. Carrito y dirección:
   - Cliente gestiona direcciones vía `DataUser.addresses` y marca una `isPrimary` para envío.
3. Método de pago:
   - Cliente elige del catálogo `GET /api/profile/:id/payment-methods` y establece preferencia con `POST`.
4. Creación de pedido (a implementar):
   - `POST /api/orders` con `items`, `shippingAddressId` o datos de envío del perfil y `paymentMethodId`.
   - Server crea `Order` y `OrderItem` y retorna estado inicial `pending`.
5. Procesamiento y estados:
   - Admin actualiza estado y tracking en `PUT /api/admin/orders/:id` (`server_ecomerse/controllers/adminController.js:156-167`).

## Configuración y Entorno

- DB:
  - Variables en `.env`: `URL_DATABASE` o `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (`server_ecomerse/config/db.js:3-12`).
- Sincronización:
  - `DB_FORCE_SYNC` y `DB_ALTER_SYNC` aplicados en `syncModels()` (`server_ecomerse/models/index.js:21-25`).
- Seed:
  - `SEED_INITIAL_DATA` controla si se pobla en arranque (`server_ecomerse/config/seed.js:11-16`).

## Poblamiento Inicial

- Productos y categorías si no existen (`server_ecomerse/config/seed.js:17-32,68-82`).
- Países y monedas (`server_ecomerse/config/seed.js:33-45`).
- Catálogo de métodos de pago (`server_ecomerse/config/seed.js:57-66`).
- Promoción de ejemplo “Bienvenida 10%” si no existen promociones (`server_ecomerse/config/seed.js:84-99`).
- Idempotente: omite si hay datos y loguea el estado.

## Logging y Salud

- Logs con `chalk`: conexión y sincronización (`server_ecomerse/server.js:31-40`).
- `GET /health` devuelve `{ status, db, time, uptime }` (`server_ecomerse/server.js:48-55`).

## Integración con el Cliente

- Base URL: el cliente normaliza `EXPO_PUBLIC_API_URL` para que termine en `/api` (`client_ecomerse/src/config/api.js:8-15`).
- Interceptor de token: añade `Authorization: Bearer` en cada request (`client_ecomerse/src/config/api.js:18-27`).
- Hooks consumen rutas públicas y protegidas (`client_ecomerse/src/modules/products/hooks/useProducts.js:14-18,70-77,88-98`).

## Extensiones Futuras

- Endpoints públicos de catálogo: `GET /api/catalog/countries`, `GET /api/catalog/payment-methods`.
- Creación de pedido para usuarios (`POST /api/orders`) y historiales.
- Validación estricta de `DataUser.country` contra `Country` via `country_id`.
