// Global Variables
let currentEditingId = null;
let currentSection = 'dashboard';

function formatDate() {
    return new Date().toLocaleString("en-US", {
        month: "short", day: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
    });
}

// Modal Functions
function openModal(modalId) {
    console.log("openModal called with:", modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        
        const form = modal.querySelector('form');
        if (form && !currentEditingId) {
            form.reset();
        }
    }
}


function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
    currentEditingId = null;

    resetModalTitles();
}

function resetModalTitles() {
    const modalTitles = {
        'saleModalTitle': 'Add Sale',
        'categoryModalTitle': 'Add Category',
        'productModalTitle': 'Add Product',
        'supplyModalTitle': 'Add Supply',
        'supplierModalTitle': 'Add Supplier',
        'userModalTitle': 'Add Staff'
    };
    
    Object.keys(modalTitles).forEach(titleId => {
        const titleElement = document.getElementById(titleId);
        if (titleElement) {
            titleElement.textContent = modalTitles[titleId];
        }
    });
}

// Quantity Control Functions
function changeQuantity(elementId, delta) {
    const el = document.getElementById(elementId);
    if (!el) return;
  
    // If it's a number‐input, change its .value
    if (el.tagName === 'INPUT' && el.type === 'number') {
      let val = parseInt(el.value, 10) || 1;
      val = Math.max(1, val + delta);
      el.value = val;
    }
    // fallback for any spans you might still have
    else {
      let val = parseInt(el.textContent, 10) || 1;
      val = Math.max(1, val + delta);
      el.textContent = val;
    }
}  

// ======================== not used function ============================================================
function changeQty(type, delta) {
    const element = document.getElementById(type);
    if (element) {
        let current = parseInt(element.textContent);
        current = Math.max(1, current + delta);
        element.textContent = current;
    }
}

// Navigation Functions
function initializeNavigation() {
    const supplyDropdown = document.getElementById('supplyDropdown');
    if (supplyDropdown) {
        supplyDropdown.addEventListener('click', toggleDropdown);
    }
}

// Fix the dropdown toggle function
function toggleDropdown() {
    const dropdown = document.querySelector('.dropdown');
    const dropdownMenu = document.getElementById("supplyDropdownMenu");
    
    if (dropdown && dropdownMenu) {
        dropdown.classList.toggle('open');
        dropdownMenu.classList.toggle('show');
    }
}

function switchSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item, .dropdown-toggle, .dropdown-item').forEach(item => {
        item.classList.remove('active');
    });

    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
        
        if (activeNavItem.classList.contains('dropdown-item')) {
            const dropdownToggle = document.querySelector('.dropdown-toggle');
            if (dropdownToggle) {
                dropdownToggle.classList.add('active');
            }
        }
    }

    currentSection = sectionName;
    
    loadSectionData(sectionName);
}

document.addEventListener('DOMContentLoaded', function() {
    const supplyDropdown = document.getElementById('supplyDropdown');
    if (supplyDropdown) {
        supplyDropdown.addEventListener('click', function(e) {
            e.preventDefault();
            toggleDropdown();
        });
    }

    const dropdownItems = document.querySelectorAll('.dropdown-item');

    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (section) {
                switchSection(section);
            }
        });
    });
    
    loadSales();
    // Initialize all other modules
    console.log('DOM fully loaded ✅');
    setupAutocomplete('saleProductName', 'productSuggestions', 'get_product_names.php');
    initializeNavigation();
    initializeSales();
    initializeProducts();
    initializeSupplies();
    initializeSuppliers();
    initializeUsers();
    setupModalClosing();
    updateDashboardStats();
    switchSection('dashboard');
});


function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'sales':
            loadSales();
            // setupAutocomplete('saleProductName', 'productSuggestions', 'get_product_names.php');
            break;
        case 'products':
            renderCategories();
            showCategoryView();
            break;
        case 'supply-list':
            renderSupplies(); // Read-only supply list
            break;
        case 'added-supply':
            renderAddedSupplies(); // Full CRUD functionality
            break;
        case 'suppliers':
            renderSuppliers();
            break;
        case 'user-management':
            renderUsers();
            break;
        case 'dashboard':
            updateDashboardStats();
            break;
    }
}

function setupAutocomplete(inputId, suggestionBoxId, dataUrl) {
    const input = document.getElementById(inputId);
    const suggestionsBox = document.getElementById(suggestionBoxId);
    let suggestionsData = [];

    // Fetch suggestions (e.g. product names)
    fetch(dataUrl)
        .then(res => res.json())
        .then(data => {
            suggestionsData = data;
        });

    // 🟩 This listens for user typing
    input.addEventListener('input', () => {
        const query = input.value.toUpperCase();
        console.log("Query:", query);
        suggestionsBox.innerHTML = '';

        if (query.length === 0) {
            suggestionsBox.style.display = 'none';
            return;
        }

        const matches = suggestionsData.filter(item =>
            item.toUpperCase().startsWith(query)
        );

        console.log(matches)

        if (matches.length === 0) {
            suggestionsBox.style.display = 'none';
            return;
        }

        matches.forEach(name => {
            const item = document.createElement('div');
            item.textContent = name;
            item.classList.add('autocomplete-item');
            item.addEventListener('click', () => {
                input.value = name;
                suggestionsBox.innerHTML = '';
                suggestionsBox.style.display = 'none';
            });
            suggestionsBox.appendChild(item);
        });

        suggestionsBox.style.display = 'block';
    });

    input.addEventListener('blur', () => {
        // Wait a moment to allow click on suggestion before hiding
        setTimeout(() => {
            suggestionsBox.innerHTML = '';
            suggestionsBox.style.display = 'none';
        }, 200);
    });
}

// Dashboard Functions
function updateDashboardStats() {
    const totalProductsEl = document.getElementById('totalProducts');
    const totalSuppliersEl = document.getElementById('totalSuppliers');
    const totalSalesEl = document.getElementById('totalSales');
    
    if (totalProductsEl) totalProductsEl.textContent = data.products.length;
    if (totalSuppliersEl) totalSuppliersEl.textContent = data.suppliers.length;
    if (totalSalesEl) totalSalesEl.textContent = data.sales.length;
}

// Sales Functions
function initializeSales() {
    const addSaleBtn = document.getElementById('addSaleBtn');
    const saleForm = document.getElementById('saleForm');
}

function loadSales() {
    fetch('get_sales.php')
        .then(response => response.json())
        .then(data => {
            window.salesData = data;
            renderSales(data);
        })
        .catch(error => {
            console.error('Error fetching sales:', error);
        });
}


function renderSales(salesList = window.salesData) {
    const tbody = document.getElementById('salesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    salesList.forEach((sale, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${sale.product_name} (${sale.size_label})</td>
            <td>${sale.quantity_sold}</td>
            <td>${sale.entered_by}</td>
            <td>${sale.usage_date}</td>
            <td class="action-btns">
                <button class="btn btn-success" onclick="editSale(${sale.usage_id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteSale(${sale.usage_id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}


function saveSale(e) {
    e.preventDefault();

    const productName  = document.getElementById('saleProductName').value.trim();
    const productSize  = document.getElementById('saleProductSize').value;
    const quantity     = parseInt(document.getElementById('saleQuantityInput').value, 10);
    const enteredBy    = document.getElementById('saleEnteredBy').value.trim();

    if (!productName || !productSize || !enteredBy || quantity < 1) {
        alert('Please fill in all required fields');
        return;
    }

    // Prepare data to send
    const formData = new FormData();
    formData.append('usage_id', currentEditingId || '');
    formData.append('product_name', productName);
    formData.append('size_label', productSize);
    formData.append('quantity_sold', quantity);
    formData.append('entered_by', enteredBy);

    fetch('save_sale.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            alert('Sale saved successfully!');
            closeModal('saleModal');
            currentEditingId = null;
            loadSales(); // Re-fetch updated list
        } else {
            alert('Failed to save sale: ' + response.message);
        }
    })
    .catch(error => {
        console.error('Error saving sale:', error);
        alert('Error saving sale. See console for details.');
    });
}

  

function editSale(id) {
    console.log("clicked", id);

    const sale = window.salesData.find(s => s.usage_id == id);
    if (!sale) {
        console.warn("Sale not found for ID:", id);
        return;
    }

    document.getElementById('saleProductName').value   = sale.product_name;
    document.getElementById('saleProductSize').value   = sale.size_label;
    document.getElementById('saleEnteredBy').value     = sale.entered_by;
    document.getElementById('saleQuantityInput').value = sale.quantity_sold;
    document.getElementById('saleModalTitle').textContent = 'Edit Sale';

    currentEditingId = id;
    openModal('saleModal');
}

function deleteSale(id) {
    if (!confirm('Are you sure you want to delete this sale?')) return;

    fetch('delete_sale.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usage_id: id })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Sale deleted successfully');
            loadSales();
            updateDashboardStats();
        } else {
            alert('Failed to delete sale: ' + result.message);
        }
    })
    .catch(error => {
        console.error('Delete error:', error);
        alert('An error occurred while deleting the sale.');
    });
}

function filterSales() {
    const input = document.getElementById('salesSearch');
    const searchTerm = input.value.toLowerCase().trim();

    const filtered = window.salesData.filter(sale => {
        const text = `${sale.product_name} ${sale.size_label} ${sale.entered_by} ${sale.usage_date}`.toLowerCase();
        return text.includes(searchTerm);
    });

    renderSales(filtered);
}

function resetForm() {
    const productName = document.getElementById("productName");
    const addOn = document.getElementById("addOn");
    const quantity = document.getElementById("quantity");
    const addOnQty = document.getElementById("addOnQty");
    
    if (productName) productName.value = "Ice Americano";
    if (addOn) addOn.value = "Vanilla Syrup";
    if (quantity) quantity.textContent = "1";
    if (addOnQty) addOnQty.textContent = "1";
}

function deleteRow(button) {
    if (confirm("Are you sure you want to delete this sale?")) {
        const row = button.closest("tr");
        row.remove();
    }
}

// =================== Products Functions =================== //
function initializeProducts() {
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const addProductBtn = document.getElementById('addProductBtn');
    const categoryForm = document.getElementById('categoryForm');
    const productForm = document.getElementById('productForm');
    const backToCategoriesBtn = document.getElementById('backToCategoriesBtn');
    
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => openModal('categoryModal'));
    }
    
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            const hiddenInput = document.getElementById('hiddenCategoryId');
            if (hiddenInput) hiddenInput.value = currentCategoryName;
            openModal('productModal');
        });
    }    
    
    if (categoryForm) {
        categoryForm.addEventListener('submit', saveCategory);
    }
    
    if (productForm) {
        productForm.addEventListener('submit', saveProduct);
    }
    
    if (backToCategoriesBtn) {
        backToCategoriesBtn.addEventListener('click', showCategoryView);
    }
    
    // Initialize category dropdown
    updateProductCategoryDropdown();
}

function renderCategories() {
    const tbody = document.getElementById('categoryTableBody');
    if (!tbody) return;
   
    tbody.innerHTML = '';
   
    data.categories.forEach((category, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${category}</td>
            <td class="action-btns">
                <button class="btn btn-success" onclick="showProducts('${category}')">
                    View Products
                </button>
                <button class="btn btn-danger" onclick="deleteCategory(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
   
    // Update product category dropdown
    updateProductCategoryDropdown();
}

// Add this new function after renderCategories
function updateProductCategoryDropdown() {
    const categorySelect = document.getElementById('productCategory');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        data.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
}

function renderProducts(categoryFilter = null) {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    let productsToShow = categoryFilter
        ? data.products.filter(product => product.category === categoryFilter)
        : data.products;
    
    productsToShow.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>${product.size || 'N/A'}</td>
            <td>
                <button class="action-btn view-btn" onclick="showIngredients(${product.id})">
                    View Ingredients
                </button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Ingredients Modal Functions
function showIngredients(productId) {
    const product = data.products.find(p => p.id === productId);
    if (!product) return;
    
    // Set modal title
    const modalTitle = document.getElementById('ingredientsModalTitle');
    if (modalTitle) {
        modalTitle.textContent = `${product.name} - Ingredients`;
    }
    
    // Populate ingredients content
    const ingredientsContent = document.getElementById('ingredientsContent');
    if (ingredientsContent && product.ingredients) {
        ingredientsContent.innerHTML = product.ingredients.map(ingredient => `
            <div class="ingredient-item">
                <span class="ingredient-name">${ingredient.name}</span>
                <span class="ingredient-amount">${ingredient.amount}</span>
            </div>
        `).join('');
    } else {
        ingredientsContent.innerHTML = '<p>No ingredients data available.</p>';
    }
    
    // Show modal
    openModal('ingredientsModal');
}

function saveCategory(e) {
    e.preventDefault();
    
    const categoryName = document.getElementById('categoryName')?.value;
    
    if (!categoryName) {
        alert('Please enter a category name');
        return;
    }
    
    if (currentEditingId) {
        // Edit existing category
        const index = data.categories.findIndex((cat, idx) => idx === currentEditingId);
        if (index !== -1) {
            data.categories[index] = categoryName;
        }
    } else {
        // Add new category
        data.categories.push(categoryName);
    }
    
    saveToLocalStorage('categoriesData', data.categories);
    renderCategories();
    closeModal('categoryModal');
}

function saveProduct(e) {
    e.preventDefault();
    
    const productName = document.getElementById('productName')?.value;
    const productSize = document.getElementById('productSize')?.value;
    const category = document.getElementById('hiddenCategoryId')?.value;
    const categoryId = document.getElementById('hiddenCategoryId')?.value;

    if (!productName || !productSize || !categoryId) {
    alert('Please fill in all required fields');
    return;
    }

    const productData = {
        id: currentEditingId || generateId(),
        name: productName,
        size: productSize,
        category: categoryId,
        stock: 0,
        ingredients: []
    };

    const newProduct = {
        name: productName,
        size: productSize,
        categoryId: categoryId // pulled from hidden input
    };
    
    addProductToTable(newProduct);    
    
    if (currentEditingId) {
        const index = data.products.findIndex(product => product.id === currentEditingId);
        if (index !== -1) {
            data.products[index] = productData;
        }
    } else {
        data.products.push(productData);
    }
    
    saveToLocalStorage('productsData', data.products);
    renderProducts();
    closeModal('productModal');
    updateDashboardStats();
    
    // Clear form
    document.getElementById('productForm').reset();
    console.log("Adding Product:", productData);

}


function editProduct(id) {
    const product = data.products.find(p => p.id === id);
    if (product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        currentEditingId = id;
        openModal('productModal');
    }
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        data.products = data.products.filter(product => product.id !== id);
        saveToLocalStorage('productsData', data.products);
        renderProducts();
        updateDashboardStats();
    }
}

function showProducts(category) {
    showProductView();
    renderProducts(category);
    currentCategoryName = category;
}

function showCategoryView() {
    const categoryView = document.getElementById('categoryView');
    const productView = document.getElementById('productView');
    
    if (categoryView) categoryView.style.display = 'block';
    if (productView) productView.style.display = 'none';
}

function showProductView() {
    const categoryView = document.getElementById('categoryView');
    const productView = document.getElementById('productView');
    
    if (categoryView) categoryView.style.display = 'none';
    if (productView) productView.style.display = 'block';
}

function showProductList() {
    showProductView();
    renderProducts();
}

function showCategoryList() {
    showCategoryView();
    renderCategories();
}

function deleteCategory(index) {
    if (confirm('Are you sure you want to delete this category?')) {
        data.categories.splice(index, 1);
        saveToLocalStorage('categoriesData', data.categories);
        renderCategories();
    }
}

// Supply Functions - Updated for read-only Supply List
function initializeSupplies() {
    const addSupplyBtn = document.getElementById('addSupplyBtn');
    const supplyForm = document.getElementById('supplyForm');
    
    if (addSupplyBtn) {
        addSupplyBtn.addEventListener('click', () => openModal('supplyModal'));
    }
    
    if (supplyForm) {
        supplyForm.addEventListener('submit', saveSupply);
    }
}

// Render Supply List (READ-ONLY - No edit/delete actions)
function renderAddedSupplies() {
    const tbody = document.getElementById('addedSupplyTableBody');
    tbody.innerHTML = '';
    data.addedSupplies.forEach((supply, i) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${i+1}</td>
        <td>${supply.name}</td>
        <td>${supply.quantity}</td>
        <td>${supply.unit}</td>
        <td>${supply.receivedBy}</td>   <!-- ← new -->
        <td>${supply.dateAdded}</td>
            <td class="action-btns">
                <button class="btn btn-success" onclick="editAddedSupply(${supply.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteAddedSupply(${supply.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
      `;
      tbody.appendChild(row);
    });
  }  

function saveSupply(e) {
    e.preventDefault();
    const name       = document.getElementById('supplyName').value;
    const quantity   = parseInt(document.getElementById('supplyQuantity').value);
    const unit       = document.getElementById('supplyUnit').value;
    const receivedBy = document.getElementById('supplyReceivedBy').value; // ← new
  
    if (!name || !unit || !receivedBy) {
      alert('Please fill in all required fields');
      return;
    }
  
    const supplyData = {
      id: currentEditingId || generateId(),
      name,
      quantity,
      unit,
      receivedBy,                                    // ← new
      dateAdded: currentEditingId
        ? data.addedSupplies.find(s=>s.id===currentEditingId).dateAdded
        : formatDate()
    };
    
    if (currentEditingId) {
        // Update existing added supply
        const index = data.addedSupplies.findIndex(supply => supply.id === currentEditingId);
        if (index !== -1) {
            data.addedSupplies[index] = supplyData;
        }
    } else {
        // Add new supply to Added Supply
        data.addedSupplies.push(supplyData);
    }
    
    saveToLocalStorage('addedSuppliesData', data.addedSupplies);
    renderAddedSupplies();
    closeModal('supplyModal');
    
    // Clear form and reset editing mode
    document.getElementById('supplyForm').reset();
    currentEditingId = null;
    document.getElementById('supplyModalTitle').textContent = 'Add Supply';
}

function editAddedSupply(id) {
    const supply = data.addedSupplies.find(s => s.id === id);
    if (supply) {
        document.getElementById('supplyName').value = supply.name || '';
        document.getElementById('supplyQuantity').value = supply.quantity || 0;
        document.getElementById('supplyUnit').value = supply.unit || '';
        
        // Update modal title
        const title = document.getElementById('supplyModalTitle');
        if (title) title.textContent = 'Edit Added Supply';
        
        currentEditingId = id;
        openModal('supplyModal');
    }
}


function deleteAddedSupply(id) {
    if (confirm('Are you sure you want to delete this added supply?')) {
        data.addedSupplies = data.addedSupplies.filter(supply => supply.id !== id);
        saveToLocalStorage('addedSuppliesData', data.addedSupplies);
        renderAddedSupplies();
    }
}

// Alternative Supply Functions (from supply list reference)
function showAddModal() {
    openModal('addModal');
}

function hideAddModal() {
    closeModal('addModal');
}

function addSupply() {
    const name = document.getElementById("supplyName")?.value;
    const qty = document.getElementById("quantity")?.value;
    const unit = document.getElementById("unit")?.value;
    
    if (!name || !qty || !unit) {
        alert("All fields required");
        return;
    }
    
    data.supplies.push({ 
        id: generateId(),
        name, 
        quantity: parseInt(qty), 
        unit 
    });
    
    saveToLocalStorage('suppliesData', data.supplies);
    renderSupplies();
    hideAddModal();
}

// Supplier Functions
function initializeSuppliers() {
    const addSupplierBtn = document.getElementById('addSupplierBtn');
    const supplierForm = document.getElementById('supplierForm');
    
    if (addSupplierBtn) {
        addSupplierBtn.addEventListener('click', () => openModal('supplierModal'));
    }
    
    if (supplierForm) {
        supplierForm.addEventListener('submit', saveSupplier);
    }
}

function renderSuppliers() {
    const tbody = document.getElementById('supplierTableBody');
    if (!tbody) return;
   
    tbody.innerHTML = '';
   
    data.suppliers.forEach((supplier, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${supplier.name}</td>
            <td>${supplier.contact}</td>
            <td>${supplier.number}</td>
            <td class="action-btns">
                <button class="btn btn-success" onclick="editSupplier(${supplier.id})">
                <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteSupplier(${supplier.id})">
                <i class="fas fa-trash"></i>
                </button>
            </td>
            `;

        tbody.appendChild(row);
    });
}

function saveSupplier(e) {
    e.preventDefault();

    const name = document.getElementById('supplierName')?.value;
    const number = document.getElementById('supplierNumber')?.value;
    const contact = document.getElementById('supplierContact')?.value;
    
    if (!name || !number || !contact) {
        alert('Please fill in all fields');
        return;
    }
    
    const supplierData = {
        id: currentEditingId || generateId(),
        name,
        number,
        contact
    };
    
    if (currentEditingId) {
        const index = data.suppliers.findIndex(supplier => supplier.id === currentEditingId);
        if (index !== -1) {
            data.suppliers[index] = supplierData;
        }
    } else {
        data.suppliers.push(supplierData);
    }
    
    saveToLocalStorage('suppliersData', data.suppliers);
    renderSuppliers();
    closeModal('supplierModal');
    updateDashboardStats();
}

function editSupplier(id) {
    const supplier = data.suppliers.find(s => s.id === id);
    if (supplier) {
        document.getElementById('supplierSupplyName').value = supplier.name || '';  // Supply Name
        document.getElementById('supplierName').value = supplier.contact || '';     // Supplier Name
        document.getElementById('supplierNumber').value = supplier.number || '';    // Contact Number

        document.getElementById('supplierModalTitle').textContent = 'Edit Supplier';
        currentEditingId = id;
        openModal('supplierModal');
    }
}

function deleteSupplier(id) {
    if (confirm('Are you sure you want to delete this supplier?')) {
        data.suppliers = data.suppliers.filter(supplier => supplier.id !== id);
        saveToLocalStorage('suppliersData', data.suppliers);
        renderSuppliers();
        updateDashboardStats();
    }
}

// User Management Functions
function initializeUsers() {
    const addUserBtn = document.getElementById('addUserBtn');
    const userForm = document.getElementById('userForm');
    
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => openModal('userModal'));
    }
    
    if (userForm) {
        userForm.addEventListener('submit', saveUser);
    }
}

function renderUsers() {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;
   
    tbody.innerHTML = '';
   
    data.users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.username || ''}</td>
            <td>${user.email || ''}</td>
            <td>${user.role}</td>
            <td class="action-btns">
                <button class="btn btn-success" onclick="editUser(${user.id})">
                <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteUser(${user.id})">
                <i class="fas fa-trash"></i>
                </button>
            </td>
            `;

        tbody.appendChild(row);
    });
}

function saveUser(e) {
    e.preventDefault();
    
    const username = document.getElementById('userUsername')?.value;
    const email = document.getElementById('userEmail')?.value;
    const password = document.getElementById('userPassword')?.value;
    const role = document.getElementById('userRole')?.value;
    
    if (!username || !email || !password || !role) {
        alert('Please fill in all fields');
        return;
    }
    
    const userData = {
        id: currentEditingId || generateId(),
        username,
        email,
        password, // In a real app, this should be hashed
        role
    };
    
    if (currentEditingId) {
        const index = data.users.findIndex(user => user.id === currentEditingId);
        if (index !== -1) {
            data.users[index] = userData;
        }
    } else {
        data.users.push(userData);
    }
    
    saveToLocalStorage('usersData', data.users);
    renderUsers();
    alert('User successfully saved!');
    closeModal('userModal');
}

function editUser(id) {
    const user = data.users.find(u => u.id === id);
    if (user) {
        document.getElementById('userUsername').value = user.username || '';
        document.getElementById('userEmail').value = user.email || '';
        document.getElementById('userPassword').value = ''; // Don’t populate password
        document.getElementById('userRole').value = user.role;

        currentEditingId = id;
        openModal('userModal');
    }
}

function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        data.users = data.users.filter(user => user.id !== id);
        saveToLocalStorage('usersData', data.users);
        renderUsers();
    }
}

// Close modal when clicking outside
function setupModalClosing() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
                currentEditingId = null;
                resetModalTitles();
            }
        });
    });
}

function addProductToTable(product) {
    const tableBody = document.getElementById('productTableBody');

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${tableBody.children.length + 1}</td>
        <td>${product.name}</td>
        <td>${product.size}</td>
        <td>
            <button class="btn btn-secondary btn-sm">Edit</button>
            <button class="btn btn-danger btn-sm">Delete</button>
        </td>
    `;
    
    tableBody.appendChild(newRow);
}

function confirmLogout(event) {
    event.preventDefault();
    openModal('logoutConfirmModal');
  }
  
  function performLogout() {
    closeModal('logoutConfirmModal');
    // You can redirect to your login page or clear localStorage here
    window.location.href = "logout.php"; // Adjust as needed
  }

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initializeNavigation();
    
    // Initialize all modules
    initializeSales();
    initializeProducts();
    initializeSupplies();
    initializeSuppliers();
    initializeUsers();
    
    // Setup modal closing
    setupModalClosing();
    
    // Load initial data
    updateDashboardStats();
    
    // Default section is dashboard, make sure it's active
    switchSection('dashboard');
});