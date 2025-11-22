const Product = require('../models/Product');
const { products } = require('../data/database');

// Usar productos de la base de datos compartida
const oldProducts = [
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
  }
];

const productsController = {
  // Obtener todos los productos (para clientes)
  getAllProducts: (req, res) => {
    try {
      const { category, featured, search, minPrice, maxPrice } = req.query;
      let filteredProducts = products.filter(p => p.active);

      if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }

      if (featured === 'true') {
        filteredProducts = filteredProducts.filter(p => p.featured);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        );
      }

      if (minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
      }

      if (maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
      }

      res.json({
        success: true,
        data: filteredProducts.map(p => new Product(p)),
        total: filteredProducts.length
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  },

  // Obtener producto por ID
  getProductById: (req, res) => {
    try {
      const product = products.find(p => p.id == req.params.id && p.active);
      
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json({
        success: true,
        data: new Product(product)
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  },

  // Obtener productos destacados
  getFeaturedProducts: (req, res) => {
    try {
      const featuredProducts = products.filter(p => p.featured && p.active);

      res.json({
        success: true,
        data: featuredProducts.map(p => new Product(p))
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener productos destacados' });
    }
  },

  // Obtener categorías disponibles
  getCategories: (req, res) => {
    try {
      const categories = [...new Set(products.filter(p => p.active).map(p => p.category))];

      res.json({
        success: true,
        data: categories.map(cat => ({
          name: cat,
          count: products.filter(p => p.category === cat && p.active).length
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener categorías' });
    }
  },

  // Obtener productos relacionados
  getRelatedProducts: (req, res) => {
    try {
      const product = products.find(p => p.id == req.params.id);
      
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      const relatedProducts = products
        .filter(p => 
          p.id !== product.id && 
          p.category === product.category && 
          p.active
        )
        .slice(0, 4);

      res.json({
        success: true,
        data: relatedProducts.map(p => new Product(p))
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener productos relacionados' });
    }
  }
};

module.exports = productsController;