// Modelo de Producto
class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.category = data.category;
    this.stock = data.stock;
    this.images = data.images || [];
    this.featured = data.featured || false;
    this.active = data.active !== undefined ? data.active : true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  isInStock() {
    return this.stock > 0;
  }

  getDiscountedPrice(discount) {
    return this.price - (this.price * discount / 100);
  }
}

module.exports = Product;