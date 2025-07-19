// RESTORED manage_products.js (before UOM)
document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('product-table-body');
    const addProductForm = document.getElementById('addProductForm');

    // ----------- LOAD PRODUCTS -----------
    fetch('/getproducts')
        .then(response => response.json())
        .then(products => {
            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.custom_id}</td>
                    <td>${product.product_id}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${product.description}</td>
                    <td>${product.unit}</td>
                    <td>${product.price}</td>
                    <td>${product.stock_quantity}</td>
                    <td><img src="${product.image_url}" alt="Product Image" /></td>
                    <td>${product.rating}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-btn me-2" data-id="${product.product_id}" title="Edit Product">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${product.product_id}" title="Delete Product">
                            🗑️ Delete
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading products:', error);
            showToast('Failed to load products', true);
        });

    // ----------- DELETE PRODUCT -----------
    document.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('delete-btn')) {
            const button = e.target;
            const productId = button.getAttribute('data-id');

            if (confirm(`Are you sure you want to delete product ID ${productId}?`)) {
                fetch(`/delete-product/${productId}`, {
                    method: 'DELETE'
                })
                    .then(response => response.json())
                    .then(data => {
                        const row = button.closest('tr');
                        if (row) row.remove();
                        showToast(`Product ${productId} deleted successfully`);
                    })
                    .catch(error => {
                        console.error('Delete failed:', error);
                        showToast('Error deleting product', true);
                    });
            }
        }
    });

    // ----------- OPEN EDIT MODAL -----------
    document.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('edit-btn')) {
            const productId = e.target.getAttribute('data-id');
            const row = e.target.closest('tr');
            const cells = row.querySelectorAll('td');

            document.getElementById('edit-product-id').value = productId;
            document.getElementById('edit-name').value = cells[2].innerText;
            document.getElementById('edit-category').value = cells[3].innerText;
            document.getElementById('edit-description').value = cells[4].innerText;
            document.getElementById('edit-unit').value = cells[5].innerText;
            document.getElementById('edit-price').value = cells[6].innerText;
            document.getElementById('edit-stock').value = cells[7].innerText;
            document.getElementById('edit-image').value = cells[8].querySelector('img')?.src || '';
            document.getElementById('edit-rating').value = cells[9].innerText;

            const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
            editModal.show();
        }
    });

    // ----------- ADD PRODUCT FORM -----------
    if (addProductForm) {
        addProductForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(addProductForm);
            const product = {};
            formData.forEach((value, key) => {
                product[key] = value;
            });

            fetch('/addproduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showToast('Product added successfully!');
                        setTimeout(() => location.reload(), 800);
                    } else {
                        showToast('Failed to add product.', true);
                    }
                })
                .catch(error => {
                    console.error('Add product failed:', error);
                    showToast('Error adding product.', true);
                });
        });
    }

    // ----------- EDIT PRODUCT FORM SUBMIT -----------
    const editProductForm = document.getElementById('editProductForm');
    if (editProductForm) {
        editProductForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(editProductForm);
            const updatedProduct = {};
            formData.forEach((value, key) => {
                updatedProduct[key] = value;
            });

            const productId = document.getElementById('edit-product-id').value;

            fetch(`/updateproduct/${productId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProduct)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showToast('Product updated successfully!');
                        setTimeout(() => location.reload(), 800);
                    } else {
                        showToast('Failed to update product.', true);
                    }
                })
                .catch(error => {
                    console.error('Update failed:', error);
                    showToast('Error updating product.', true);
                });
        });
    }
});

// ----------- TOAST FUNCTION -----------
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = `toast-message ${isError ? 'error' : 'success'}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}