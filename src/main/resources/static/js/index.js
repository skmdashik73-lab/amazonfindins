const productsGrid = document.getElementById("productsGrid");
const statusMessage = document.getElementById("statusMessage");
const productCount = document.getElementById("userProductCount");
const searchInput = document.getElementById("search");
const minPriceInput = document.getElementById("minPrice");
const maxPriceInput = document.getElementById("maxPrice");
const clearFiltersButton = document.getElementById("clearFilters");
const productDetail = document.getElementById("productDetail");
const selectedProductKey = "amazonfindinsSelectedProductId";
let currentProducts = [];
let allProducts = [];



document.addEventListener("DOMContentLoaded", async () => {
    const settings = await loadSiteSettings();
    applyBranding(
        settings,
        document.getElementById("siteName"),
        document.getElementById("siteLogo"),
        document.getElementById("heroTitle")
    );
    await loadProducts();
});

const loadProductsDebounced = debounce(loadProducts);

[searchInput, minPriceInput, maxPriceInput].forEach((input) => {
    input.addEventListener("input", loadProductsDebounced);
});

clearFiltersButton.addEventListener("click", () => {
    searchInput.value = "";
    minPriceInput.value = "";
    maxPriceInput.value = "";
    loadProducts();
});

async function loadProducts() {
    const params = new URLSearchParams();
    if (searchInput.value.trim()) {
        params.set("search", searchInput.value.trim());
    }
    if (minPriceInput.value) {
        params.set("minPrice", minPriceInput.value);
    }
    if (maxPriceInput.value) {
        params.set("maxPrice", maxPriceInput.value);
    }

    try {
        setMessage(statusMessage, "Loading products...");
        const [filteredProducts, catalogProducts] = await Promise.all([
            apiFetch(`/products?${params.toString()}`),
            apiFetch("/products")
        ]);
        currentProducts = filteredProducts;
        allProducts = catalogProducts;
        renderProducts(currentProducts);
        restoreSelectedProduct();
        setMessage(statusMessage, currentProducts.length ? "" : "No products found.");
    } catch (error) {
        currentProducts = [];
        productDetail.classList.add("hidden");
        productsGrid.innerHTML = "";
        productCount.textContent = "0 products";
        setMessage(statusMessage, error.message, "error");
    }
}

function renderProducts(products) {
    productCount.textContent = `${products.length} product${products.length === 1 ? "" : "s"}`;

    productsGrid.innerHTML = products.map((product) => `
        <article class="product-card clickable-card" onclick="showProductDetail(${product.id})">
            <img src="${imageSrc(product.imageUrl)}" alt="${escapeHtml(product.name)}">
            <div class="product-card-content">
                <span class="category">${escapeHtml(product.category)}</span>
                <h3>${escapeHtml(product.name)}</h3>
                <p class="description">${escapeHtml(product.description)}</p>
                <span class="price">${money(product.price)}</span>
                <a class="buy-button" href="${escapeAttribute(product.affiliateLink)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">Buy Now</a>
            </div>
        </article>
    `).join("");
}

function showProductDetail(productId) {
    const product = currentProducts.find((item) => item.id === productId);
    if (!product) {
        return;
    }

    sessionStorage.setItem(selectedProductKey, product.id);

    const suggestions = allProducts
        .filter((item) => item.id !== product.id && sameCategory(item.category, product.category))
        .slice(0, 4);

    productDetail.innerHTML = `
        <div class="detail-card">
            <button class="detail-close" type="button" onclick="closeProductDetail()">Close</button>
            <img class="detail-image" src="${imageSrc(product.imageUrl)}" alt="${escapeHtml(product.name)}">
            <div class="detail-content">
                <span class="category">${escapeHtml(product.category)}</span>
                <h2>${escapeHtml(product.name)}</h2>
                <p class="detail-description">${escapeHtml(product.description)}</p>
                <span class="detail-price">${money(product.price)}</span>
                <a class="buy-button detail-buy" href="${escapeAttribute(product.affiliateLink)}" target="_blank" rel="noopener noreferrer">Buy Now</a>
            </div>
        </div>
        <div class="suggestions">
            <div class="section-title-row">
                <h2>Similar Products</h2>
                <span class="pill">${escapeHtml(product.category)}</span>
            </div>
            ${renderSuggestions(suggestions)}
        </div>
    `;

    productDetail.classList.remove("hidden");
    productDetail.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderSuggestions(suggestions) {
    if (!suggestions.length) {
        return `<p class="message">No similar products found in this category yet.</p>`;
    }

    return `
        <div class="suggestion-grid">
            ${suggestions.map((product) => `
                <article class="suggestion-card" onclick="showProductDetail(${product.id})">
                    <img src="${imageSrc(product.imageUrl)}" alt="${escapeHtml(product.name)}">
                    <div>
                        <h3>${escapeHtml(product.name)}</h3>
                        <span class="price">${money(product.price)}</span>
                    </div>
                </article>
            `).join("")}
        </div>
    `;
}

function restoreSelectedProduct() {
    const selectedProductId = Number(sessionStorage.getItem(selectedProductKey));
    if (!selectedProductId) {
        return;
    }

    const selectedProductExists = currentProducts.some((product) => product.id === selectedProductId);
    if (selectedProductExists) {
        showProductDetail(selectedProductId);
    } else {
        closeProductDetail();
    }
}

function closeProductDetail() {
    sessionStorage.removeItem(selectedProductKey);
    productDetail.classList.add("hidden");
    productDetail.innerHTML = "";
}

function sameCategory(firstCategory, secondCategory) {
    return String(firstCategory || "").toLowerCase() === String(secondCategory || "").toLowerCase();
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value).replaceAll("`", "&#096;");
}
