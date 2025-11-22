# 🎮 Controllers - Lógica de Negocio

## 📋 Descripción

Los controllers contienen la lógica de negocio de la aplicación. Cada controller maneja las operaciones de un módulo específico y se conecta con los modelos de MongoDB.

---

## 📂 Controllers Disponibles

### 1. `authController.js` - Autenticación

**Propósito**: Manejo de autenticación y autorización

**Funciones**:

#### `register(req, res)`
Registra un nuevo usuario en el sistema.

**Request**:
```javascript
POST /api/auth/register
{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

**Response**:
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

**Proceso**:
1. Validar datos de entrada
2. Verificar que el email no exista
3. Encriptar contraseña con bcrypt
4. Crear usuario en la base de datos
5. Generar token JWT
6. Retornar token y datos del usuario

---

#### `login(req, res)`
Inicia sesión de un usuario existente.

**Request**:
```javascript
POST /api/auth/login
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Response**:
```javascript
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

**Proceso**:
1. Buscar usuario por email
2. Verificar que el usuario exista
3. Comparar contraseña con bcrypt
4. Generar token JWT
5. Retornar token y datos del usuario

---

#### `verify(req, res)`
Verifica si un token JWT es válido.

**Request**:
```javascript
GET /api/auth/verify
Headers: { Authorization: Bearer <token> }
```

**Response**:
```javascript
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

**Proceso**:
1. Middleware verifica el token
2. Buscar usuario por ID del token
3. Retornar datos del usuario

---

#### `changePassword(req, res)`
Cambia la contraseña de un usuario.

**Request**:
```javascript
POST /api/auth/change-password
Headers: { Authorization: Bearer <token> }
{
  "currentPassword": "password123",
  "newPassword": "newPassword456"
}
```

**Proceso**:
1. Verificar contraseña actual
2. Validar nueva contraseña
3. Encriptar nueva contraseña
4. Actualizar en la base de datos

---

### 2. `productController.js` - Productos

**Propósito**: Gestión del catálogo de productos

**Funciones**:

#### `getProducts(req, res)`
Obtiene lista de productos con filtros opcionales.

**Query Params**:
- `category` - Filtrar por categoría
- `minPrice` - Precio mínimo
- `maxPrice` - Precio máximo
- `search` - Búsqueda por nombre
- `featured` - Solo productos destacados

**Ejemplo**:
```javascript
GET /api/products?category=Tecnología&minPrice=100&maxPrice=1000
```

---

#### `getProductById(req, res)`
Obtiene detalles de un producto específico.

**Ejemplo**:
```javascript
GET /api/products/123
```

---

#### `getFeaturedProducts(req, res)`
Obtiene productos destacados.

---

#### `getCategories(req, res)`
Obtiene lista de categorías con conteo de productos.

**Response**:
```javascript
{
  "success": true,
  "data": [
    { "name": "Tecnología", "count": 15 },
    { "name": "Ropa", "count": 23 }
  ]
}
```

---

#### `getRelatedProducts(req, res)`
Obtiene productos relacionados basados en categoría.

---

### 3. `orderController.js` - Pedidos

**Propósito**: Gestión de pedidos de usuarios

**Funciones**:

#### `getOrders(req, res)`
Obtiene pedidos del usuario autenticado.

**Request**:
```javascript
GET /api/orders
Headers: { Authorization: Bearer <token> }
```

**Response**:
```javascript
{
  "success": true,
  "data": [
    {
      "id": "order123",
      "items": [...],
      "totalAmount": 299.99,
      "status": "delivered",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### `getOrderById(req, res)`
Obtiene detalles de un pedido específico.

---

#### `createOrder(req, res)`
Crea un nuevo pedido.

**Request**:
```javascript
POST /api/orders
Headers: { Authorization: Bearer <token> }
{
  "items": [
    {
      "product": "product123",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "shippingAddress": { ... },
  "paymentMethod": { ... }
}
```

**Proceso**:
1. Validar items del pedido
2. Verificar stock de productos
3. Calcular total
4. Crear pedido en la base de datos
5. Actualizar stock de productos
6. Enviar confirmación (email, notificación)

---

### 4. `profileController.js` - Perfil de Usuario

**Propósito**: Gestión del perfil de usuario

**Funciones**:

#### `getProfile(req, res)`
Obtiene perfil de un usuario.

---

#### `updateProfile(req, res)`
Actualiza información del perfil.

**Request**:
```javascript
PUT /api/profile/123
Headers: { Authorization: Bearer <token> }
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+1234567890"
}
```

---

#### `getAddresses(req, res)`
Obtiene direcciones del usuario.

---

#### `addAddress(req, res)`
Agrega una nueva dirección.

---

#### `getPaymentMethods(req, res)`
Obtiene métodos de pago del usuario.

---

#### `addPaymentMethod(req, res)`
Agrega un nuevo método de pago.

---

### 5. `adminController.js` - Administración

**Propósito**: Funciones administrativas del sistema

**Funciones**:

#### `getDashboardStats(req, res)`
Obtiene estadísticas del dashboard.

**Response**:
```javascript
{
  "success": true,
  "data": {
    "totalSales": 15000,
    "totalOrders": 150,
    "totalUsers": 500,
    "totalProducts": 75
  }
}
```

---

#### `getRecentActivity(req, res)`
Obtiene actividad reciente del sistema.

---

#### `getProducts(req, res)`
Lista todos los productos (admin).

---

#### `createProduct(req, res)`
Crea un nuevo producto.

**Request**:
```javascript
POST /api/admin/products
Headers: { Authorization: Bearer <token> }
{
  "name": "Nuevo Producto",
  "description": "Descripción",
  "price": 99.99,
  "category": "Tecnología",
  "stock": 50,
  "images": ["url1", "url2"]
}
```

---

#### `updateProduct(req, res)`
Actualiza un producto existente.

---

#### `deleteProduct(req, res)`
Elimina un producto.

---

#### `getOrders(req, res)`
Lista todos los pedidos (admin).

---

#### `updateOrderStatus(req, res)`
Actualiza el estado de un pedido.

**Request**:
```javascript
PUT /api/admin/orders/123/status
{
  "status": "shipped"
}
```

---

#### `getUsers(req, res)`
Lista todos los usuarios.

---

#### `updateUser(req, res)`
Actualiza información de un usuario.

---

## 🔧 Estructura de un Controller

```javascript
// Importar modelos
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Función del controller
exports.functionName = async (req, res) => {
  try {
    // 1. Obtener datos del request
    const { param1, param2 } = req.body;
    const userId = req.user.id; // Del middleware
    
    // 2. Validar datos
    if (!param1) {
      return res.status(400).json({
        success: false,
        error: 'Parámetro requerido'
      });
    }
    
    // 3. Lógica de negocio
    const result = await Model.findById(userId);
    
    // 4. Retornar respuesta
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    // 5. Manejo de errores
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

---

## 🔐 Seguridad en Controllers

### Validación de Entrada
```javascript
// Validar email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ error: 'Email inválido' });
}

// Validar longitud de contraseña
if (password.length < 8) {
  return res.status(400).json({ error: 'Contraseña muy corta' });
}
```

### Sanitización
```javascript
// Limpiar datos de entrada
const sanitizedData = {
  firstName: req.body.firstName.trim(),
  lastName: req.body.lastName.trim()
};
```

### Autorización
```javascript
// Verificar que el usuario solo acceda a sus datos
if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Acceso denegado' });
}
```

---

## 📊 Manejo de Errores

### Errores Comunes

**400 - Bad Request**:
```javascript
res.status(400).json({ error: 'Datos inválidos' });
```

**401 - Unauthorized**:
```javascript
res.status(401).json({ error: 'No autorizado' });
```

**403 - Forbidden**:
```javascript
res.status(403).json({ error: 'Acceso denegado' });
```

**404 - Not Found**:
```javascript
res.status(404).json({ error: 'Recurso no encontrado' });
```

**500 - Internal Server Error**:
```javascript
res.status(500).json({ error: 'Error del servidor' });
```

---

## 🧪 Testing de Controllers

### Ejemplo con Jest:
```javascript
describe('authController', () => {
  test('login con credenciales válidas', async () => {
    const req = {
      body: {
        email: 'test@test.com',
        password: 'password123'
      }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    
    await authController.login(req, res);
    
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          token: expect.any(String)
        })
      })
    );
  });
});
```

---

## 📝 Mejores Prácticas

1. **Separar lógica de negocio**: No poner lógica compleja en controllers
2. **Validar siempre**: Validar todos los datos de entrada
3. **Manejo de errores**: Usar try-catch en todas las funciones async
4. **Respuestas consistentes**: Usar el mismo formato de respuesta
5. **Logging**: Registrar errores importantes
6. **Documentar**: Comentar funciones complejas

---

## 🚀 Agregar un Nuevo Controller

1. **Crear archivo**:
```bash
touch controllers/nuevoController.js
```

2. **Estructura básica**:
```javascript
const Model = require('../models/Model');

exports.getAll = async (req, res) => {
  try {
    const items = await Model.find();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  // ...
};

exports.create = async (req, res) => {
  // ...
};

exports.update = async (req, res) => {
  // ...
};

exports.delete = async (req, res) => {
  // ...
};
```

3. **Crear ruta**:
```javascript
// routes/nuevo.js
const controller = require('../controllers/nuevoController');
router.get('/', controller.getAll);
router.post('/', controller.create);
```

---

## 📚 Recursos

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Error Handling](https://nodejs.org/en/docs/guides/error-handling/)
- [RESTful API Design](https://restfulapi.net/)

---

## 📄 Licencia

Este proyecto es privado y confidencial.
