
// assets/ecomx-banner.js
// Tiny unobtrusive 'bounce' animation on buttons; respects data-animate attr.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.ecomx-btn[data-animate="bounce"]').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      // nothing to do; CSS handles :hover scale
    });
    // Optionally, add a micro ripple on click for delight
    btn.addEventListener('click', (e) => {
      const rip = document.createElement('span');
      rip.style.position = 'absolute';
      rip.style.inset = '0';
      rip.style.borderRadius = '999px';
      rip.style.boxShadow = '0 0 0 0 rgba(255,255,255,.6)';
      rip.style.transition = 'box-shadow .5s ease';
      rip.style.pointerEvents = 'none';
      btn.style.position = 'relative';
      btn.appendChild(rip);
      requestAnimationFrame(() => {
        rip.style.boxShadow = '0 0 0 16px rgba(255,255,255,0)';
      });
      setTimeout(() => rip.remove(), 500);
    });
  });
});
