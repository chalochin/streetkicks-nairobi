const form = document.getElementById('uploadForm');
const shoesContainer = document.getElementById('shoesContainer');

// ✅ Map categories to emojis to match your existing card style
function getEmoji(category) {
  const map = {
    'Running': '👟', 'Casual': '👞', 'Basketball': '👟',
    'High-top': '👟', 'Low-top': '👟', 'Limited Edition': '⭐',
    'Heels': '👠', 'Flats': '👡', 'Boots': '🥾'
  };
  return map[category] || '👟';
}

// Load shoes from DB and render as cards
async function loadShoes() {
  try {
    const res = await fetch('/api/shoes');
    const shoes = await res.json();

    // ✅ Guard: make sure container exists
    if (!shoesContainer) return;

    if (shoes.length === 0) {
      shoesContainer.innerHTML = '<p style="color:#aaa;text-align:center;grid-column:1/-1;">No shoes in stock yet. Check back soon!</p>';
      return;
    }

    shoesContainer.innerHTML = '';

    shoes.forEach(shoe => {
      const waText = encodeURIComponent(`Hi! I want to order the ${shoe.name} 👟`);
      const priceFormatted = Number(shoe.price).toLocaleString();

      shoesContainer.innerHTML += `
        <div class="shoe-card reveal" data-id="${shoe._id}">
          <div class="shoe-img" style="background:#111;display:flex;align-items:center;justify-content:center;min-height:200px;overflow:hidden;">
            ${shoe.image
              ? `<img src="${shoe.image}" alt="${shoe.name}" style="width:100%;height:220px;object-fit:cover;border-radius:inherit;">`
              : `<span class="shoe-emoji">${getEmoji(shoe.category)}</span>`
            }
          </div>
          <div class="shoe-body">
            <div class="shoe-category">${shoe.category}</div>
            <div class="shoe-name">${shoe.name}</div>
            <div class="shoe-footer">
              <div><span class="shoe-price">KSh ${priceFormatted}</span></div>
              <a href="https://wa.me/254797282410?text=${waText}"
                 class="shoe-order" target="_blank">Order</a>
            </div>
          </div>
        </div>
      `;
    });

  } catch (err) {
    console.error('Failed to load shoes:', err);
    if (shoesContainer) {
      shoesContainer.innerHTML = '<p style="color:red;text-align:center;grid-column:1/-1;">Could not load shoes. Is the server running?</p>';
    }
  }
}

// Add shoe (admin form — only runs if form exists on the page)
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const res = await fetch('/api/shoes', { method: 'POST', body: formData });
      if (res.ok) {
        form.reset();
        loadShoes();
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  });
}

// Delete shoe
async function deleteShoe(id) {
  if (!confirm('Delete this shoe?')) return;
  await fetch(`/api/shoes/${id}`, { method: 'DELETE' });
  loadShoes();
}

// ✅ Run on page load
loadShoes();