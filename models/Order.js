// Modelo de Pedido
class Order {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.items = data.items || [];
    this.total = data.total;
    this.status = data.status; // pending, processing, shipped, delivered, cancelled
    this.shippingAddress = data.shippingAddress;
    this.paymentMethod = data.paymentMethod;
    this.paymentStatus = data.paymentStatus; // pending, paid, failed, refunded
    this.trackingNumber = data.trackingNumber;
    this.notes = data.notes;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  getTotalItems() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  canBeCancelled() {
    return ['pending', 'processing'].includes(this.status);
  }

  canBeRefunded() {
    return this.paymentStatus === 'paid' && ['delivered', 'cancelled'].includes(this.status);
  }
}

module.exports = Order;