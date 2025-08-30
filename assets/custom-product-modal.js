// EE modal & cart logic — vanilla JS
(function () {
  const fmt = (cents) => {
    try { return Shopify.formatMoney(cents); }
    catch { return (cents/100).toFixed(2); }
  };

  // Open handlers
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.ee-open-modal');
    if (!btn) return;

    const handle = btn.dataset.handle;
    const modal  = document.getElementById('ee-modal');
    if (!modal) return;

    // Fetch product JSON
    const res = await fetch(`/products/${handle}.js`, { credentials: 'same-origin' });
    const product = await res.json();

    renderProduct(product, modal);
    modal.setAttribute('aria-hidden', 'false');
  });

  // Close handlers
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('ee-modal');
    if (!modal) return;
    if (e.target.classList.contains('ee-modal__overlay') || e.target.classList.contains('ee-modal__close')) {
      modal.setAttribute('aria-hidden', 'true');
      modal.querySelector('.ee-modal__content').innerHTML = '';
    }
  });

  function findOptionIndex(product, nameGuess, fallbackIndex) {
    const idx = product.options.findIndex(o => o.name.toLowerCase() === nameGuess);
    return idx > -1 ? idx : fallbackIndex;
  }

  function uniqueValues(product, optIndex) {
    const set = new Set();
    product.variants.forEach(v => set.add(v[`option${optIndex+1}`]));
    return Array.from(set);
  }

  function renderProduct(product, modal) {
    // Try to map Color/Size (fallbacks if products named differently)
    const colorIdx = findOptionIndex(product, 'color', 0);
    const sizeIdx  = findOptionIndex(product, 'size', Math.min(1, product.options.length-1));

    const colors = product.options[colorIdx] ? uniqueValues(product, colorIdx) : [];
    const sizes  = product.options[sizeIdx]  ? uniqueValues(product, sizeIdx)  : [];

    // pick first available variant as default
    const defaultVar = product.variants.find(v => v.available) || product.variants[0];

    const html = `
      <img class="ee-pimg" src="${(product.images[0]||product.featured_image)?.src || product.featured_image}" alt="${product.title}">
      <div>
        <h3 class="ee-title">${product.title}</h3>
        <p class="ee-price">${fmt(defaultVar ? defaultVar.price : product.price)}</p>
        <p class="ee-desc">${product.description || ''}</p>

        ${colors.length ? `
        <div class="ee-field">
          <div class="ee-label">Color</div>
          <div class="ee-pills" id="ee-color">
            ${colors.map((c,i)=>`<button class="ee-pill" type="button" data-value="${c}" aria-pressed="${i===0?'true':'false'}">${c}</button>`).join('')}
          </div>
        </div>` : ''}

        ${sizes.length ? `
        <div class="ee-field">
          <div class="ee-label">Size</div>
          <select class="ee-select" id="ee-size" aria-label="Choose size">
            ${sizes.map((s,i)=>`<option value="${s}" ${i===0?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>` : ''}

        <div class="ee-actions">
          <button class="ee-add" id="ee-add">Add to cart</button>
          <span class="ee-note" id="ee-note" aria-live="polite"></span>
        </div>
      </div>
    `;

    const mount = modal.querySelector('.ee-modal__content');
    mount.innerHTML = html;

    // State
    let selColor = colors[0] || null;
    let selSize  = sizes[0]  || null;

    // events
    const colorWrap = mount.querySelector('#ee-color');
    if (colorWrap) {
      colorWrap.addEventListener('click', (ev)=>{
        const pill = ev.target.closest('.ee-pill'); if(!pill) return;
        colorWrap.querySelectorAll('.ee-pill').forEach(p => p.setAttribute('aria-pressed','false'));
        pill.setAttribute('aria-pressed','true');
        selColor = pill.dataset.value;
      });
    }
    const sizeSel = mount.querySelector('#ee-size');
    if (sizeSel) {
      sizeSel.addEventListener('change', () => { selSize = sizeSel.value; });
    }

    // Add to cart
    mount.querySelector('#ee-add').addEventListener('click', async ()=>{
      const variant = pickVariant(product, selColor, selSize, colorIdx, sizeIdx) || product.variants[0];
      const note = mount.querySelector('#ee-note');

      // add selected
      await fetch('/cart/add.js', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id: variant.id, quantity: 1 })
      });

      // bonus rule
      const modalRoot = document.getElementById('ee-modal');
      const bonusEnabled = modalRoot?.dataset?.bonusEnabled === 'true';
      const bonusHandle  = modalRoot?.dataset?.bonusHandle;
      const isBlack = [variant[`option${colorIdx+1}`], selColor].filter(Boolean).some(v => String(v).toLowerCase() === 'black');
      const isMedium = [variant[`option${sizeIdx+1}`], selSize].filter(Boolean).some(v => String(v).toLowerCase() === 'medium');

      if (bonusEnabled && isBlack && isMedium && bonusHandle) {
        try {
          const jr = await fetch(`/products/${bonusHandle}.js`);
          const jp = await jr.json();
          const bonusVar = jp.variants.find(v=>v.available) || jp.variants[0];
          if (bonusVar) {
            await fetch('/cart/add.js', {
              method:'POST', headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ id: bonusVar.id, quantity: 1 })
            });
          }
        } catch(e){}
      }

      note.textContent = 'Added!';
      setTimeout(()=>{ document.getElementById('ee-modal').setAttribute('aria-hidden','true'); }, 400);
    });
  }

  function pickVariant(product, color, size, colorIdx, sizeIdx){
    const opts = {};
    if (color != null) opts[colorIdx] = String(color);
    if (size  != null) opts[sizeIdx]  = String(size);

    return product.variants.find(v=>{
      const o1 = v.option1, o2 = v.option2, o3 = v.option3;
      const arr = [o1,o2,o3];
      return Object.keys(opts).every(i => arr[Number(i)] == opts[i]);
    });
  }

})();
