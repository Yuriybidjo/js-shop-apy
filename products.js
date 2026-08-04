import { getSafeStorageItem } from './storage.js';
import { cart, updateCartIndicator } from './cart.js';

// Експортуємо змінну стану адміна, щоб її міг змінювати головний файл
export let isAdminMode = false;

export function setIsAdminMode(value) {
  isAdminMode = value;
}

export function renderProducts(searchFilter = "") {
  const productsGrid = document.getElementById('products-grid');
  const template = document.getElementById('product-card-template');
  let products = getSafeStorageItem('myProducts');

  if (!productsGrid || !template) return;
  productsGrid.innerHTML = '';

  if (searchFilter !== "") {
    products = products.filter(product => product.name.toLowerCase().includes(searchFilter.toLowerCase()));
  }

  if (products.length === 0) {
    productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-weight: 500; color: #888; padding: 40px 0;">Нічого не знайдено за вашим запитом :(</p>';
    return;
  }

  products.forEach((product) => {
    const cardClone = template.content.cloneNode(true);
    const cardHtmlElement = cardClone.querySelector('.product-card');

    cardClone.querySelector('.product-img').src = product.img || product.image || '';
    cardClone.querySelector('.product-title').textContent = product.name;
    cardClone.querySelector('.product-price').textContent = `${product.price} ₴`;

    const buyBtn = cardClone.querySelector('.buy-btn');
    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
          existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
          cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
        }
        localStorage.setItem('myCart', JSON.stringify(cart));
        updateCartIndicator();

        buyBtn.textContent = 'В кошику! ✓';
        buyBtn.style.backgroundColor = 'var(--color6)';
        setTimeout(() => {
          buyBtn.textContent = 'Купити';
          buyBtn.style.backgroundColor = '';
        }, 1000);
      });
    }

    const titleElement = cardClone.querySelector('.product-title');
    const priceElement = cardClone.querySelector('.product-price');

    if (titleElement && priceElement) {
      titleElement.contentEditable = isAdminMode ? "true" : "false";
      priceElement.contentEditable = isAdminMode ? "true" : "false";

      if (isAdminMode) {
        titleElement.addEventListener('blur', () => {
          const newName = titleElement.textContent.trim();
          if (newName !== "") {
            product.name = newName;
            const currentProducts = getSafeStorageItem('myProducts');
            const targetProduct = currentProducts.find(p => p.id === product.id);
            if (targetProduct) targetProduct.name = newName;
            localStorage.setItem('myProducts', JSON.stringify(currentProducts));
          } else {
            titleElement.textContent = product.name;
          }
        });

        priceElement.addEventListener('blur', () => {
          const cleanPriceText = priceElement.textContent.replace('₴', '').trim();
          const newPrice = parseFloat(cleanPriceText);
          if (!isNaN(newPrice) && newPrice > 0) {
            product.price = newPrice;
            priceElement.textContent = `${newPrice} ₴`;
            const currentProducts = getSafeStorageItem('myProducts');
            const targetProduct = currentProducts.find(p => p.id === product.id);
            if (targetProduct) targetProduct.price = newPrice;
            localStorage.setItem('myProducts', JSON.stringify(currentProducts));
          } else {
            priceElement.textContent = `${product.price} ₴`;
          }
        });
      }
    }

    const deleteBtn = cardClone.querySelector('.delete-btn');
    if (deleteBtn) {
      if (isAdminMode) {
        deleteBtn.style.display = 'inline-block';
        deleteBtn.addEventListener('click', () => {
          if (cardHtmlElement) cardHtmlElement.remove();
          const currentProducts = getSafeStorageItem('myProducts');
          const updatedProducts = currentProducts.filter(p => p.id !== product.id);
          localStorage.setItem('myProducts', JSON.stringify(updatedProducts));
        });
      } else {
        deleteBtn.style.display = 'none';
      }
    }
    productsGrid.appendChild(cardClone);
  });
}
