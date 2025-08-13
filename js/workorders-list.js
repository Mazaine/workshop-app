// js/workorders-list.js
import { firestore } from './firebase.js';
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

async function loadWorkOrders() {
  const container = document.getElementById('workorders-container');
  if (!container) return;

  try {
    // Dátum szerinti rendezés (createdAt)
    const q = query(collection(firestore, 'workOrders'), orderBy('createdAt'));
    const querySnapshot = await getDocs(q);

    container.innerHTML = '';

    querySnapshot.forEach((docSnap) => {
      const o = docSnap.data();
      const id = docSnap.id;

      const card = document.createElement('div');
      card.className = 'bg-white rounded-lg shadow-md overflow-hidden';
      card.dataset.id = id;

      // Dátum forrása: ha van külön date mező, azt használjuk, különben createdAt
      const dateSrc = o?.date ?? o?.createdAt;
      const formattedDate = dateSrc?.seconds
        ? new Date(dateSrc.seconds * 1000).toLocaleDateString('hu-HU')
        : 'Nincs dátum';

      let partsHtml = '';
      if (Array.isArray(o.partsUsed) && o.partsUsed.length) {
        partsHtml = '<div class="mt-2"><p class="font-semibold">Felhasznált alkatrészek:</p><ul class="list-disc list-inside">';
        o.partsUsed.forEach((p) => {
          const qty = Number(p.quantity) || 0;
          const price = Number(p.price) || 0;
          partsHtml += `<li>${qty} db (${price} Ft/db) = ${qty * price} Ft</li>`;
        });
        partsHtml += '</ul></div>';
      }

      card.innerHTML = `
        <div class="p-4">
          <h3 class="text-xl font-bold mb-2">${o.device || 'Ismeretlen eszköz'}</h3>
          <p class="text-gray-600 mb-1"><span class="font-semibold">Ügyfél:</span> ${o.customerName || ''}</p>
          <p class="text-gray-600 mb-1"><span class="font-semibold">Elérhetőség:</span> ${o.contact || ''}</p>
          <p class="text-gray-600 mb-1"><span class="font-semibold">Dátum:</span> ${formattedDate}</p>
          <p class="text-gray-600 mb-2"><span class="font-semibold">Hiba:</span> ${o.issueDescription || ''}</p>
          ${partsHtml}
          <div class="mt-4 border-t pt-2">
            <p class="text-gray-600"><span class="font-semibold">Alkatrészek összesen:</span> ${o.totalPartsCost || 0} Ft</p>
            <p class="text-gray-600"><span class="font-semibold">Munkadíj:</span> ${o.laborCost || 0} Ft</p>
            <p class="text-gray-600"><span class="font-semibold">Szervízdíj:</span> ${o.serviceFee || 0} Ft</p>
            <p class="text-lg font-bold text-blue-600 mt-1"><span class="font-semibold">Összesen:</span> ${o.total || 0} Ft</p>
          </div>
          ${o.notes ? `<p class="mt-2 text-gray-600"><span class="font-semibold">Megjegyzés:</span> ${o.notes}</p>` : ''}
          <div class="mt-4 flex gap-2">
            <button data-id="${id}" class="delete-btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Törlés</button>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error('Hiba a munkalapok betöltésekor:', error);
    container.innerHTML = '<p class="text-red-600">Hiba történt az adatok betöltésekor.</p>';
  }
}

// Delegált eseménykezelő – csak egyszer kötjük fel, így nem duplikálódik
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('workorders-container');
  if (!container) return;

  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('.delete-btn');
    if (!btn) return;

    const id = btn.getAttribute('data-id');
    if (!id) return;

    if (!confirm('Biztosan törlöd ezt a munkalapot?')) return;

    try {
      await deleteDoc(doc(firestore, 'workOrders', id));
      // Optimista UI: azonnal eltüntetjük a kártyát
      btn.closest('.bg-white.rounded-lg.shadow-md')?.remove();
    } catch (err) {
      console.error('Törlés hiba:', err);
      alert('Nem sikerült törölni. Próbáld újra.');
    }
  });

  loadWorkOrders();
});