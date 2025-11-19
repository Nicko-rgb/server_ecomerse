// Modelo de Usuario para el perfil
class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phone = data.phone;
    this.avatar = data.avatar;
    this.dateOfBirth = data.dateOfBirth;
    this.gender = data.gender;
    this.addresses = data.addresses || [];
    this.paymentMethods = data.paymentMethods || [];
    this.preferences = data.preferences || {};
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Método para obtener el nombre completo
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // Método para obtener la dirección principal
  getPrimaryAddress() {
    return this.addresses.find(addr => addr.isPrimary) || this.addresses[0];
  }

  // Método para obtener el método de pago principal
  getPrimaryPaymentMethod() {
    return this.paymentMethods.find(pm => pm.isPrimary) || this.paymentMethods[0];
  }
}

module.exports = User;