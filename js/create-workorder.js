import { firestore } from './firebase.js';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Globális tárolók
const partsMap = new Map();      // id -> {id, name, price, quantity, tipus, ...}
const selectedParts = new Map(); // id -> {id, name, price, quantity}

// Alkatrészek betöltése
async function loadParts() {
  try {
    const partsCol = collection(firestore, 'parts');
    const snap = await getDocs(partsCol);
    partsMap.clear();
    snap.forEach(d => partsMap.set(d.id, { id: d.id, ...d.data() }));
    populatePartSelect();
  } catch (err) {
    console.error('Hiba az alkatrészek betöltésekor:', err);
  }
}

function populatePartSelect() {
  const select = document.getElementById('part-select');
  if (!select) return;
  while (select.options.length > 1) select.remove(1);

  for (const [id, p] of partsMap) {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = `${p.name} (${p.price || 0} Ft) - ${p.quantity ?? 0} db`;
    select.appendChild(opt);
  }
}

// Kiválasztott alkatrészek megjelenítése
function renderSelectedParts() {
  const container = document.getElementById('selected-parts-list');
  container.innerHTML = '';

  if (selectedParts.size === 0) {
    container.innerHTML = '<p class="text-sm text-gray-600">Nincs kiválasztott alkatrész.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'w-full text-sm border-collapse';
  table.innerHTML = `
    <thead>
      <tr class="text-left">
        <th class="pb-2">Alkatrész</th>
        <th class="pb-2">Egységár</th>
        <th class="pb-2">Mennyiség</th>
        <th class="pb-2">Részösszeg</th>
        <th class="pb-2">Törlés</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');

  for (const [id, item] of selectedParts) {
    const tr = document.createElement('tr');
    tr.className = 'border-t';

    const nameTd = document.createElement('td');
    nameTd.className = 'py-2';
    nameTd.textContent = item.name;

    const priceTd = document.createElement('td');
    priceTd.className = 'py-2';
    priceTd.textContent = `${item.price || 0} Ft`;

    const qtyTd = document.createElement('td');
    qtyTd.className = 'py-2';
    qtyTd.innerHTML = `
      <div class="flex items-center space-x-1">
        <button data-action="dec" data-id="${id}" class="px-2 py-1 bg-gray-200 rounded">-</button>
        <input data-id="${id}" class="w-16 text-center p-1 border rounded" value="${item.quantity}" />
        <button data-action="inc" data-id="${id}" class="px-2 py-1 bg-gray-200 rounded">+</button>
      </div>
    `;

    const subtotalTd = document.createElement('td');
    subtotalTd.className = 'py-2';
    subtotalTd.textContent = `${(item.price || 0) * (item.quantity || 0)} Ft`;

    const delTd = document.createElement('td');
    delTd.className = 'py-2';
    delTd.innerHTML = `<button data-action="remove" data-id="${id}" class="px-2 py-1 bg-red-500 text-white rounded">×</button>`;

    tr.appendChild(nameTd);
    tr.appendChild(priceTd);
    tr.appendChild(qtyTd);
    tr.appendChild(subtotalTd);
    tr.appendChild(delTd);

    tbody.appendChild(tr);

    // Események
    const input = qtyTd.querySelector(`input[data-id="${id}"]`);
    input.addEventListener('change', (e) => {
      let v = parseInt(e.target.value) || 1;
      if (v < 1) v = 1;
      const it = selectedParts.get(id);
      it.quantity = v;
      selectedParts.set(id, it);
      renderSelectedParts();
    });

    qtyTd.querySelector(`button[data-action="inc"]`).addEventListener('click', () => {
      const it = selectedParts.get(id);
      it.quantity = (it.quantity || 0) + 1;
      selectedParts.set(id, it);
      renderSelectedParts();
    });
    qtyTd.querySelector(`button[data-action="dec"]`).addEventListener('click', () => {
      const it = selectedParts.get(id);
      it.quantity = Math.max(1, (it.quantity || 1) - 1);
      selectedParts.set(id, it);
      renderSelectedParts();
    });

    delTd.querySelector('button').addEventListener('click', () => {
      selectedParts.delete(id);
      renderSelectedParts();
    });
  }

  container.appendChild(table);
}

// DOM betöltés
document.addEventListener('DOMContentLoaded', () => {
  loadParts();

  // qty +/- gombok
  const qtyInc = document.getElementById('qty-increase');
  const qtyDec = document.getElementById('qty-decrease');
  const qtyInput = document.getElementById('part-quantity');
  qtyInc?.addEventListener('click', () => { qtyInput.value = (parseInt(qtyInput.value) || 1) + 1; });
  qtyDec?.addEventListener('click', () => { qtyInput.value = Math.max(1, (parseInt(qtyInput.value) || 1) - 1); });

  // Hozzáadás gomb
  const addBtn = document.getElementById('add-part-btn');
  addBtn?.addEventListener('click', () => {
    const select = document.getElementById('part-select');
    const qty = Math.max(1, parseInt(document.getElementById('part-quantity').value) || 1);
    if (!select || !select.value) { alert('Kérlek válassz alkatrészt!'); return; }

    const partId = select.value;
    const p = partsMap.get(partId);
    if (!p) { alert('Az alkatrész nem található (frissítsd az oldalt).'); return; }

    if (selectedParts.has(partId)) {
      const existing = selectedParts.get(partId);
      existing.quantity += qty;
      selectedParts.set(partId, existing);
    } else {
      selectedParts.set(partId, { id: partId, name: p.name, price: p.price || 0, quantity: qty });
    }

    select.value = '';
    document.getElementById('part-quantity').value = 1;
    renderSelectedParts();
  });
});

// Űrlap beküldés
const woForm = document.getElementById('workorder-form');
if (woForm) {
  woForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const device = document.getElementById('device').value.trim();
    const customerName = document.getElementById('customer-name').value.trim();
    const simpleCustomerName = document.getElementById('name').value.trim();
    const contactInfo = document.getElementById('contact').value.trim();
    const repairDate = document.getElementById('date').value;
    const errorReason = document.getElementById('issue-description').value.trim();
    const munkadij = parseInt(document.getElementById('labor-cost').value) || 0;
    const szervizdij = parseInt(document.getElementById('service-fee').value) || 0;
    const comment = document.getElementById('notes').value.trim();
    const performedWorks = [];
    document.querySelectorAll('#performed-works .work-checkbox:checked').forEach(cb => performedWorks.push(cb.value));

    if (selectedParts.size === 0 && !confirm('Nincs kiválasztott alkatrész. Folytatod munkalap mentését?')) return;

    let totalPartsCost = 0;
    const usedParts = Array.from(selectedParts, ([id, item]) => {
      const p = partsMap.get(id);
      totalPartsCost += (item.quantity || 0) * (item.price || 0);
      return {
        partName: item.name,
        kit: item.quantity,
        price: item.price,
        tipus: p?.tipus || ''
      };
    });

    try {
      // Készlet frissítése
      for (const [id, item] of selectedParts) {
        const p = partsMap.get(id);
        const partDocRef = doc(firestore, 'parts', id);
        await updateDoc(partDocRef, { quantity: Math.max(0, (p.quantity || 0) - (item.quantity || 0)) });
      }

      // Munkalap mentése
      const workOrdersCol = collection(firestore, 'worksheets');
      await addDoc(workOrdersCol, {
        deviceToRepair: device,
        customerName,
        simpleCustomerName,
        contactInfo,
        repairDate,
        errorReason,
        munkadij,
        szervizdij,
        comment,
        performedWorks,
        usedParts,
        totalPartsCost,
        total: totalPartsCost + munkadij + szervizdij,
        createdAt: serverTimestamp(),
        status: 'Új'
      });

      alert('Munkalap sikeresen létrehozva!');
      woForm.reset();
      selectedParts.clear();
      renderSelectedParts();
      await loadParts();

    } catch (err) {
      console.error('Hiba mentéskor:', err);
      alert('Hiba történt a munkalap mentésekor!');
    }
  });
}
