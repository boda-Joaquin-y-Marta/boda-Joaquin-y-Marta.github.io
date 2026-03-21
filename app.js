import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCFxn1ZUhd6HIF2Wj-dt6ohV2ZRH_EK4Uo",
  authDomain: "our13wedding.firebaseapp.com",
  projectId: "our13wedding",
  storageBucket: "our13wedding.firebasestorage.app",
  messagingSenderId: "365371427127",
  appId: "1:365371427127:web:0efb39f2e5f05d0eefb2b2",
  measurementId: "G-TXRVCYNGQQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentGuestId = null;

// --- CUENTA ATRÁS ---
const countdownElement = document.getElementById('countdown');
const weddingDate = new Date('June 13, 2026 12:00:00').getTime(); // Lo he ajustado a las 12:00 que es tu ceremonia

setInterval(() => {
    const now = new Date().getTime();
    const distance = weddingDate - now;
    if (distance < 0) {
        countdownElement.innerHTML = "¡Es hoy!";
        return;
    }
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m`;
}, 1000);

// --- ACCESO ---
const showInvitation = (nombre) => {
    document.getElementById('welcome-message').innerText = `BIENVENIDO/A, ${nombre}`;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    window.scrollTo(0, 0); 
};

window.addEventListener('load', async () => {
    const savedCode = sessionStorage.getItem('guestCode');
    if (savedCode) {
        const docRef = doc(db, "invitados", savedCode);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            currentGuestId = savedCode;
            showInvitation(docSnap.data().name); 
        }
    }
});

const btnLogin = document.getElementById('btn-login');
btnLogin.addEventListener('click', async () => {
    const code = document.getElementById('guest-code-input').value.trim(); 
    if (!code) return;

    btnLogin.innerText = "Abriendo...";
    btnLogin.disabled = true;
    document.getElementById('login-error').style.display = 'none';

    try {
        const docRef = doc(db, "invitados", code);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            currentGuestId = code;
            sessionStorage.setItem('guestCode', code);
            showInvitation(docSnap.data().name); 
        } else {
            document.getElementById('login-error').style.display = 'block';
            btnLogin.innerText = "Acceder";
            btnLogin.disabled = false;
        }
    } catch (e) {
        console.error(e);
        alert("Error de conexión. Inténtalo de nuevo.");
        btnLogin.disabled = false;
        btnLogin.innerText = "Acceder";
    }
});

// --- CONFIRMACIÓN (RSVP) ---

// 1. Manejo del "NO asisto"
document.getElementById('rsvp-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmitMain = document.getElementById('btn-submit-main');
    
    btnSubmitMain.disabled = true;
    btnSubmitMain.innerText = "Enviando...";

    try {
        const guestRef = doc(db, "invitados", currentGuestId);
        
        // Solo actualizamos lo necesario si no vienen
        await updateDoc(guestRef, {
            confirmed: true,
            asiste: false
        });
        
        const formMsg = document.getElementById('form-message-main');
        formMsg.innerText = "Lamentamos que no puedas venir. ¡Gracias por avisar!";
        formMsg.style.color = "var(--burgundy)";
        btnSubmitMain.style.display = "none";
    } catch (e) {
        alert("Hubo un error al guardar. Por favor, avísanos por teléfono.");
        btnSubmitMain.disabled = false;
        btnSubmitMain.innerText = "Confirmar que no asistes";
    }
});

// 2. Manejo del "SÍ asisto" (Ajustado EXACTAMENTE a tu Firebase)
document.getElementById('rsvp-sheet-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmitSheet = document.getElementById('btn-submit-sheet');
    
    // 1. Recogida de textos básicos
    const nombreCompleto = document.getElementById('nombre-apellidos')?.value || "";
    const telefono = document.getElementById('telefono')?.value || "";
    let otrosDatos = document.getElementById('otros_datos')?.value || "";
    
    // 2. Booleanos y campos condicionales
    const tieneAlergias = document.querySelector('input[name="alergias_radio"]:checked')?.value === "Si";
    const alergiasDesc = tieneAlergias ? (document.getElementById('alergias_desc')?.value || "") : "";

    const necesitaMenu = document.querySelector('input[name="menu_radio"]:checked')?.value === "Si";
    const menuDesc = necesitaMenu ? (document.getElementById('menu_desc')?.value || "") : "";

    const vieneConNinos = document.querySelector('input[name="ninos_radio"]:checked')?.value === "Si";
    const ninosDatosText = vieneConNinos ? (document.getElementById('ninos_datos')?.value || "Sin especificar") : "";
    
    const necesitaTrona = vieneConNinos && (document.querySelector('input[name="trona_radio"]:checked')?.value === "Si");

    const usaTransporte = document.querySelector('input[name="transporte_radio"]:checked')?.value === "Si";

    // Unimos los datos de los niños al campo "otros" para no perderlos
    if (vieneConNinos && ninosDatosText !== "") {
        otrosDatos = `Datos niños: ${ninosDatosText}. ` + otrosDatos;
    }

    btnSubmitSheet.disabled = true;
    btnSubmitSheet.innerText = "Guardando...";

    try {
        const guestRef = doc(db, "invitados", currentGuestId);
        
        // Enviamos los datos mapeados EXACTAMENTE a las keys de tu BD
        await updateDoc(guestRef, {
            confirmed: true,
            asiste: true,
            name: nombreCompleto,      // Usamos 'name' para el input completo
            telefono: telefono,
            alergias: alergiasDesc,    // String (vacío si es no)
            menuEspecial: necesitaMenu,// Booleano
            menu: menuDesc,            // String con el tipo de menú
            ninos: vieneConNinos,      // Booleano
            trona: necesitaTrona,      // Booleano
            transporte: usaTransporte, // Booleano
            otros: otrosDatos          // String
            
            // Nota: No tocamos "familia", "categoriaCivil" ni "apeliidos" 
            // para que se mantenga lo que tú configures manualmente.
        });
        
        btnSubmitSheet.innerText = "✓ Enviado con éxito";
        btnSubmitSheet.style.backgroundColor = "#4CAF50"; 
        
        setTimeout(() => {
            document.getElementById('rsvp-modal').classList.remove('active');
            document.getElementById('form-message-main').innerText = "¡Qué ilusión! Hemos guardado tu confirmación.";
        }, 1500);

    } catch (error) {
        console.error("Error al guardar en Firebase:", error);
        alert("Hubo un error al guardar. Por favor, avísanos por teléfono.");
        btnSubmitSheet.disabled = false;
        btnSubmitSheet.innerText = "Confirmar Asistencia";
    }
});