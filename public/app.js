const orderForm = document.getElementById("orderForm");
const createResult = document.getElementById("createResult");
const ordersOutput = document.getElementById("ordersOutput");
const dashboardCards = document.getElementById("dashboardCards");
const loadOrdersButton = document.getElementById("loadOrders");
const clearFiltersButton = document.getElementById("clearFilters");
const statusFilter = document.getElementById("statusFilter");
const searchFilter = document.getElementById("searchFilter");
const sortFilter = document.getElementById("sortFilter");
const activeFilters = document.getElementById("activeFilters");
const quickStatuses = document.getElementById("quickStatuses");
const statusBreakdown = document.getElementById("statusBreakdown");
const itemsContainer = document.getElementById("itemsContainer");
const addItemBtn = document.getElementById("addItemBtn");
const billAmount = document.getElementById("billAmount");
const ordersMeta = document.getElementById("ordersMeta");

const statuses = ["RECEIVED", "PROCESSING", "READY", "DELIVERED"];
const garmentPrices = {
  Shirt: 50,
  Pants: 70,
  Saree: 120,
  TShirt: 40,
  Jacket: 150
};

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = Array.isArray(data.errors) ? ` (${data.errors.join(" | ")})` : "";
    throw new Error(`${data.message || "Request failed"}${details}`);
  }

  return data;
}

function getGarmentOptions(selectedType = "Shirt") {
  return Object.keys(garmentPrices)
    .map((garment) => `<option value="${garment}"${selectedType === garment ? " selected" : ""}>${garment}</option>`)
    .join("");
}

function createItemRow(defaultType = "Shirt", defaultQty = 1) {
  const row = document.createElement("div");
  row.className = "item-row";
  row.innerHTML = `
    <select class="garmentType" required>
      ${getGarmentOptions(defaultType)}
    </select>
    <input class="itemQuantity" type="number" min="1" value="${defaultQty}" required />
    <button type="button" class="danger removeItemBtn">Remove</button>
  `;

  const removeBtn = row.querySelector(".removeItemBtn");
  removeBtn.addEventListener("click", () => {
    if (itemsContainer.children.length === 1) {
      row.querySelector(".itemQuantity").value = 1;
      row.querySelector(".garmentType").value = "Shirt";
    } else {
      row.remove();
    }
    updateLiveBill();
  });

  row.querySelector(".garmentType").addEventListener("change", updateLiveBill);
  row.querySelector(".itemQuantity").addEventListener("input", updateLiveBill);

  return row;
}

function getItemsPayload() {
  const rows = [...itemsContainer.querySelectorAll(".item-row")];
  return rows.map((row) => ({
    garmentType: row.querySelector(".garmentType").value,
    quantity: Number(row.querySelector(".itemQuantity").value)
  }));
}

function updateLiveBill() {
  const items = getItemsPayload();
  const total = items.reduce((sum, item) => {
    const price = garmentPrices[item.garmentType] || 0;
    const quantity = Number.isFinite(item.quantity) ? item.quantity : 0;
    return sum + price * Math.max(quantity, 0);
  }, 0);

  billAmount.textContent = moneyFormatter.format(total);
}

function renderConfirmation(order) {
  const items = order.items.map((item) => `<li>${item.garmentType} x${item.quantity} - ${moneyFormatter.format(item.lineTotal)}</li>`).join("");

  createResult.innerHTML = `
    <h4>Order Confirmed</h4>
    <p><strong>Order ID:</strong> ${order.orderId}</p>
    <p><strong>Customer:</strong> ${order.customerName} (${order.phoneNumber})</p>
    <p><strong>Status:</strong> ${order.status}</p>
    <p><strong>Estimated Delivery:</strong> ${order.estimatedDeliveryDate}</p>
    <p><strong>Total Bill:</strong> ${moneyFormatter.format(order.totalAmount)}</p>
    <p><strong>Items:</strong></p>
    <ul class="confirmation-list">${items}</ul>
  `;
}

function resetCreateForm() {
  orderForm.reset();
  itemsContainer.innerHTML = "";
  itemsContainer.appendChild(createItemRow("Shirt", 1));
  updateLiveBill();
}

function getStatusClass(status) {
  const map = {
    RECEIVED: "status-received",
    PROCESSING: "status-processing",
    READY: "status-ready",
    DELIVERED: "status-delivered"
  };

  return map[status] || "status-received";
}

function renderOrderCard(order) {
  const wrapper = document.createElement("article");
  wrapper.className = "order-card";

  const top = document.createElement("div");
  top.className = "order-card-top";

  const orderId = document.createElement("p");
  orderId.className = "order-id";
  orderId.textContent = order.orderId;

  const statusBadge = document.createElement("span");
  statusBadge.className = `status-badge ${getStatusClass(order.status)}`;
  statusBadge.textContent = order.status;

  top.appendChild(orderId);
  top.appendChild(statusBadge);

  const customer = document.createElement("p");
  customer.className = "order-customer";
  customer.textContent = `${order.customerName} • ${order.phoneNumber}`;

  const items = document.createElement("ul");
  items.className = "order-items";
  order.items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.garmentType} x${item.quantity} — ${moneyFormatter.format(item.lineTotal)}`;
    items.appendChild(li);
  });

  const meta = document.createElement("div");
  meta.className = "order-meta";

  const total = document.createElement("p");
  total.textContent = `Total: ${moneyFormatter.format(order.totalAmount)}`;

  const eta = document.createElement("p");
  eta.textContent = `ETA: ${order.estimatedDeliveryDate}`;

  meta.appendChild(total);
  meta.appendChild(eta);

  const actions = document.createElement("div");
  actions.className = "order-actions";

  const select = document.createElement("select");
  statuses.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    if (order.status === status) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  const button = document.createElement("button");
  button.textContent = "Update Status";
  button.addEventListener("click", () => updateStatus(order.orderId, select.value));

  actions.appendChild(select);
  actions.appendChild(button);

  wrapper.appendChild(top);
  wrapper.appendChild(customer);
  wrapper.appendChild(items);
  wrapper.appendChild(meta);
  wrapper.appendChild(actions);

  return wrapper;
}

function sortOrders(orders) {
  const sortBy = sortFilter.value;
  const sorted = [...orders];

  if (sortBy === "oldest") {
    sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortBy === "amountHigh") {
    sorted.sort((a, b) => b.totalAmount - a.totalAmount);
  } else if (sortBy === "amountLow") {
    sorted.sort((a, b) => a.totalAmount - b.totalAmount);
  } else {
    sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return sorted;
}

function renderActiveFilters() {
  const chips = [];

  if (statusFilter.value) {
    chips.push(`Status: ${statusFilter.value}`);
  }

  if (searchFilter.value.trim()) {
    chips.push(`Search: ${searchFilter.value.trim()}`);
  }

  if (sortFilter.value !== "newest") {
    const map = {
      oldest: "Oldest First",
      amountHigh: "Amount High to Low",
      amountLow: "Amount Low to High"
    };
    chips.push(`Sort: ${map[sortFilter.value]}`);
  }

  activeFilters.textContent = chips.length > 0 ? chips.join(" | ") : "No active filters";
}

function updateQuickStatusButtons() {
  const buttons = [...quickStatuses.querySelectorAll(".quick-status")];
  buttons.forEach((button) => {
    const isActive = statusFilter.value === button.dataset.status;
    button.classList.toggle("active", isActive);
  });
}

orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    customerName: document.getElementById("customerName").value,
    phoneNumber: document.getElementById("phoneNumber").value,
    items: getItemsPayload()
  };

  try {
    const result = await api("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    renderConfirmation(result.order);
    resetCreateForm();
    await Promise.all([loadOrders(), loadDashboard()]);
  } catch (error) {
    createResult.innerHTML = `<p><strong>Could not create order:</strong> ${error.message}</p>`;
  }
});

addItemBtn.addEventListener("click", () => {
  itemsContainer.appendChild(createItemRow("Shirt", 1));
  updateLiveBill();
});

async function updateStatus(orderId, status) {
  try {
    await api(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });

    await Promise.all([loadOrders(), loadDashboard()]);
  } catch (error) {
    alert(error.message);
  }
}

async function loadOrders() {
  const query = new URLSearchParams();
  if (statusFilter.value) {
    query.set("status", statusFilter.value);
  }
  if (searchFilter.value.trim()) {
    query.set("search", searchFilter.value.trim());
  }

  const url = query.toString() ? `/api/orders?${query.toString()}` : "/api/orders";
  const result = await api(url);
  const sortedOrders = sortOrders(result.orders);

  ordersOutput.innerHTML = "";
  ordersMeta.textContent = `${sortedOrders.length} shown`;
  renderActiveFilters();
  updateQuickStatusButtons();

  if (sortedOrders.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "No orders match the selected filters.";
    ordersOutput.appendChild(emptyState);
    return;
  }

  const fragment = document.createDocumentFragment();
  sortedOrders.forEach((order) => {
    fragment.appendChild(renderOrderCard(order));
  });

  ordersOutput.appendChild(fragment);
}

async function loadDashboard() {
  const result = await api("/api/dashboard");
  dashboardCards.innerHTML = "";
  statusBreakdown.innerHTML = "";

  const averageOrderValue = result.totalOrders > 0 ? result.totalRevenue / result.totalOrders : 0;
  const delivered = result.ordersPerStatus.DELIVERED || 0;
  const completionRate = result.totalOrders > 0 ? Math.round((delivered / result.totalOrders) * 100) : 0;

  const cards = [
    { label: "Total Orders", value: result.totalOrders },
    { label: "Total Revenue", value: moneyFormatter.format(result.totalRevenue) },
    { label: "Avg Order Value", value: moneyFormatter.format(averageOrderValue) },
    { label: "Delivered Rate", value: `${completionRate}%` }
  ];

  cards.forEach((card) => {
    const wrapper = document.createElement("div");
    wrapper.className = "stat-card";

    const label = document.createElement("p");
    label.className = "stat-label";
    label.textContent = card.label;

    const value = document.createElement("pre");
    value.className = "stat-value";
    value.textContent = String(card.value);

    wrapper.appendChild(label);
    wrapper.appendChild(value);
    dashboardCards.appendChild(wrapper);
  });

  const maxCount = Math.max(...Object.values(result.ordersPerStatus), 1);

  Object.entries(result.ordersPerStatus).forEach(([status, count]) => {
    const row = document.createElement("div");
    row.className = "status-row";

    const name = document.createElement("span");
    name.className = "status-name";
    name.textContent = status;

    const track = document.createElement("div");
    track.className = "status-track";

    const fill = document.createElement("div");
    fill.className = "status-fill";
    fill.style.width = `${Math.max((count / maxCount) * 100, count > 0 ? 8 : 0)}%`;

    const number = document.createElement("span");
    number.className = "status-count";
    number.textContent = String(count);

    track.appendChild(fill);
    row.appendChild(name);
    row.appendChild(track);
    row.appendChild(number);
    statusBreakdown.appendChild(row);
  });
}

loadOrdersButton.addEventListener("click", async () => {
  try {
    await loadOrders();
  } catch (error) {
    ordersOutput.textContent = error.message;
  }
});

clearFiltersButton.addEventListener("click", async () => {
  statusFilter.value = "";
  searchFilter.value = "";
  sortFilter.value = "newest";

  try {
    await loadOrders();
  } catch (error) {
    ordersOutput.textContent = error.message;
  }
});

statusFilter.addEventListener("change", () => {
  loadOrders().catch((error) => {
    ordersOutput.textContent = error.message;
  });
});

sortFilter.addEventListener("change", () => {
  loadOrders().catch((error) => {
    ordersOutput.textContent = error.message;
  });
});

searchFilter.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    loadOrders().catch((error) => {
      ordersOutput.textContent = error.message;
    });
  }
});

[...quickStatuses.querySelectorAll(".quick-status")].forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.status;
    statusFilter.value = statusFilter.value === selected ? "" : selected;

    loadOrders().catch((error) => {
      ordersOutput.textContent = error.message;
    });
  });
});

(async function bootstrap() {
  resetCreateForm();

  try {
    await Promise.all([loadOrders(), loadDashboard()]);
  } catch (error) {
    dashboardCards.textContent = error.message;
  }
})();
