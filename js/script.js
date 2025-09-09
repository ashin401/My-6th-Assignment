//--------navbar section------------
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.querySelector("button");

  btn.addEventListener("click", function () {
    alert("Thank you for planting a tree! 🌱");
  });
});


//--------Choose Your Trees section-------------
const API_BASE = "https://openapi.programming-hero.com/api";
const categoryListEl = document.getElementById("category-list");
const plantsContainerEl = document.getElementById("plants-container");
const plantsLoadingEl = document.getElementById("plants-loading");
const cartListEl = document.getElementById("cart-list");
const cartTotalEl = document.getElementById("cart-total");
const modalEl = document.getElementById("plant-modal");
const modalBodyEl = document.getElementById("modal-body");

let cart = []; 

/*  Helpers  */
function extractArray(resp) {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp.data)) return resp.data;
  if (Array.isArray(resp.categories)) return resp.categories;
  if (Array.isArray(resp.plants)) return resp.plants;
  if (resp.data && Array.isArray(resp.data.data)) return resp.data.data;
  return [];
}
function getField(obj, keys = []) {
  if (!obj) return undefined;
  for (const k of keys) if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  return undefined;
}
function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;", '"':"&quot;", "'":"&#39;" }[m]));
}
function truncateText(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "..." : s;
}

/*  Toast (center top)  */
let toastTimer = null;
function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 1800);
}

/*  Load categories  */
async function loadCategories() {
  categoryListEl.innerHTML = "<li>Loading...</li>";
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const json = await res.json();
    let cats = extractArray(json);
    if (!cats.length && json.data && Array.isArray(json.data.categories)) cats = json.data.categories;
    if (!cats.length && json.categories && Array.isArray(json.categories)) cats = json.categories;

    const mapped = cats.map((c, i) => ({
      id: getField(c, ["category_id","id","_id"]) || String(i+1),
      name: getField(c, ["category","category_name","name","title"]) || "Unnamed"
    }));
    mapped.unshift({ id: "all", name: "All Trees" });
    renderCategoryList(mapped);
  } catch (err) {
    categoryListEl.innerHTML = "<li>Error loading categories</li>";
    console.error(err);
  }
}
function renderCategoryList(list) {
  categoryListEl.innerHTML = "";
  list.forEach((c, i) => {
    const li = document.createElement("li");
    li.textContent = c.name;
    li.dataset.id = c.id;
    if (i === 0) li.classList.add("active");
    li.addEventListener("click", () => {
      categoryListEl.querySelectorAll("li").forEach(x => x.classList.remove("active"));
      li.classList.add("active");
      loadPlantsByCategory(c.id);
    });
    categoryListEl.appendChild(li);
  });
  loadPlantsByCategory(list[0]?.id || "all");
}

/*  Load plants  */
async function loadPlantsByCategory(catId) {
  plantsContainerEl.innerHTML = "";
  plantsLoadingEl.classList.remove("hidden");
  try {
    const url = catId === "all" ? `${API_BASE}/plants` : `${API_BASE}/category/${catId}`;
    const res = await fetch(url);
    const json = await res.json();
    let items = extractArray(json);
    if (!items.length && json.data) {
      if (Array.isArray(json.data)) items = json.data;
      else if (Array.isArray(json.data.data)) items = json.data.data;
      else if (Array.isArray(json.data.plants)) items = json.data.plants;
    }
    if (!items.length && json.plants) items = json.plants;
    displayPlants(items);
  } catch (err) {
    plantsContainerEl.innerHTML = "<div>Error loading items</div>";
    console.error(err);
  } finally {
    setTimeout(() => plantsLoadingEl.classList.add("hidden"), 150);
  }
}

/*  Render plant cards  */
function displayPlants(items) {
  plantsContainerEl.innerHTML = "";
  if (!items || items.length === 0) {
    plantsContainerEl.innerHTML = "<div>No items in this category</div>";
    return;
  }
  items.forEach(p => {
    const name = getField(p, ["plant_name","name","common_name"]) || "Unnamed Plant";
    const id = getField(p, ["plant_id","id","_id"]) || "";
    const image = getField(p, ["image","image_url","imageUrl"]) || "";
    const desc = getField(p, ["description","short_description","about","details"]) || "";
    const categoryLabel = getField(p, ["category","category_name"]) || "";
    const price = Number(getField(p, ["price","cost","sale_price","price_bdt"]) || 0) || 0;

    const card = document.createElement("div");
    card.className = "plant-card";
    card.innerHTML = `
      <img src="${escapeHtml(image)}" alt="${escapeHtml(name)}">
      <h4 class="plant-name" data-id="${escapeHtml(id)}">${escapeHtml(name)}</h4>
      <p class="plant-desc">${escapeHtml(truncateText(desc, 80))}</p>
      <div class="plant-meta">
        <div class="plant-cat">${escapeHtml(categoryLabel || "Uncategorized")}</div>
        <div class="plant-price">৳${price}</div>
      </div>
      <button class="btn-add">Add to Cart</button>
    `;
    // Add to cart
    card.querySelector(".btn-add").addEventListener("click", () => {
      const itemId = id || name;
      addToCart({ id: itemId, name, price });
      showToast(`${name} added to cart`);
    });
    // Category badge and name open modal
    card.querySelector(".plant-cat").addEventListener("click", () => {
      openModalFromObject({ id, name, image, category: categoryLabel, price, description: desc });
    });
    card.querySelector(".plant-name").addEventListener("click", () => {
      openModalFromObject({ id, name, image, category: categoryLabel, price, description: desc });
    });
    plantsContainerEl.appendChild(card);
  });
}

/*  Modal open/close (dynamic close button)  */
function openModalFromObject(obj) {
  modalBodyEl.innerHTML = `
    <h2>${escapeHtml(obj.name)}</h2>
    ${obj.image ? `<img src="${escapeHtml(obj.image)}" alt="${escapeHtml(obj.name)}">` : ""}
    <p><strong>Category:</strong> ${escapeHtml(obj.category || "N/A")}</p>
    <p><strong>Price:</strong> ৳${Number(obj.price || 0)}</p>
    <p style="margin-top:10px;">${escapeHtml(obj.description || "")}</p>
  `;
  // remove any existing dynamic close button (prevent duplicates)
  const existingBtn = modalEl.querySelector("#close-modal");
  if (existingBtn) existingBtn.remove();

  // create close button dynamically
  const modalContent = modalEl.querySelector(".modal-content");
  const btn = document.createElement("button");
  btn.id = "close-modal";
  btn.className = "modal-close";
  btn.textContent = "Close";
  btn.addEventListener("click", () => {
    modalEl.classList.add("hidden");
    btn.remove();
  });
  modalContent.appendChild(btn);
  modalEl.classList.remove("hidden");
}

// clicking outside modal-content closes modal and removes button
modalEl.addEventListener("click", (e) => {
  if (e.target === modalEl) {
    const btn = modalEl.querySelector("#close-modal");
    if (btn) btn.remove();
    modalEl.classList.add("hidden");
  }
});

/*  Cart with qty  */
function addToCart(item) {
  const existing = cart.find(c => c.id === item.id);
  if (existing) existing.qty = (existing.qty || 1) + 1;
  else cart.push({ ...item, qty: 1 });
  renderCart();
}
function removeFromCart(index) {
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    renderCart();
  }
}
function renderCart() {
  cartListEl.innerHTML = "";
  let total = 0;
  cart.forEach((it, idx) => {
    total += Number(it.price || 0) * (it.qty || 1);
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${escapeHtml(it.name)}</strong>
      <div>৳${it.price} × ${it.qty}</div>
      <span class="remove" data-idx="${idx}">✕</span>
    `;
    cartListEl.appendChild(li);
  });
  cartTotalEl.textContent = `৳${total}`;
  // attach remove handlers
  cartListEl.querySelectorAll(".remove").forEach(el => {
    el.addEventListener("click", () => removeFromCart(Number(el.dataset.idx)));
  });
}

/*  Init  */
loadCategories();



