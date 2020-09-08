module.exports = data => ({
  '@context': 'https://openactive.io/',
  '@type': 'Order',
  orderedItem: [
    {
      '@type': 'OrderItem',
      '@id': `${data.orderItemId}`,
      orderItemStatus: 'https://openactive.io/CustomerCancelled',
    },
  ],
});
