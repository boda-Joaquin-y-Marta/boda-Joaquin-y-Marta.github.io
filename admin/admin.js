import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCFxn1ZUhd6HIF2Wj-dt6ohV2ZRH_EK4Uo",
    authDomain: "our13wedding.firebaseapp.com",
    projectId: "our13wedding",
    storageBucket: "our13wedding.firebasestorage.app",
    messagingSenderId: "365371427127",
    appId: "1:365371427127:web:0efb39f2e5f05d0eefb2b2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let dataLocal = [];
let seleccionados = new Set();

const guestsBody = document.getElementById("guests-body");
const btnDeleteSelected = document.getElementById("btn-delete-selected");
const selectedCountLabel = document.getElementById("selected-count");
const checkAll = document.getElementById("check-all");

// --- Selección Masiva ---
function actualizarInterfazSeleccion() {
    const count = seleccionados.size;
    selectedCountLabel.innerText = count;
    btnDeleteSelected.style.display = count > 0 ? "block" : "none";
}

checkAll.addEventListener("change", (e) => {
    const checkboxes = guestsBody.querySelectorAll(".row-check");
    seleccionados.clear();
    checkboxes.forEach(cb => {
        cb.checked = e.target.checked;
        if (e.target.checked) seleccionados.add(cb.dataset.id);
    });
    renderizarTodo(); 
    actualizarInterfazSeleccion();
});

btnDeleteSelected.addEventListener("click", async () => {
    if (!confirm(`¿Eliminar ${seleccionados.size} invitados?`)) return;
    for (let id of seleccionados) await deleteDoc(doc(db, "invitados", id));
    seleccionados.clear();
    actualizarInterfazSeleccion();
});

// --- Auth ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("admin-login").classList.add("hidden");
        document.getElementById("admin-content").classList.remove("hidden");
        escucharDatos();
    } else {
        document.getElementById("admin-login").classList.remove("hidden");
        document.getElementById("admin-content").classList.add("hidden");
    }
});

// function escucharDatos() {
//     onSnapshot(collection(db, "invitados"), (snapshot) => {
//         dataLocal = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
//         renderizarTodo();
//     });
// }
function escucharDatos() {
    onSnapshot(collection(db, "invitados"), (snapshot) => {
        console.log("Documentos en Firebase:", snapshot.size); // Esto dirá cuántos hay en la DB
        dataLocal = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        console.log("IDs cargados:", dataLocal.map(i => i.id)); // Esto listará todos los IDs en la consola
        renderizarTodo();
    });
}

function renderizarTodo() {
    const term = document.getElementById("search-input").value.toLowerCase();
    const asist = document.getElementById("filter-asistencia").value;
    const bus = document.getElementById("filter-bus").value;
    const ord = document.getElementById("filter-orden").value;

    let filtrados = dataLocal.filter(inv => {
        const matchSearch = inv.name?.toLowerCase().includes(term) || inv.nickName?.toLowerCase().includes(term);
        const matchAsist = asist === 'todos' || 
            (asist === 'si' && inv.confirmed && inv.asiste) ||
            (asist === 'no' && inv.confirmed && !inv.asiste) ||
            (asist === 'pendiente' && !inv.confirmed);
        const matchBus = bus === 'todos' || inv.transporte === (bus === 'si');
        return matchSearch && matchAsist && matchBus;
    });

    filtrados.sort((a, b) => {
        const valA = (a.name || "").toLowerCase();
        const valB = (b.name || "").toLowerCase();
        return ord === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    guestsBody.innerHTML = "";
    filtrados.forEach(inv => {
        const isSelected = seleccionados.has(inv.id);
        const tr = document.createElement("tr");
        if (isSelected) tr.classList.add("selected");

        tr.innerHTML = `
            <td class="col-check"><input type="checkbox" class="row-check" data-id="${inv.id}" ${isSelected ? 'checked' : ''}></td>
            <td contenteditable="true" data-field="name" class="editable"><strong>${inv.name || ''}</strong></td>
            <td>
                <select class="sel-asiste">
                    <option value="p" ${!inv.confirmed ? 'selected' : ''}>Pendiente</option>
                    <option value="s" ${inv.confirmed && inv.asiste ? 'selected' : ''}>SÍ</option>
                    <option value="n" ${inv.confirmed && !inv.asiste ? 'selected' : ''}>NO</option>
                </select>
            </td>
            <td contenteditable="true" data-field="telefono" class="editable">${inv.telefono || ''}</td>
            <td contenteditable="true" data-field="alergias" class="editable">${inv.alergias || ''}</td>
            <td contenteditable="true" data-field="menu" class="editable">${inv.menu || ''}</td>
            <td style="text-align:center"><input type="checkbox" class="chk-bus" ${inv.transporte ? 'checked' : ''}></td>
            <td style="text-align:center"><input type="checkbox" class="chk-ninos" ${inv.ninos ? 'checked' : ''}></td>
            <td>
                <div style="display:flex; gap:5px;">
                    <button class="btn-save" title="Guardar">💾</button>
                    <button class="btn-delete-single" title="Eliminar" style="background:red; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;">🗑️</button>
                </div>
            </td>
        `;

        // Eventos de botones
        tr.querySelector(".row-check").addEventListener("change", (e) => {
            if (e.target.checked) seleccionados.add(inv.id);
            else seleccionados.delete(inv.id);
            renderizarTodo();
            actualizarInterfazSeleccion();
        });

        tr.querySelector(".btn-save").addEventListener("click", async () => {
            const asVal = tr.querySelector(".sel-asiste").value;
            const upd = {
                name: tr.querySelector('[data-field="name"]').innerText.trim(),
                telefono: tr.querySelector('[data-field="telefono"]').innerText.trim(),
                alergias: tr.querySelector('[data-field="alergias"]').innerText.trim(),
                menu: tr.querySelector('[data-field="menu"]').innerText.trim(),
                transporte: tr.querySelector(".chk-bus").checked,
                ninos: tr.querySelector(".chk-ninos").checked,
                confirmed: asVal !== 'p',
                asiste: asVal === 's'
            };
            await updateDoc(doc(db, "invitados", inv.id), upd);
        });

        tr.querySelector(".btn-delete-single").addEventListener("click", async () => {
            if (confirm("¿Eliminar invitado?")) await deleteDoc(doc(db, "invitados", inv.id));
        });

        guestsBody.appendChild(tr);
    });

    // --- ACTUALIZACIÓN DE CONTADORES ---
    document.getElementById('count-total').innerText = dataLocal.length;
    document.getElementById('count-si').innerText = dataLocal.filter(i => i.confirmed && i.asiste).length;
    document.getElementById('count-no').innerText = dataLocal.filter(i => i.confirmed && !i.asiste).length;
    document.getElementById('count-pend').innerText = dataLocal.filter(i => !i.confirmed).length;
    document.getElementById('count-bus').innerText = dataLocal.filter(i => i.transporte).length;
}

["search-input", "filter-asistencia", "filter-bus", "filter-orden"].forEach(id => {
    document.getElementById(id).addEventListener("input", renderizarTodo);
});

// Modal Añadir
document.getElementById("btn-open-modal").addEventListener("click", () => document.getElementById("modal-invitado").classList.remove("hidden"));
document.getElementById("btn-cancelar").addEventListener("click", () => document.getElementById("modal-invitado").classList.add("hidden"));
document.getElementById("btn-guardar-nuevo").addEventListener("click", async () => {
    const id = document.getElementById("new-id").value.trim();
    const nick = document.getElementById("new-nickname").value.trim();
    if (id && nick) {
        await setDoc(doc(db, "invitados", id), { nickName: nick, name: nick, confirmed: false, asiste: false, transporte: false, ninos: false });
        document.getElementById("modal-invitado").classList.add("hidden");
    }
});