
// assets/ecomx-grid.js
// Vanilla JS modal for products + AJAX cart add + special bundle rule.
//
// Requirements covered:
// - Click product card → open modal with title, price, description, variant selectors.
// - Add to Cart posts to /cart/add.js
// - If selected variant options include "Black" and "Medium", also add the configured "Soft Winter Jacket" product variant.
// - No jQuery.

(function(){
  const moneyFormat = document.documentElement.getAttribute('data-money-format') || "${{amount}}";
  const formatMoney = (cents) => {
    // Very small formatter for ${amount} templates
    const amount = (cents / 100).toFixed(2);
    return moneyFormat.replace(/\{\{\s*amount\s*\}\}/, amount);
  };

  const modal = document.getElementById('ecomx-modal');
  const backdrop = modal?.querySelector('.ecomx-modal-backdrop');
  const panel = modal?.querySelector('.ecomx-modal__panel');
  const titleEl = modal?.querySelector('[data-modal-title]');
  const priceEl = modal?.querySelector('[data-modal-price]');
  const descEl  = modal?.querySelector('[data-modal-desc]');
  const mediaEl = modal?.querySelector('[data-modal-media]');
  const optionsWrap = modal?.querySelector('[data-modal-options]');
  const qtyInput = modal?.querySelector('[data-qty]');
  const addBtn = modal?.querySelector('[data-add]');
  const closeBtn = modal?.querySelector('[data-close]');

  let activeProduct = null;
  let activeProductJSON = null;
  let currentVariant = null;
  let jacketVariantId = Number(modal?.dataset?.jacketVariantId || 0);

  const openModal = () => {
    if(!modal) return;
    modal.setAttribute('open', '');
    document.documentElement.style.overflow = 'hidden';
  };
  const closeModal = () => {
    if(!modal) return;
    modal.removeAttribute('open');
    document.documentElement.style.overflow = '';
  };

  backdrop?.addEventListener('click', closeModal);
  closeBtn?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeModal();
  });

  // Grid card clicks
  document.addEventListener('click', async (e)=>{
    const cardBtn = e.target.closest('[data-open-product]');
    if(!cardBtn) return;
    e.preventDefault();

    const handle = cardBtn.getAttribute('data-handle');
    const descHtml = cardBtn.getAttribute('data-desc') || '';
    const imageSrc = cardBtn.getAttribute('data-image') || '';
    titleEl.textContent = cardBtn.getAttribute('data-title') || '';
    descEl.innerHTML = descHtml;
    mediaEl.innerHTML = imageSrc ? `<img src="${imageSrc}" alt="">` : '';

    // Reset qty
    qtyInput.value = 1;
    priceEl.textContent = '';

    try {
      const res = await fetch(`/products/${handle}.js`);
      if(!res.ok) throw new Error('Product fetch failed');
      const product = await res.json();
      activeProductJSON = product;

      // Build options UI
      optionsWrap.innerHTML = '';
      if(product.options && product.options.length){
        product.options.forEach((opt, idx)=>{
          const id = `opt-${idx}`;
          const wrap = document.createElement('div');
          wrap.className = 'ecomx-option';
          wrap.innerHTML = `
            <label for="${id}">${opt.name}</label>
            <select id="${id}" data-opt-index="${idx}">
              ${opt.values.map(v => `<option value="${v}">${v}</option>`).join('')}
            </select>
          `;
          optionsWrap.appendChild(wrap);
        });
      }

      const selects = optionsWrap.querySelectorAll('select');
      const syncVariant = () => {
        if(!product.variants?.length){
          currentVariant = null;
          return;
        }
        const chosen = Array.from(selects).map(s => s.value);
        const match = product.variants.find(v => {
          // v.options is array in order
          if(!v.available) return false;
          return v.options.every((val, i) => val === chosen[i]);
        }) || product.variants.find(v => v.available) || product.variants[0];
        currentVariant = match;
        priceEl.textContent = formatMoney(match.price);
      };
      selects.forEach(sel => sel.addEventListener('change', syncVariant));

      // Init
      syncVariant();
      openModal();
    } catch(err){
      console.error(err);
      alert('Could not load product. Please try again.');
    }
  });

  // Add to cart
  addBtn?.addEventListener('click', async () => {
    if(!activeProductJSON || !currentVariant) return;
    const quantity = Math.max(1, parseInt(qtyInput.value || '1', 10));

    // Check special rule: if chosen options include Black + Medium
    const hasBlackMedium = (currentVariant?.options || []).some(o => /black/i.test(o)) &&
                           (currentVariant?.options || []).some(o => /medium/i.test(o));

    const items = [{ id: currentVariant.id, quantity }];

    if (hasBlackMedium && jacketVariantId) {
      // Add the bundled jacket as +1 (or match quantity? The spec says 'also be automatically added' → add 1)
      items.push({ id: jacketVariantId, quantity: 1 });
    }

    try{
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ items })
      });
      if(!res.ok){
        const err = await res.json().catch(()=>({}));
        throw new Error(err?.description || 'Add to cart failed');
      }
      // Feedback
      addBtn.disabled = true;
      addBtn.textContent = 'Added!';
      setTimeout(()=>{
        addBtn.disabled = false;
        addBtn.textContent = 'Add to cart';
      }, 1500);
      closeModal();
    }catch(err){
      console.error(err);
      alert(err.message || 'Could not add to cart.');
    }
  });

})();
