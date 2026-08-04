export let cart = JSON.parse(localStorage.getItem('myCart')) || [];

export function clearCartArray() {
  cart = [];
}

export function updateCartIndicator() {
  const countElement = document.getElementById('cart-count');
  const totalElement = document.getElementById('cart-total');
  if (!countElement || !totalElement) return;

  const totalCount = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
  countElement.textContent = totalCount;

  const totalSum = cart.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    return sum + (price * quantity);
  }, 0);
  totalElement.textContent = totalSum;
}

export function renderCartModal() {
  const modalCartItems = document.getElementById('modal-cart-items');
  const template = document.getElementById('cart-item-template');
  const modalTotalSum = document.getElementById('modal-total-sum');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (!modalCartItems || !modalTotalSum) return;
  modalCartItems.innerHTML = '';

  if (cart.length === 0) {
    modalCartItems.innerHTML = '<p style="text-align:center; font-weight:500; color:#888; padding: 20px 0;">Кошик порожній :(</p>';
    modalTotalSum.textContent = '0';
    if (checkoutBtn) checkoutBtn.style.display = 'none';
    return;
  }

  if (checkoutBtn) checkoutBtn.style.display = 'inline-block';
  let currentTotalSum = 0;

  cart.forEach((item, index) => {
    let itemClone;
    if (template) {
      itemClone = template.content.cloneNode(true);
    } else {
      const div = document.createElement('div');
      div.className = 'modal-cart-item';
      div.style.display = 'flex';
      div.style.justifyContent = 'space-between';
      div.style.marginBottom = '10px';
      div.innerHTML = `<span class="cart-item-name"></span><span class="cart-item-quantity" style="margin: 0 10px; color: #888;"></span><span class="cart-item-price" style="font-weight: bold;"></span><button class="remove-from-cart-btn" style="margin-left: 10px; color: red; cursor:pointer; background:none; border:none;">&times;</button>`;
      itemClone = div;
    }

    itemClone.querySelector('.cart-item-name').textContent = item.name;
    itemClone.querySelector('.cart-item-quantity').textContent = `x${item.quantity || 1}`;
    const itemTotalLinePrice = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
    itemClone.querySelector('.cart-item-price').textContent = `${itemTotalLinePrice} ₴`;
    currentTotalSum += itemTotalLinePrice;

    const removeBtn = itemClone.querySelector('.remove-from-cart-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (item.quantity > 1) item.quantity -= 1;
        else cart.splice(index, 1);
        localStorage.setItem('myCart', JSON.stringify(cart));
        updateCartIndicator();
        renderCartModal();
      });
    }
    modalCartItems.appendChild(itemClone);
  });
  modalTotalSum.textContent = currentTotalSum;
}
