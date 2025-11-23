# 🖥️ Servidor E-Commerce - Node.js + Express

## 📋 Descripción General

API RESTful para e-commerce desarrollada con Node.js, Express y MongoDB. Incluye autenticación JWT, gestión de productos, pedidos, usuarios y panel de administración.

---

## 🏗️ Estructura del Proyecto

```
server_ecomerse/
├── controllers/     # Lógica de negocio
├── models/          # Modelos de MongoDB
├── routes/          # Rutas de la API
├── middleware/      # Middleware personalizado
├── data/            # Datos iniciales
├── scripts/         # Scripts de utilidad
├── server.js        # Punto de entrada
├── .env             # Variables de entorno
└── package.json     # Dependencias
```

---

## 📂 Carpetas Principales

### `/controllers`
Contiene la lógica de negocio de cada módulo.

**Archivos**:
- `authController.js` - Autenticación (login, register, verify)
- `productController.js` - Gestión de productos
- `orderController.js` - Gestión de pedidos
- `userController.js` - Gestión de usuarios
- `profileController.js` - Perfil de usuario
- `adminController.js` - Panel de administración

**Ejemplo**:
```javascript
// authController.js
exports.login = async (req, res) => {
  const { email, password } = req.body;
  // Lógica de login
  res.json({ success: true, data: { token, user } });
};
```

---

### `/models`
Modelos de datos usando Mongoose (MongoDB).

**Archivos**:
- `User.js` - Modelo de usuario
- `Product.js` - Modelo de producto
- `Order.js` - Modelo de pedido
- `Category.js` - Modelo de categoría

**Ejemplo**:
```javascript
// User.js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});
```

---

### `/routes`
Define las rutas de la API y las conecta con los controladores.

**Archivos**:
- `auth.js` - Rutas de autenticación
- `products.js` - Rutas de productos
- `orders.js` - Rutas de pedidos
- `profile.js` - Rutas de perfil
- `admin.js` - Rutas de administración

**Ejemplo**:
```javascript
// auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify', authMiddleware, authController.verify);

module.exports = router;
```

---

### `/middleware`
Middleware personalizado para autenticación, autorización y validación.

**Archivos**:
- `authMiddleware.js` - Verificación de JWT
- `adminMiddleware.js` - Verificación de rol admin
- `errorHandler.js` - Manejo de errores

**Ejemplo**:
```javascript
// authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};
```

---

### `/data`
Datos iniciales para poblar la base de datos.

**Archivos**:
- `products.json` - Productos de ejemplo
- `users.json` - Usuarios de ejemplo
- `categories.json` - Categorías

---

### `/scripts`
Scripts de utilidad para tareas específicas.

**Archivos**:
- `initPasswords.js` - Inicializar contraseñas encriptadas
- `seedDatabase.js` - Poblar base de datos

---

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env con tus configuraciones
nano .env

# Iniciar servidor
npm start

# Modo desarrollo (con nodemon)
npm run dev
```

---

## 🔐 Variables de Entorno (.env)

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui

# Servidor
PORT=3000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:19006,http://localhost:8081
```

---

## 📦 Dependencias Principales

```json
{
  "express": "Framework web",
  "mongoose": "ODM para MongoDB",
  "jsonwebtoken": "Autenticación JWT",
  "bcrypt": "Encriptación de contraseñas",
  "cors": "Cross-Origin Resource Sharing",
  "dotenv": "Variables de entorno",
  "nodemon": "Auto-restart en desarrollo"
}
```

---

## 🔐 Autenticación y Seguridad

### JWT (JSON Web Tokens)

**Generación de token**:
```javascript
const token = jwt.sign(
  { id: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Verificación de token**:
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### Encriptación de Contraseñas

**Hash**:
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

**Comparación**:
```javascript
const isValid = await bcrypt.compare(password, user.password);
```

### Middleware de Protección

**Rutas protegidas**:
```javascript
router.get('/profile', authMiddleware, profileController.getProfile);
```

**Rutas de admin**:
```javascript
router.get('/admin/users', authMiddleware, adminMiddleware, adminController.getUsers);
```

---

## 📊 Endpoints de la API

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registrar usuario | No |
| POST | `/login` | Iniciar sesión | No |
| GET | `/verify` | Verificar token | Sí |
| POST | `/change-password` | Cambiar contraseña | Sí |

**Ejemplo de request**:
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Ejemplo de response**:
```javascript
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123",
      "email": "usuario@ejemplo.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "user"
    }
  }
}
```

---

### Productos (`/api/products`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar productos | No |
| GET | `/:id` | Obtener producto | No |
| GET | `/featured` | Productos destacados | No |
| GET | `/categories` | Listar categorías | No |
| GET | `/:id/related` | Productos relacionados | No |

**Filtros disponibles**:
```
GET /api/products?category=Tecnología&minPrice=100&maxPrice=1000
```

---

### Perfil (`/api/profile`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/:id` | Obtener perfil | Sí |
| PUT | `/:id` | Actualizar perfil | Sí |
| GET | `/:id/addresses` | Listar direcciones | Sí |
| POST | `/:id/addresses` | Agregar dirección | Sí |
| GET | `/:id/payment-methods` | Listar métodos de pago | Sí |

---

### Pedidos (`/api/orders`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar pedidos del usuario | Sí |
| GET | `/:id` | Obtener pedido | Sí |
| POST | `/` | Crear pedido | Sí |

---

### Admin (`/api/admin`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard/stats` | Estadísticas | Admin |
| GET | `/dashboard/activity` | Actividad reciente | Admin |
| GET | `/products` | Listar productos | Admin |
| POST | `/products` | Crear producto | Admin |
| PUT | `/products/:id` | Actualizar producto | Admin |
| DELETE | `/products/:id` | Eliminar producto | Admin |
| GET | `/orders` | Listar pedidos | Admin |
| PUT | `/orders/:id/status` | Actualizar estado | Admin |
| GET | `/users` | Listar usuarios | Admin |
| PUT | `/users/:id` | Actualizar usuario | Admin |

---

## 🗄️ Modelos de Datos

### User
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String,
  role: String (enum: ['user', 'admin']),
  avatar: String,
  addresses: Array,
  paymentMethods: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### Product
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  images: [String],
  stock: Number,
  rating: Number,
  featured: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String (enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  shippingAddress: Object,
  paymentMethod: Object,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Flujo de Datos

```
Cliente → Request → Express Router → Middleware → Controller → Model → MongoDB
                                                                    ↓
Cliente ← Response ← Express Router ← Middleware ← Controller ← Model
```

---

## 🧪 Testing

### Credenciales de prueba:

**Usuario normal**:
```
Email: usuario@ejemplo.com
Password: password123
```

**Administrador**:
```
Email: admin@ejemplo.com
Password: admin123
```

### Probar endpoints con cURL:

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com","password":"password123"}'
```

**Obtener productos**:
```bash
curl http://localhost:3000/api/products
```

**Obtener perfil (con token)**:
```bash
curl http://localhost:3000/api/profile/123 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🚀 Comandos Útiles

```bash
# Iniciar servidor
npm start

# Modo desarrollo (auto-restart)
npm run dev

# Poblar base de datos
node scripts/seedDatabase.js

# Inicializar contraseñas
node scripts/initPasswords.js

# Ver logs
npm run logs
```

---

## 🐛 Debugging

### Logs:
```javascript
console.log('Debug:', data);
console.error('Error:', error);
```

### MongoDB:
```bash
# Conectar a MongoDB
mongo

# Ver bases de datos
show dbs

# Usar base de datos
use ecommerce

# Ver colecciones
show collections

# Ver documentos
db.users.find()
```

---

## 📝 Convenciones de Código

### Nombres de archivos:
- Controllers: `camelCase.js` (ej: `authController.js`)
- Models: `PascalCase.js` (ej: `User.js`)
- Routes: `camelCase.js` (ej: `auth.js`)

### Estructura de controladores:
```javascript
exports.functionName = async (req, res) => {
  try {
    // Lógica
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### Respuestas de la API:
```javascript
// Éxito
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": "Mensaje de error"
}
```

---

## 🔒 Seguridad

### Mejores prácticas:
- ✅ Contraseñas encriptadas con bcrypt
- ✅ JWT para autenticación
- ✅ Validación de datos de entrada
- ✅ CORS configurado
- ✅ Variables de entorno para secretos
- ✅ Middleware de autorización
- ✅ Rate limiting (recomendado)
- ✅ HTTPS en producción

### Protección de rutas:
```javascript
// Solo usuarios autenticados
router.get('/profile', authMiddleware, controller.getProfile);

// Solo administradores
router.get('/admin/users', authMiddleware, adminMiddleware, controller.getUsers);
```

---

## 📚 Recursos

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [MongoDB Docs](https://docs.mongodb.com/)

---

## 🚨 Errores Comunes

### Error: EADDRINUSE
**Causa**: Puerto ya en uso
**Solución**: Cambiar puerto en `.env` o matar proceso:
```bash
lsof -ti:3000 | xargs kill
```

### Error: MongoNetworkError
**Causa**: MongoDB no está corriendo
**Solución**: Iniciar MongoDB:
```bash
mongod
```

### Error: JWT malformed
**Causa**: Token inválido o mal formado
**Solución**: Verificar formato del token en headers

---

## 👥 Equipo

Para dudas o sugerencias, contacta al equipo de desarrollo.

---

## 📄 Licencia

Este proyecto es privado y confidencial.
