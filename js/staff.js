// Global Variables
let currentEditingId = null;
let currentSection = 'dashboard';

// Data Storage with localStorage integration
let data = {
    sales: JSON.parse(localStorage.getItem('salesData')) || [],
    categories: JSON.parse(localStorage.getItem('categoriesData')) || ['Espresso', 'Brewed', 'Hot Coffee', 'Iced Coffee', 'Frappe'],
    products: JSON.parse(localStorage.getItem('productsData')) || [
        {
            id: 1,
            name: "Espresso Macchiato",
            size: "SHOT",
            category: "Espresso",
            stock: 20,
            ingredients: [
                { name: "Coffee Beans", amount: "1 Gram" },
                { name: "Full Cream Milk", amount: "15 ML" }
            ]
        },
        {
            id: 2,
            name: "Espresso",
            size: "SHOT",
            category: "Espresso", 
            stock: 15,
            ingredients: [
                { name: "Coffee Beans", amount: "1 Gram" },
                { name: "Full Cream Milk", amount: "15 ML" }
            ]
        },
        {
            id: 3,
            name: "Iced Americano",
            size: "12oz",
            category: "Iced Coffee",
            stock: 10,
            ingredients: [
                { name: "Coffee Beans", amount: "2 Grams" },
                { name: "Ice Cubes", amount: "100 ML" },
                { name: "Water", amount: "200 ML" }
            ]
        }
    ],
    
    supplies: JSON.parse(localStorage.getItem('suppliesData')) || [
        { id: 1, name: "Robusta Coffee Beans", quantity: 1, unit: "PG" },
        { id: 2, name: "Caramel Sauce", quantity: 1, unit: "BTL" },
        { id: 3, name: "Chocolate Sauce", quantity: 1, unit: "BTL" },
        { id: 4, name: "Hazel Nut Syrup", quantity: 1, unit: "BTL" },
        { id: 5, name: "Fresh Milk", quantity: 1, unit: "CTN" }
    ],
    addedSupplies: JSON.parse(localStorage.getItem('addedSuppliesData')) || [],
    suppliers: JSON.parse(localStorage.getItem('suppliersData')) || [
        { id: 1, name: 'Coffee Beans', number: '09xxxxxxxxx', contact: 'Jeff Valdez' },
        { id: 2, name: 'Caramel Sauce', number: '09xxxxxxxxx', contact: 'Jaydee Guzman' },
        { id: 3, name: 'Chocolate Sauce', number: '09xxxxxxxxx', contact: 'Jaydee Guzman' },
        { id: 4, name: 'Hazel Nut Syrup', number: '09xxxxxxxxx', contact: 'Jaydee Guzman' },
        { id: 5, name: 'Fresh Milk', number: '09xxxxxxxxx', contact: 'Stella Yuro' }
    ],
};

data.sales = data.sales.map(sale => ({
    id: sale.id,
    productName: sale.productName,
    quantity: sale.quantity,
    date: sale.date
}));

// Utility Functions
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function generateId() {
    return Date.now() + Math.random();
}

function formatDate() {
    return new Date().toLocaleString("en-US", {
        month: "short", day: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
    });
}

// Modal Functions
function openModal(modalId) {
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
    // Reset modal titles
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
    // Handle dropdown toggle
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

// Update the switchSection function to handle dropdown items
function switchSection(sectionName) {
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item, .dropdown-toggle, .dropdown-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Add active class to appropriate nav item
    const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
        
        // If it's a dropdown item, also highlight the main dropdown
        if (activeNavItem.classList.contains('dropdown-item')) {
            const dropdownToggle = document.querySelector('.dropdown-toggle');
            if (dropdownToggle) {
                dropdownToggle.classList.add('active');
            }
        }
    }

    currentSection = sectionName;
    
    // Load section-specific data
    loadSectionData(sectionName);
}

// Initialize dropdown functionality properly
document.addEventListener('DOMContentLoaded', function() {
    // Setup dropdown toggle
    const supplyDropdown = document.getElementById('supplyDropdown');
    if (supplyDropdown) {
        supplyDropdown.addEventListener('click', function(e) {
            e.preventDefault();
            toggleDropdown();
        });
    }
    
    // Setup dropdown menu items
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
        e.preventDefault();
        const section = this.getAttribute('data-section');
        if (section) {
            switchSection(section);
        }
        });
    });

    // Initialize all other modules
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
            renderSales();
            break;
        case 'products':
            renderCategories();
            showCategoryView();
            break;
        case 'supply-list':
            renderSupplies();
            break;
        case 'added-supply':
            renderAddedSupplies();
            break;
        case 'suppliers':
            renderSuppliers();
            break;
        case 'dashboard':
            updateDashboardStats();
            break;
    }
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

function renderSales() {
    const tbody = document.getElementById('salesTableBody');
    if (!tbody) return;
   
    tbody.innerHTML = '';
   
    data.sales.forEach((sale, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${sale.productName}</td>
            <td>${sale.quantity}</td>
            <td>${sale.enteredBy}</td>
            <td>${sale.date}</td>
            <td class="action-btns">
                <button class="btn btn-success" onclick="editSale(${sale.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteSale(${sale.id})">
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
    const quantity     = parseInt(document.getElementById('saleQuantityInput').value, 10);
    const enteredBy    = document.getElementById('saleEnteredBy').value.trim();          // ← new
    const date         = formatDate();
  
    if (!productName || !enteredBy || quantity < 1) {
      alert('Please fill in all required fields');
      return;
    }
  
    const saleData = {
      id: currentEditingId || generateId(),
      productName,
      quantity,
      enteredBy,     // ← new
      date
    };
  
    if (currentEditingId) {
      const idx = data.sales.findIndex(s => s.id === currentEditingId);
      if (idx > -1) data.sales[idx] = saleData;
    } else {
      data.sales.push(saleData);
    }
  
    saveToLocalStorage('salesData', data.sales);
    renderSales();
    closeModal('saleModal');
    updateDashboardStats();
  }
  

  function editSale(id) {
    const sale = data.sales.find(s => s.id === id);
    if (!sale) return;
    document.getElementById('saleProductName').value   = sale.productName;
    document.getElementById('saleEnteredBy').value     = sale.enteredBy;
    document.getElementById('saleQuantityInput').value = sale.quantity;   // ← set .value
    document.getElementById('saleModalTitle').textContent = 'Edit Sale';
    currentEditingId = id;
    openModal('saleModal');
  }
  

function deleteSale(id) {
    if (confirm('Are you sure you want to delete this sale?')) {
        data.sales = data.sales.filter(sale => sale.id !== id);
        saveToLocalStorage('salesData', data.sales);
        renderSales();
        updateDashboardStats();
    }
}

// Alternative Sales Functions (from sales.js reference)
function addSale() {
    const name = document.getElementById("productName")?.value;
    const qty = document.getElementById("quantity")?.textContent;
    const addOn = document.getElementById("addOn")?.value;
    const addOnQty = document.getElementById("addOnQty")?.textContent;
    const date = new Date().toLocaleString("en-US", {
        month: "short", day: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
    });

    if (!name) {
        alert('Please enter a product name');
        return;
    }

    const table = document.getElementById("salesTableBody");
    if (table) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${data.sales.length + 1}</td>
            <td><strong>${name}</strong></td>
            <td>${qty}</td>
            <td>${date}</td>
            <td class="actions">
                <button class="edit-btn" onclick="editSale(this)">✏️</button>
            </td>
        `;
        table.appendChild(row);
        
        // Add to data array
        data.sales.push({
            id: generateId(),
            productName: name,
            quantity: parseInt(qty),
            addOn: addOn,
            addOnQty: parseInt(addOnQty),
            date: date
        });
        
        saveToLocalStorage('salesData', data.sales);
        closeModal('modal');
    }
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

// Products Functions
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
        addProductBtn.addEventListener('click', () => openModal('productModal'));
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
    const category = document.getElementById('productCategory')?.value;
    
    if (!productName || !productSize || !category) {
        alert('Please fill in all required fields');
        return;
    }
    
    const productData = {
        id: currentEditingId || generateId(),
        name: productName,
        size: productSize,
        category: category,
        stock: 0, // Default stock
        ingredients: [] // Initialize empty ingredients array
    };
    
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
function renderSupplies() {
    const tbody = document.getElementById('supplyTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    data.supplies.forEach((s, i) => {
      tbody.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${i+1}</td>
          <td>${s.name}</td>
          <td>${s.quantity}</td>
          <td>${s.unit}</td>
        </tr>`);
    });
  }
  
function saveSupply(e) {
    e.preventDefault();
  
    // grab the form values
    const nameEl     = document.getElementById('supplyName');
    const qtyEl      = document.getElementById('supplyQuantity');
    const unitEl     = document.getElementById('supplyUnit');
    const name       = nameEl.value.trim();
    const quantity   = parseInt(qtyEl.value, 10) || 0;
    const unit       = unitEl.value.trim();
  
    if (!name || !unit) {
      alert('Please fill in all required fields');
      return;
    }
  
    // build the supply record
    const supplyRecord = {
      id: currentEditingId || generateId(),
      name,
      quantity,
      unit
    };
  
    if (currentEditingId) {
      // editing existing supply
      const idx = data.supplies.findIndex(s => s.id === currentEditingId);
      if (idx > -1) data.supplies[idx] = supplyRecord;
    } else {
      // adding new supply
      data.supplies.push(supplyRecord);
    }
  
    // persist & re-render
    saveToLocalStorage('suppliesData', data.supplies);
    renderSupplies();
  
    // clean up
    closeModal('supplyModal');
    nameEl.value = '';
    qtyEl.value  = '';
    unitEl.value = '';
    currentEditingId = null;
    document.getElementById('supplyModalTitle').textContent = 'Add Supply';
  }
  

  function renderAddedSupplies() {
    const tbody = document.getElementById('addedSupplyTableBody');
    tbody.innerHTML = '';
  
    data.addedSupplies.forEach((s, i) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${i+1}</td>
        <td>${s.name}</td>
        <td>${s.quantity}</td>
        <td>${s.unit}</td>
        <td>${s.receivedBy}</td>
        <td>${s.dateAdded}</td>
        <td class="action-btns">
          <button class="btn btn-success" onclick="editAddedSupply(${s.id})">
            <i class="fas fa-edit"></i>
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }
  
  

function editAddedSupply(id) {
    const supply = data.addedSupplies.find(s => s.id === id);
    if (supply) {
        document.getElementById('supplyName').value = supply.name;
        document.getElementById('supplyQuantity').value = supply.quantity;
        document.getElementById('supplyUnit').value = supply.unit;
        document.getElementById('supplyModalTitle').textContent = 'Edit Added Supply';
        currentEditingId = id;
        openModal('supplyModal');
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
            <td>${supplier.number}</td>
            <td>${supplier.contact}</td>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initializeNavigation();
    
    // Initialize all modules
    initializeSales();
    initializeProducts();
    initializeSupplies();
    
    // Setup modal closing
    setupModalClosing();
    
    // Load initial data
    updateDashboardStats();
    
    // Default section is dashboard, make sure it's active
    switchSection('dashboard');
});

function confirmLogout(event) {
    event.preventDefault();
    openModal('logoutConfirmModal');
  }
  
  function performLogout() {
    closeModal('logoutConfirmModal');
    window.location.href = "login.html"; // Adjust if you use a different page
  }
  