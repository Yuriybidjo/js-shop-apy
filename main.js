import { getSafeStorageItem } from './storage.js';
import { renderProducts, isAdminMode, setIsAdminMode } from './products.js';
import { updateCartIndicator, renderCartModal, clearCartArray } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
  // Дефолтні товари, якщо порожньо
  if (getSafeStorageItem('myProducts').length === 0) {
    localStorage.setItem('myProducts', JSON.stringify([
      { id: 101, name: "Базовий смартфон", price: 12000, img: "https://placehold.co" },
      { id: 102, name: "Бездротові навушники", price: 3700, img: "https://placehold.co" },
      { id: 103, name: "Механічна клавіатура", price: 2800, img: "https://placehold.co" }
    ]));
  }

  updateCartIndicator();
  renderProducts();

  // 1. Пошук
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => renderProducts(e.target.value.trim()));
  }

  // 2. Перемикач адміна
  const adminToggleBtn = document.getElementById('admin-toggle-btn');
  const adminFormContainer = document.getElementById('admin-form-container');
  if (adminToggleBtn) {
    adminToggleBtn.addEventListener('click', () => {
      // Змінюємо стан через експортовану функцію
      setIsAdminMode(!isAdminMode);
      if (isAdminMode) {
        adminToggleBtn.innerHTML = '<i class="ri-user-settings-line"></i> Вийти з адміна 🔓';
        adminToggleBtn.style.backgroundColor = '#d9534f';
        if (adminFormContainer) adminFormContainer.style.display = 'block';
      } else {
        adminToggleBtn.innerHTML = '<i class="ri-user-settings-line"></i> Режим адміна 🔒';
        adminToggleBtn.style.backgroundColor = '';
        if (adminFormContainer) adminFormContainer.style.display = 'none';
      }
      renderProducts();
    });
  }

  // 3. Модалка кошика
  const cartIndicator = document.getElementById('cart-indicator');
  const cartModal = document.getElementById('cart-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const mainCartBlock = document.getElementById('modal-cart-main-block');
  const checkoutBlock = document.getElementById('modal-checkout-block');
  const successBlock = document.getElementById('modal-success-block');

  if (cartIndicator && cartModal) {
    const clickableArea = cartIndicator.querySelector('.cart-indicator-clickable');
    if (clickableArea) {
      clickableArea.addEventListener('click', () => {
        if (mainCartBlock) mainCartBlock.style.display = 'block';
        if (checkoutBlock) checkoutBlock.style.display = 'none';
        if (successBlock) successBlock.style.display = 'none';
        cartModal.style.display = 'block';
        renderCartModal();
      });
    }
  }

  if (closeModalBtn && cartModal) {
    closeModalBtn.addEventListener('click', () => cartModal.style.display = 'none');
  }

  const checkoutBtn = document.getElementById('checkout-btn');
  const backToCartBtn = document.getElementById('back-to-cart-btn');

  if (checkoutBtn && mainCartBlock && checkoutBlock) {
    checkoutBtn.addEventListener('click', () => {
      mainCartBlock.style.display = 'none';
      checkoutBlock.style.display = 'block';
    });
  }

  if (backToCartBtn && mainCartBlock && checkoutBlock) {
    backToCartBtn.addEventListener('click', () => {
      checkoutBlock.style.display = 'none';
      mainCartBlock.style.display = 'block';
    });
  }

  // 4. Оформлення замовлення
  const orderForm = document.getElementById('order-form');
  if (orderForm) {
    orderForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const customerName = document.getElementById('customer-name')?.value.trim();
      const customerPhone = document.getElementById('customer-phone')?.value.trim();
      const totalSum = document.getElementById('modal-total-sum')?.textContent || '0';

      const successText = document.getElementById('success-message-text');
      if (successText) {
        successText.textContent = `${customerName}, ми зателефонуємо вам на номер ${customerPhone}. Сума до сплати: ${totalSum} ₴`;
      }

      if (checkoutBlock) checkoutBlock.style.display = 'none';
      if (successBlock) successBlock.style.display = 'block';

      clearCartArray();
      localStorage.removeItem('myCart');
      updateCartIndicator();
      orderForm.reset();
    });
  }
});

// Форма додавання товарів адміном
const addForm = document.getElementById('add-product-form');
if (addForm) {
  addForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameInput = document.getElementById('new-name');
    const priceInput = document.getElementById('new-price');
    const imgInput = document.getElementById('new-img');

    const newProduct = {
      id: Date.now(),
      name: nameInput.value.trim(),
      price: parseFloat(priceInput.value) || 0,
      img: imgInput.value.trim()
    };

    const currentProducts = getSafeStorageItem('myProducts');
    currentProducts.push(newProduct);
    localStorage.setItem('myProducts', JSON.stringify(currentProducts));
    addForm.reset();
    renderProducts();
  });
}

// Швидке очищення кошика
const clearCartBtn = document.getElementById('clear-cart-btn');
if (clearCartBtn) {
  clearCartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearCartArray();
    localStorage.removeItem('myCart');
    updateCartIndicator();
    renderCartModal();
  });
}
