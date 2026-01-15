// ===== VARIABLES GLOBALES =====
const form = document.getElementById('formulario_ruta');
const chatForm = document.getElementById('chat_form');
const chatInput = document.getElementById('chat-input');
const chatMensajes = document.getElementById('chat-mensajes');
const btnAgregar = document.getElementById('agregar_destino');
const destinosContainer = document.getElementById('destinos_container');

// URL DE PRUEBA (IMPORTANTE: Requiere que presiones "Execute" en n8n antes de enviar)
const WEBHOOK_URL = 'https://isaac4023.app.n8n.cloud/webhook-test/ruta-traxion';

// ===== 1. ENVÍO DEL FORMULARIO DE RUTA =====
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    // Procesamos los destinos múltiples en un solo texto claro para la IA
    const destinos = formData.getAll('destino[]'); 
    const tiempos = formData.getAll('tiempo_descarga[]');
    const rutaTexto = destinos.map((d, i) => `Parada ${i+1}: ${d} (${tiempos[i]||0} min)`).join(', ');

    const payload = {
        tipo_mensaje: 'SOLICITUD_RUTA', // Bandera para que la IA sepa qué hacer
        operador: formData.get('operador'),
        experiencia: formData.get('experiencia'),
        licencia: formData.get('licencia'),
        horas_conducidas: formData.get('horas_conducidas'),
        fatiga: formData.get('fatiga'),
        preferencia_manejo: formData.get('preferencia_manejo'),
        carga_peligrosa: formData.get('carga_peligrosa') === 'on',
        vehiculo: formData.get('vehiculo'),
        ejes: formData.get('ejes'),
        carga: formData.get('carga'),
        peso: formData.get('peso'),
        origen: formData.get('origen'),
        ruta_completa: rutaTexto, // Enviamos el string procesado
        salida: formData.get('datetime_salida'),
        manejo_nocturno: formData.get('manejo_nocturno') === 'on',
        prioridad: formData.get('prioridad')
    };

    agregarMensaje('📡 TraxIA: Analizando logística y seguridad de la ruta...', 'usuario');
    enviarAn8n(payload);
});

// ===== 2. CHAT DE DUDAS (AHORA SÍ CONECTADO) =====
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = chatInput.value.trim();
    if (!texto) return;

    agregarMensaje(texto, 'usuario');
    
    // Enviamos la duda a n8n
    const payload = {
        tipo_mensaje: 'CHAT_DUDA', // Bandera diferente
        mensaje_usuario: texto
    };

    enviarAn8n(payload);
    chatInput.value = '';
});

// ===== 3. FUNCIÓN MAESTRA DE CONEXIÓN =====
async function enviarAn8n(payload) {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Error webhook');

        const data = await response.json();
        
        // Buscamos la respuesta en varias posibles variables
        let respuestaTexto = data.output || data.text || data.respuesta || "✅ Recibido.";
        
        // Convertimos saltos de línea (\n) en HTML (<br>)
        respuestaTexto = respuestaTexto.replace(/\n/g, "<br>");

        agregarMensaje(respuestaTexto, 'ia');

    } catch (error) {
        console.error(error);
        agregarMensaje('❌ Error: Asegúrate de dar click en "Execute Workflow" en n8n antes de enviar.', 'ia');
    }
}

// ===== 4. UI: AGREGAR DESTINOS =====
btnAgregar.addEventListener('click', () => {
    const div = document.createElement('div');
    div.classList.add('destino_item');
    div.innerHTML = `
        <label>Destino Adicional</label>
        <input type="text" name="destino[]" placeholder="Dirección o ciudad" required>
        <label>Tiempo descarga (min)</label>
        <input type="number" name="tiempo_descarga[]" min="0" required>
    `;
    destinosContainer.appendChild(div);
});

// ===== UI: RENDERIZAR MENSAJES =====
function agregarMensaje(html, tipo) {
    const div = document.createElement('div');
    div.className = tipo === 'ia' ? 'mensaje-ia' : 'mensaje-usuario';
    div.innerHTML = html; // Usamos innerHTML para permitir negritas y colores
    chatMensajes.appendChild(div);
    chatMensajes.scrollTop = chatMensajes.scrollHeight;
}