const API_BASE = "";

function money(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR"
    }).format(Number(value || 0));
}

async function apiFetch(url, options = {}) {
    const response = await fetch(API_BASE + url, options);
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : null;

    if (!response.ok) {
        const message = data?.message || "Request failed. Please try again.";
        throw new Error(message);
    }

    return data;
}

function setMessage(element, text, type = "") {
    element.textContent = text;
    element.className = "message";
    if (type) {
        element.classList.add(type);
    }
}

function imageSrc(url) {
    if (!url) {
        return "https://placehold.co/600x450/e7eef5/17202a?text=Product";
    }
    return url;
}

async function loadSiteSettings() {
    try {
        return await apiFetch("/settings");
    } catch (error) {
        return { websiteName: "amazonfindins", logoUrl: "" };
    }
}

function applyBranding(settings, nameElement, logoElement, titleElement) {
    const siteName = settings.websiteName || "amazonfindins";
    nameElement.textContent = siteName;
    document.title = document.title.replace("amazonfindins", siteName);

    if (titleElement) {
        titleElement.textContent = `Find useful products with ${siteName}`;
    }

    if (settings.logoUrl) {
        logoElement.src = settings.logoUrl;
        logoElement.classList.remove("hidden");
    } else {
        logoElement.classList.add("hidden");
    }
}

function debounce(callback, delay = 250) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => callback(...args), delay);
    };
}
