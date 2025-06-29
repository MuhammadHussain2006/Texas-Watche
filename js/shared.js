// Texas Watches - Shared JavaScript Components
// This file contains all the shared functionality across the site

class TexasWatchesApp {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateCounts();
    this.updateNavigationActiveState();
  }

  // Mobile menu toggle
  toggleMobileMenu() {
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
    const body = document.body;

    if (mobileMenu && mobileMenuOverlay) {
      mobileMenu.classList.toggle("active");
      mobileMenuOverlay.classList.toggle("active");
      body.style.overflow = mobileMenu.classList.contains("active")
        ? "hidden"
        : "";
    }
  }

  // Get favorites from localStorage
  getFavorites() {
    return JSON.parse(localStorage.getItem("texasWatchesFavorites") || "[]");
  }

  // Toggle favorite status for a product
  toggleFavorite(productId) {
    let favorites = this.getFavorites();
    if (favorites.includes(productId)) {
      favorites = favorites.filter((id) => id !== productId);
    } else {
      favorites.push(productId);
    }
    localStorage.setItem("texasWatchesFavorites", JSON.stringify(favorites));
    this.updateFavoritesCount();
    return favorites.includes(productId);
  }

  // Update favorites count in header
  updateFavoritesCount() {
    const count = this.getFavorites().length;
    document.querySelectorAll(".favorites-count").forEach((el) => {
      el.textContent = count;
    });
  }

  // Get cart from localStorage
  getCart() {
    return JSON.parse(localStorage.getItem("texasWatchesCart") || "[]");
  }

  // Update cart count in header
  updateCartCount() {
    const cart = this.getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll(".cart-count").forEach((element) => {
      element.textContent = count;
    });
  }

  // Update both counts
  updateCounts() {
    this.updateCartCount();
    this.updateFavoritesCount();
  }

  // Get current page from URL
  getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split("/").pop();
    if (filename === "" || filename === "index.html") return "index";
    return filename.replace(".html", "");
  }

  // Update navigation active state
  updateNavigationActiveState() {
    const currentPage = this.getCurrentPage();

    // Update desktop navigation
    const desktopNavLinks = document.querySelectorAll("#desktopNav .nav-link");
    desktopNavLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("data-page") === currentPage) {
        link.classList.add("active");
      }
    });

    // Update mobile navigation
    const mobileNavLinks = document.querySelectorAll("#mobileNav a");
    mobileNavLinks.forEach((link) => {
      link.classList.remove("text-black", "font-bold");
      if (link.getAttribute("data-page") === currentPage) {
        link.classList.add("text-black", "font-bold");
      }
    });
  }

  // Show success/error messages
  showMessage(message, type = "success") {
    const messageDiv = document.createElement("div");
    const bgColor = type === "success" ? "bg-black" : "bg-red-500";
    const icon =
      type === "success" ? "fa-check-circle" : "fa-exclamation-triangle";

    messageDiv.className = `fixed top-6 right-6 ${bgColor} text-white px-6 py-4 shadow-lg z-50 success-message max-w-md`;
    messageDiv.innerHTML = `
      <div class="flex items-start space-x-3">
        <i class="fas ${icon} text-xl mt-1"></i>
        <span class="font-light">${message}</span>
      </div>
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  }

  // Search functionality
  setupSearch() {
    const searchInputs = ["searchInput", "mobileSearchInput"];

    searchInputs.forEach((inputId) => {
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            this.performSearch(input.value);
          }
        });
      }
    });
  }

  // Perform search (can be customized per page)
  performSearch(query) {
    if (query.trim()) {
      // Navigate to search results or filter current page
      window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    }
  }

  // Navigate to product detail page
  navigateToProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
  }

  // Form validation helper
  validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const requiredFields = form.querySelectorAll("[required]");
    let isValid = true;

    requiredFields.forEach((field) => {
      // Remove previous error styling
      field.classList.remove("form-error");
      const existingError = field.parentNode.querySelector(".error-message");
      if (existingError) {
        existingError.remove();
      }

      const value = field.value.trim();

      if (!value) {
        field.classList.add("form-error");
        this.showFieldError(field, "This field is required");
        isValid = false;
      } else if (field.type === "email" && !this.isValidEmail(value)) {
        field.classList.add("form-error");
        this.showFieldError(field, "Please enter a valid email address");
        isValid = false;
      }
    });

    if (!isValid) {
      // Scroll to first error
      const firstError = document.querySelector(".form-error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    return isValid;
  }

  // Show field error
  showFieldError(field, message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message text-red-500 text-sm mt-1 font-light";
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
  }

  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Setup event listeners
  setupEventListeners() {
    // Mobile menu toggle
    window.toggleMobileMenu = () => this.toggleMobileMenu();

    // Handle window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) {
        const mobileMenu = document.getElementById("mobileMenu");
        const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
        if (mobileMenu) mobileMenu.classList.remove("active");
        if (mobileMenuOverlay) mobileMenuOverlay.classList.remove("active");
        document.body.style.overflow = "";
      }
    });

    // Setup search when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setupSearch());
    } else {
      this.setupSearch();
    }
  }

  // Load products from JSON (used across multiple pages)
  async loadProducts() {
    try {
      const response = await fetch("products.json");
      if (!response.ok) {
        throw new Error("Products file not found");
      }
      return await response.json();
    } catch (error) {
      console.error("Error loading products:", error);
      return [];
    }
  }

  // Utility function to format price
  formatPrice(price) {
    return `$${price.toLocaleString()}`;
  }

  // Utility function to calculate discount percentage
  calculateDiscount(oldPrice, newPrice) {
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  }

  // Component loader helper
  async loadComponent(elementId, componentPath) {
    try {
      const response = await fetch(componentPath);
      if (!response.ok) {
        throw new Error(`Failed to load component: ${componentPath}`);
      }
      const html = await response.text();
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = html;
      }
    } catch (error) {
      console.error("Error loading component:", error);
    }
  }

  // Initialize components (header, footer)
  async initializeComponents() {
    await Promise.all([
      this.loadComponent("header", "components/header.html"),
      this.loadComponent("footer", "components/footer.html"),
    ]);

    // Re-run initialization after components are loaded
    this.init();
  }
}

// Initialize the app
const app = new TexasWatchesApp();

// Make app globally available for other scripts
window.TexasWatchesApp = app;

// Initialize components if the page uses them
document.addEventListener("DOMContentLoaded", function () {
  const headerElement = document.getElementById("header");
  const footerElement = document.getElementById("footer");

  if (headerElement || footerElement) {
    app.initializeComponents();
  }
});
