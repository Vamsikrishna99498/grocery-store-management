document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id");

  document.getElementById("orderIdHeading").textContent = orderId;

  const res = await fetch(`/order-info/${orderId}`);
  const data = await res.json();

  if (!data.success) {
    alert("Order not found.");
    return;
  }

  const { customer_name, phone_number, date_time, products } = data;
  document.getElementById("customerName").textContent = customer_name;
  document.getElementById("phoneNumber").textContent = phone_number;
  document.getElementById("dateTime").textContent = date_time;

  let total = 0;
  const tbody = document.getElementById("orderDetailsBody");

  products.forEach(p => {
    const row = document.createElement("tr");
    const itemTotal = p.quantity * parseFloat(p.price);
    total += itemTotal;

    row.innerHTML = `
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>${p.quantity}</td>
        <td>${p.unit}</td>
        <td>₹${parseFloat(p.price).toFixed(2)}</td>
        <td>₹${itemTotal.toFixed(2)}</td>
        `;
    tbody.appendChild(row);
  });

  document.getElementById("grandTotal").textContent = total.toFixed(2);
});
