const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get("order_id");
let selectedProducts = [];
let allProducts = [];

document.addEventListener('DOMContentLoaded', async function () {
  const customerNameInput = document.getElementById("customer_name");
  const phoneNumberInput = document.getElementById("phone_number");

  const res = await fetch('/getproducts');
  allProducts = await res.json();

  if (orderId) {
    const orderRes = await fetch(`/order-info/${orderId}`);
    const orderData = await orderRes.json();

    if (orderData.success) {
      customerNameInput.value = orderData.customer_name;
      phoneNumberInput.value = orderData.phone_number;

      selectedProducts = orderData.products.map(p => ({
        ...p,
        quantity: parseFloat(p.quantity)
      }));
    }
  }

  renderProductForm();
  calculateAndUpdateTotal();

  document.getElementById('productForm').addEventListener('input', () => {
    selectedProducts = [];
    document.querySelectorAll('.quantity-input').forEach(input => {
      const quantity = parseFloat(input.value);
      if (quantity > 0) {
        const productId = parseInt(input.dataset.productId);
        const product = allProducts.find(p => p.product_id === productId);
        selectedProducts.push({
          ...product,
          quantity
        });
      }
    });
    calculateAndUpdateTotal();
  });

  document.getElementById("productForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const customer_name = customerNameInput.value.trim();
    const phone_number = phoneNumberInput.value.trim();

    if (!customer_name || !phone_number) {
      alert("Please enter both customer name and phone number.");
      return;
    }

    if (!/^\d{10}$/.test(phone_number)) {
      alert("Phone number must be 10 digits.");
      return;
    }

    if (selectedProducts.length === 0) {
      alert("Please select at least one product.");
      return;
    }

    const payload = {
      customer_name,
      phone_number,
      total_cost: calculateTotal(),
      items: selectedProducts.map(p => ({
        product_id: p.product_id,
        quantity: p.quantity
      }))
    };

    const url = orderId ? `/update-order/${orderId}` : '/addorder';

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.success) {
      alert(`✅ Order ${orderId ? "updated" : "placed"} successfully!`);
      window.location.href = "/order-details";
    } else {
      alert("❌ Failed to save order.");
    }
  });
});

function renderProductForm() {
  const productList = document.getElementById('productList');
  productList.innerHTML = '';

  allProducts.forEach(product => {
    const existing = selectedProducts.find(p => p.product_id === product.product_id);
    const quantity = existing ? existing.quantity : '';

    const div = document.createElement('div');
    div.className = 'col-md-6 mb-3';
    div.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5>${product.name}</h5>
          <p>₹${product.price} per ${product.unit}</p>
          <input type="number" class="form-control quantity-input"
            data-price="${product.price}"
            data-product-id="${product.product_id}"
            placeholder="Quantity"
            min="0" value="${quantity}">
        </div>
      </div>
    `;
    productList.appendChild(div);
  });
}

function calculateTotal() {
  let total = 0;
  selectedProducts.forEach(p => {
    total += p.quantity * parseFloat(p.price);
  });
  return total;
}

function calculateAndUpdateTotal() {
  const total = calculateTotal();
  document.getElementById('totalCost').textContent = total.toFixed(2);
}

