import { getSafeStorageItem } from './storage.js';
import { renderProducts, isAdminMode, setIsAdminMode } from './products.js';
// import { updateCartIndicator, renderCartModal, clearCartArray } from './cart.js';
import { updateCartIndicator, renderCartModal, clearCartArray, cart } from './cart.js';


// Функція для завантаження товарів із нашого локального "сервера"
async function loadInitialProducts() {
  try {
    // 1. Робимо запит до файлу. fetch повертає об'єкт відповіді сервера
    const response = await fetch('./products.json');

    // Перевіряємо, чи успішно пройшов HTTP-запит (код 200-299)
    if (!response.ok) {
      throw new Error(`Помилка сервера: ${response.status}`);
    }

    // 2. Декодуємо текст JSON у звичайний масив JavaScript об'єктів
    const serverProducts = await response.json();

    // 3. Зберігаємо отримані з сервера дані в LocalStorage, щоб інші функції сайту працювали як зазвичай
    localStorage.setItem('myProducts', JSON.stringify(serverProducts));

    console.log('Товари успішно завантажені з сервера через fetch! 🎉');
  } catch (error) {
    console.error('Не вдалося завантажити товари з сервера:', error);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  // Запускаємо завантаження, і тільки КОЛИ воно завершиться — малюємо індикатор та вітрину
  loadInitialProducts().then(() => {
    updateCartIndicator();
    renderProducts();
  });

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

  // 4. Оформлення замовлення та автоматична відправка в Telegram
  const orderForm = document.getElementById('order-form');

  if (orderForm) {
    // Слово async перед (event) дозволяє нам використовувати await для fetch-запиту в мережу
    orderForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const customerName = document.getElementById('customer-name')?.value.trim();
      const customerPhone = document.getElementById('customer-phone')?.value.trim();
      const totalSum = document.getElementById('modal-total-sum')?.textContent || '0';

      // 1. Формуємо красивий текст повідомлення, який прийде вам у Telegram
      let message = `🔔 <b>Нове замовлення на сайті!</b>\n\n`;
      message += `👤 <b>Покупець:</b> ${customerName}\n`;
      message += `📞 <b>Телефон:</b> ${customerPhone}\n\n`;
      message += `🛒 <b>Товари у кошику:</b>\n`;

      cart.forEach(item => {
        const itemPrice = parseFloat(item.price) || 0;
        const itemQty = parseInt(item.quantity) || 1;
        message += `• ${item.name} (x${itemQty}) — ${itemPrice * itemQty} ₴\n`;
      });


      message += `\n💰 <b>Загальна сума до сплати:</b> ${totalSum} ₴`;

      // 2. Налаштування зв'язку з вашим Telegram-ботом (дані вже вставлені з вашого блокнота)
      // const TELEGRAM_TOKEN = '8623180677:AAGNltqHLlxtv6EhfHKgYNkYX72zA2A4IEo';
      const TELEGRAM_TOKEN = '8623180677:AAGnltqHLlxtv6EhfHKgYNkYX72zA2A4IEo';
      const TELEGRAM_CHAT_ID = '1115783978';
      const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;


      try {
        // 3. Надсилаємо асинхронний POST-запит на сервери Telegram
        const response = await fetch(TELEGRAM_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML' // Дозволяє використовувати теги жирного шрифту <b>
          })
        });

        if (!response.ok) {
          throw new Error(`Помилка відправки Telegram: ${response.status}`);
        }

        console.log('Замовлення успішно надіслано в Telegram чат розробника! 🚀');

        // 4. Перемикаємо модальне вікно сторінки на Блок 3 (Успіх)
        const successText = document.getElementById('success-message-text');
        if (successText) {
          successText.textContent = `${customerName}, ми зателефонуємо вам на номер ${customerPhone}. Сума до сплати: ${totalSum} ₴`;
        }

        if (checkoutBlock) checkoutBlock.style.display = 'none';
        if (successBlock) successBlock.style.display = 'block';

        // 5. Повністю очищуємо локальний кошик на сайті після успішної покупки
        clearCartArray();
        localStorage.removeItem('myCart');
        updateCartIndicator();
        orderForm.reset();

      } catch (error) {
        console.error('Помилка оформлення замовлення через мережу:', error);
        alert('Упс! Сталася помилка при відправці замовлення. Спробуйте ще раз.');
      }
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
