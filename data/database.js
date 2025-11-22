// Base de datos simulada en memoria
// En producción, esto sería reemplazado por una base de datos real

const products = [
  {
    id: 1,
    name: 'Camiseta Básica',
    description: 'Camiseta de algodón 100% de alta calidad. Perfecta para el uso diario.',
    price: 29.99,
    originalPrice: 39.99,
    discount: 25,
    category: 'Ropa',
    stock: 50,
    images: ['https://via.placeholder.com/300/44C38D/FFFFFF?text=Camiseta'],
    featured: true,
    active: true,
    rating: 4.5,
    reviews: 128,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: 'Jeans Slim Fit',
    description: 'Jeans ajustados de mezclilla premium. Cómodos y duraderos.',
    price: 59.99,
    originalPrice: 79.99,
    discount: 25,
    category: 'Ropa',
    stock: 30,
    images: ['https://via.placeholder.com/300/98C9B8/FFFFFF?text=Jeans'],
    featured: false,
    active: true,
    rating: 4.3,
    reviews: 89,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date()
  },
  {
    id: 3,
    name: 'Zapatillas Deportivas',
    description: 'Zapatillas cómodas para running y ejercicio. Suela antideslizante.',
    price: 89.99,
    originalPrice: 119.99,
    discount: 25,
    category: 'Calzado',
    stock: 20,
    images: ['https://via.placeholder.com/300/44C38D/FFFFFF?text=Zapatillas'],
    featured: true,
    active: true,
    rating: 4.8,
    reviews: 256,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date()
  },
  {
    id: 4,
    name: 'Chaqueta de Cuero',
    description: 'Chaqueta de cuero sintético de alta calidad. Estilo moderno.',
    price: 129.99,
    originalPrice: 199.99,
    discount: 35,
    category: 'Ropa',
    stock: 15,
    images: ['https://via.placeholder.com/300/98C9B8/FFFFFF?text=Chaqueta'],
    featured: true,
    active: true,
    rating: 4.6,
    reviews: 67,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date()
  },
  {
    id: 5,
    name: 'Reloj Inteligente',
    description: 'Smartwatch con monitor de frecuencia cardíaca y GPS.',
    price: 199.99,
    originalPrice: 299.99,
    discount: 33,
    category: 'Electrónica',
    stock: 25,
    images: ['https://via.placeholder.com/300/44C38D/FFFFFF?text=Reloj'],
    featured: true,
    active: true,
    rating: 4.7,
    reviews: 342,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date()
  },
  {
    id: 6,
    name: 'Mochila Deportiva',
    description: 'Mochila resistente al agua con múltiples compartimentos.',
    price: 45.99,
    originalPrice: 59.99,
    discount: 23,
    category: 'Accesorios',
    stock: 40,
    images: ['https://via.placeholder.com/300/98C9B8/FFFFFF?text=Mochila'],
    featured: false,
    active: true,
    rating: 4.4,
    reviews: 156,
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date()
  },
  {
    id: 7,
    name: 'Auriculares Bluetooth',
    description: 'Auriculares inalámbricos con cancelación de ruido.',
    price: 79.99,
    originalPrice: 99.99,
    discount: 20,
    category: 'Electrónica',
    stock: 35,
    images: ['https://via.placeholder.com/300/44C38D/FFFFFF?text=Auriculares'],
    featured: false,
    active: true,
    rating: 4.5,
    reviews: 203,
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date()
  },
  {
    id: 8,
    name: 'Gorra Deportiva',
    description: 'Gorra ajustable con protección UV.',
    price: 19.99,
    originalPrice: 24.99,
    discount: 20,
    category: 'Accesorios',
    stock: 60,
    images: ['https://via.placeholder.com/300/98C9B8/FFFFFF?text=Gorra'],
    featured: false,
    active: true,
    rating: 4.2,
    reviews: 94,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date()
  }
];

const orders = [
  {
    id: '12345',
    userId: 1,
    items: [
      { productId: 1, name: 'Camiseta Básica', quantity: 2, price: 29.99 },
      { productId: 2, name: 'Jeans Slim Fit', quantity: 1, price: 59.99 }
    ],
    total: 119.97,
    status: 'delivered',
    shippingAddress: {
      street: 'Calle Principal 123',
      city: 'Ciudad',
      state: 'Estado',
      zipCode: '12345',
      country: 'País'
    },
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    trackingNumber: 'TR123452024',
    notes: '',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: '12346',
    userId: 1,
    items: [
      { productId: 3, name: 'Zapatillas Deportivas', quantity: 1, price: 89.99 }
    ],
    total: 89.99,
    status: 'processing',
    shippingAddress: {
      street: 'Calle Principal 123',
      city: 'Ciudad',
      state: 'Estado',
      zipCode: '12345',
      country: 'País'
    },
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    trackingNumber: null,
    notes: '',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date()
  },
  {
    id: '12347',
    userId: 2,
    items: [
      { productId: 5, name: 'Reloj Inteligente', quantity: 1, price: 199.99 },
      { productId: 6, name: 'Mochila Deportiva', quantity: 1, price: 45.99 }
    ],
    total: 245.98,
    status: 'shipped',
    shippingAddress: {
      street: 'Avenida Central 456',
      city: 'Ciudad',
      state: 'Estado',
      zipCode: '54321',
      country: 'País'
    },
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    trackingNumber: 'TR123472024',
    notes: 'Entrega urgente',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date()
  }
];

const users = [
  {
    id: 1,
    email: 'usuario@ejemplo.com',
    password: '$2a$10$j63FdQ7NsUo1Zxggzq5Nz.1A4njEOP0qe7CgHZ1hiSGJPyfNTr8F6', // password123
    firstName: 'Juan',
    lastName: 'Pérez',
    phone: '+1234567890',
    avatar: 'https://via.placeholder.com/150',
    dateOfBirth: '1990-01-15',
    gender: 'male',
    role: 'customer',
    active: true,
    addresses: [
      {
        id: 1,
        type: 'home',
        street: 'Calle Principal 123',
        city: 'Ciudad',
        state: 'Estado',
        zipCode: '12345',
        country: 'País',
        isPrimary: true
      }
    ],
    paymentMethods: [
      {
        id: 1,
        type: 'credit_card',
        cardNumber: '**** **** **** 1234',
        cardHolder: 'Juan Pérez',
        expiryDate: '12/25',
        isPrimary: true
      }
    ],
    preferences: {
      notifications: true,
      newsletter: false,
      language: 'es'
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date()
  },
  {
    id: 2,
    email: 'admin@ejemplo.com',
    password: '$2a$10$zN2biyaDlomHii26L.pXZ.8.kpdWNaZmryUniaXE3VJAulbeLH57G', // admin123
    firstName: 'Admin',
    lastName: 'Sistema',
    phone: '+1234567891',
    avatar: 'https://via.placeholder.com/150',
    dateOfBirth: '1985-05-20',
    gender: 'male',
    role: 'admin',
    active: true,
    addresses: [],
    paymentMethods: [],
    preferences: {
      notifications: true,
      newsletter: true,
      language: 'es'
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date()
  },
  {
    id: 3,
    email: 'maria@ejemplo.com',
    password: '$2a$10$y9Q/xcBPhMheSPDj8Hx6KupcafiUzZhEE1T1KGoFDoAj0dqMCAVK6', // password123
    firstName: 'María',
    lastName: 'García',
    phone: '+1234567892',
    avatar: 'https://via.placeholder.com/150',
    dateOfBirth: '1992-08-10',
    gender: 'female',
    role: 'customer',
    active: true,
    addresses: [
      {
        id: 2,
        type: 'home',
        street: 'Avenida Central 456',
        city: 'Ciudad',
        state: 'Estado',
        zipCode: '54321',
        country: 'País',
        isPrimary: true
      }
    ],
    paymentMethods: [
      {
        id: 2,
        type: 'debit_card',
        cardNumber: '**** **** **** 5678',
        cardHolder: 'María García',
        expiryDate: '06/26',
        isPrimary: true
      }
    ],
    preferences: {
      notifications: true,
      newsletter: true,
      language: 'es'
    },
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date()
  }
];

module.exports = {
  products,
  orders,
  users
};