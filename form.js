// --- CONFIRMACIÓN (RSVP) ---
const asistenciaSelect = document.getElementById("asistencia");
const extraFields = document.getElementById("extra-fields");

asistenciaSelect.addEventListener("change", (e) => {
  // Solo muestra los campos extra si dice que SÍ asiste
  extraFields.style.display = e.target.value === "si" ? "block" : "none";
});

document.getElementById("rsvp-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btnSubmit = e.target.querySelector("button");
  const asiste = asistenciaSelect.value;
  const telefono = document.getElementById("telefono").value;
  const menu = document.getElementById("menu").value;

  if (!asiste) {
    alert("Por favor, indícanos si asistirás.");
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.innerText = "Enviando...";

  try {
    const guestRef = doc(db, "invitados", currentGuestId);
    await updateDoc(guestRef, {
      confirmed: true,
      asiste: asiste === "si",
      telefono: asiste === "si" ? telefono : "",
      menu: asiste === "si" ? menu : "No asiste",
    });
    const formMsg = document.getElementById("form-message");
    formMsg.innerText = "¡Confirmación guardada con éxito!";
    formMsg.style.color = "var(--burgundy)";
    btnSubmit.innerText = "✓ Enviado";
  } catch (e) {
    alert("Hubo un error al guardar. Por favor, avísanos por teléfono.");
    btnSubmit.disabled = false;
    btnSubmit.innerText = "Confirmar";
  }
});


<div id="map-modal" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="modal-title">Ubicación</h3>
              <button id="close-modal" class="btn-close-modal">×</button>
            </div>
            <div class="modal-body">
              <iframe
                id="map-iframe"
                src=""
                width="100%"
                height="450"
                style="border: 0"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>