document.addEventListener('DOMContentLoaded', function () {
    fetch('/getorders')
        .then(response => response.json())
        .then(data => {
        const tableBody = document.querySelector('#ordersTable tbody');
        data.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${order.order_id}</td>
            <td>${order.customer_name}</td>
            <td>${order.total_cost}</td>
            <td>${order.phone_number}</td>
            <td>${order.date_time}</td>
            <td>
                <a class="btn btn-sm btn-primary" href="/order-view?order_id=${order.order_id}">View</a>
                <a class="btn btn-sm btn-warning ms-1" href="/select-products?order_id=${order.order_id}">Edit</a>
                <button class="btn btn-sm btn-danger ms-1" onclick="deleteOrder(${order.order_id})">Delete</button>
            </td>
            `;
            tableBody.appendChild(row);
        });
        })
        .catch(err => console.error('Error fetching orders:', err));
    });

    async function deleteOrder(orderId) {
        if (!confirm("Are you sure you want to delete this order?")) return;

        const res = await fetch(`/delete-order/${orderId}`, {
            method: "DELETE"
        });

        const data = await res.json();
        if (data.success) {
            alert("Order deleted.");
            location.reload();
        } else {
            alert("Failed to delete order.");
        }
    }

    