import { firestore } from './firebase.js';
import { collection, getDocs, query, orderBy, doc, updateDoc } 
  from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

async function loadWorkOrders() {
  const container = document.getElementById('workorders-container');
  if (!container) return;

  try {
    let q;
    try {
      q = query(collection(firestore, 'workOrders'), orderBy('createdAt'));
    } catch {
      q = query(collection(firestore, 'workOrders'));
    }

    const querySnapshot = await getDocs(q);
    container.innerHTML = '';

    querySnapshot.forEach(docSnap => {
      const o = docSnap.data();

      if (o.deleted) return; // ha soft delete, nem mutatjuk

      const card = document.createElement('div');
      card.className = 'bg-white rounded-lg shadow-md overflow-hidden mb-4';

      let formattedDate = 'Nincs dátum';
      if (o.date) {
        if (o.date.seconds !== undefined) {
          formattedDate = o.date.toDate().toLocaleDateString('hu-HU');
        } else {
          formattedDate = new Date(o.date).toLocaleDateString('hu-HU');
        }
      }

     let partsHtml = '';
if (o.usedParts && o.usedParts.length) {
  partsHtml = '<div class="mt-2"><p class="font-semibold">Felhasznált alkatrészek:</p><ul class="list-disc list-inside">';
  o.usedParts.forEach(p => {
    partsHtml += `<li>${p.partName || 'Név hiányzik'} – ${p.kit || 0} db (${p.price || 0} Ft/db) = ${(p.kit || 0) * (p.price || 0)} Ft</li>`;
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
          <button data-id="${docSnap.id}" class="delete-btn mt-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
            Törlés
          </button>
        </div>
      `;

      container.appendChild(card);
    });

    // Soft delete gomb eseménykezelő
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Biztosan törölni szeretnéd ezt a munkalapot?')) {
          const workOrderRef = doc(firestore, 'workOrders', id);
          await updateDoc(workOrderRef, { deleted: true });
          loadWorkOrders();
        }
      });
    });

  } catch (error) {
    console.error('Hiba a munkalapok betöltésekor:', error);
    container.innerHTML = '<p class="text-red-600">Hiba történt az adatok betöltésekor.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadWorkOrders);
