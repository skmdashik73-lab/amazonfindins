const tokenKey = "amazonfindinsAdminToken";
let products = [];

const loginPanel = document.getElementById("loginPanel");
const dashboardPanel = document.getElementById("dashboardPanel");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const productForm = document.getElementById("productForm");
const productMessage = document.getElementById("productMessage");
const productsTable = document.getElementById("productsTable");
const productCount = document.getElementById("productCount");
const cancelEditButton = document.getElementById("cancelEditButton");
const formTitle = document.getElementById("formTitle");
const settingsForm = document.getElementById("settingsForm");
const settingsMessage = document.getElementById("settingsMessage");
const adminSearch = document.getElementById("adminSearch");
const adminMinPrice = document.getElementById("adminMinPrice");
const adminMaxPrice = document.getElementById("adminMaxPrice");


document.addEventListener("DOMContentLoaded", async () => {
    const settings = await loadSiteSettings();
    applyBranding(settings, document.getElementById("adminSiteName"), document.getElementById("adminLogo"));
    document.getElementById("websiteName").value = settings.websiteName || "amazonfindins";
    document.getElementById("logoUrl").value = settings.logoUrl || "";

    if (getToken()) {
        showDashboard();
        await loadProducts();
    }
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const data = await apiFetch("/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: document.getElementById("username").value,
                password: document.getElementById("password").value
            })
        });
        localStorage.setItem(tokenKey, data.token);
        setMessage(loginMessage, data.message, "success");
        showDashboard();
        await loadProducts();
    } catch (error) {
        setMessage(loginMessage, error.message, "error");
    }
});

document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem(tokenKey);
    dashboardPanel.classList.add("hidden");
    loginPanel.classList.remove("hidden");
});

settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const logoFile = document.getElementById("logoFile").files[0];
        if (logoFile) {
            document.getElementById("logoUrl").value = await uploadImage(logoFile);
        }

        const settings = await apiFetch("/settings", {
            method: "PUT",
            headers: adminHeaders(),
            body: JSON.stringify({
                websiteName: document.getElementById("websiteName").value,
                logoUrl: document.getElementById("logoUrl").value
            })
        });
        applyBranding(settings, document.getElementById("adminSiteName"), document.getElementById("adminLogo"));
        setMessage(settingsMessage, "Website settings saved.", "success");
    } catch (error) {
        handleAdminError(error);
        setMessage(settingsMessage, error.message, "error");
    }
});

productForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const imageFile = document.getElementById("imageFile").files[0];
        if (imageFile) {
            document.getElementById("imageUrl").value = await uploadImage(imageFile);
        }

        const productId = document.getElementById("productId").value;
        const method = productId ? "PUT" : "POST";
        const url = productId ? `/admin/products/${productId}` : "/admin/products";

        await apiFetch(url, {
            method,
            headers: adminHeaders(),
            body: JSON.stringify(readProductForm())
        });

        resetProductForm();
        await loadProducts();
        setMessage(productMessage, "Product saved successfully.", "success");
    } catch (error) {
        handleAdminError(error);
        setMessage(productMessage, error.message, "error");
    }
});

cancelEditButton.addEventListener("click", resetProductForm);

[adminSearch, adminMinPrice, adminMaxPrice].forEach((input) => {
    input.addEventListener("input", debounce(loadProducts));
});

document.getElementById("adminClearFilters").addEventListener("click", () => {
    adminSearch.value = "";
    adminMinPrice.value = "";
    adminMaxPrice.value = "";
    loadProducts();
});

function showDashboard() {
    loginPanel.classList.add("hidden");
    dashboardPanel.classList.remove("hidden");
}

function getToken() {
    return localStorage.getItem(tokenKey);
}

function adminHeaders() {
    return {
        "Content-Type": "application/json",
        "X-Admin-Token": getToken()
    };
}

async function uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);
    const data = await apiFetch("/admin/upload", {
        method: "POST",
        headers: { "X-Admin-Token": getToken() },
        body: formData
    });
    return data.imageUrl;
}

async function loadProducts() {
    const params = new URLSearchParams();
    if (adminSearch.value.trim()) {
        params.set("search", adminSearch.value.trim());
    }
    if (adminMinPrice.value) {
        params.set("minPrice", adminMinPrice.value);
    }
    if (adminMaxPrice.value) {
        params.set("maxPrice", adminMaxPrice.value);
    }

    try {
        products = await apiFetch(`/products?${params.toString()}`);
        renderProductsTable();
    } catch (error) {
        setMessage(productMessage, error.message, "error");
    }
}

function renderProductsTable() {
    productCount.textContent = `${products.length} product${products.length === 1 ? "" : "s"}`;

    if (!products.length) {
        productsTable.innerHTML = `<tr><td colspan="5">No products found.</td></tr>`;
        return;
    }

    productsTable.innerHTML = products.map((product) => `
        <tr>
            <td><img class="table-image" src="${imageSrc(product.imageUrl)}" alt="${escapeHtml(product.name)}"></td>
            <td>${escapeHtml(product.name)}</td>
            <td>${escapeHtml(product.category)}</td>
            <td>${money(product.price)}</td>
            <td>
                <div class="action-buttons">
                    <button type="button" onclick="editProduct(${product.id})">Edit</button>
                    <button class="danger" type="button" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function editProduct(id) {
    const product = products.find((item) => item.id === id);
    if (!product) {
        return;
    }

    document.getElementById("productId").value = product.id;
    document.getElementById("name").value = product.name;
    document.getElementById("category").value = product.category;
    document.getElementById("price").value = product.price;
    document.getElementById("imageUrl").value = product.imageUrl;
    document.getElementById("affiliateLink").value = product.affiliateLink;
    document.getElementById("description").value = product.description;
    formTitle.textContent = "Edit Product";
    cancelEditButton.classList.remove("hidden");
    window.scrollTo({ top: productForm.offsetTop - 100, behavior: "smooth" });
}

async function deleteProduct(id) {
    const confirmed = confirm("Delete this product?");
    if (!confirmed) {
        return;
    }

    try {
        await apiFetch(`/admin/products/${id}`, {
            method: "DELETE",
            headers: { "X-Admin-Token": getToken() }
        });
        await loadProducts();
        setMessage(productMessage, "Product deleted.", "success");
    } catch (error) {
        handleAdminError(error);
        setMessage(productMessage, error.message, "error");
    }
}

function handleAdminError(error) {
    if (error.message === "Admin login is required.") {
        localStorage.removeItem(tokenKey);
        dashboardPanel.classList.add("hidden");
        loginPanel.classList.remove("hidden");
        setMessage(loginMessage, "Please log in again.", "error");
    }
}

function readProductForm() {
    return {
        name: document.getElementById("name").value,
        category: document.getElementById("category").value,
        price: document.getElementById("price").value,
        imageUrl: document.getElementById("imageUrl").value,
        description: document.getElementById("description").value,
        affiliateLink: document.getElementById("affiliateLink").value
    };
}

function resetProductForm() {
    productForm.reset();
    document.getElementById("productId").value = "";
    formTitle.textContent = "Add Product";
    cancelEditButton.classList.add("hidden");
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
