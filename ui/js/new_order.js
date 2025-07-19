document.getElementById('orderForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const customerName = document.getElementById('customer_name').value.trim();
  const phoneNumber = document.getElementById('phone_number').value.trim();

  if (!customerName || !phoneNumber) {
    alert("Please fill in all required fields.");
    return;
  }

  const queryParams = new URLSearchParams({
    customer_name: customerName,
    phone_number: phoneNumber
  });

  window.location.href = `/select-products/?${queryParams.toString()}`;
});
