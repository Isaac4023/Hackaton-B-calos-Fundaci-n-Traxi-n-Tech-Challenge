// ===== FORMULARIO PRINCIPAL =====
const form = document.getElementById('formulario_ruta');
const chatMensajes = document.getElementById('chat-mensajes');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const payload = {
        operador: formData.get('operador'),
        experiencia: Number(formData.get('experiencia')),
        licencia: formData.get('licencia'),
        horas_conducidas: Number(formData.get('horas_conducidas')),
        fatiga: formData.get('fatiga'),
        preferencia_manejo: formData.get('preferencia_manejo'),
        carga_peligrosa: formData.get('carga_peligrosa') === 'on',

        vehiculo: formData.get('vehiculo'),
        ejes: Number(formData.get('ejes')),
        carga: formData.get('carga'),
        peso: Number(formData.get('peso')),

        origen: formData.get('origen'),
        salida: formData.get('datetime_salida'),
        manejo_nocturno: formData.get('manejo_nocturno') === 'on',
        prioridad: formData.get('prioridad')
    };

    agregarMensaje('📡 Enviando datos a TraxIA...', 'usuario');

    try {
        const response = await fetch(
            'https://isaac4023.app.n8n.cloud/webhook-test/ruta-traxion',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            throw new Error('Error en la respuesta del webhook');
        }

        const data = await response.json();
        agregarMensaje(data.respuesta || '✅ Ruta procesada correctamente.', 'ia');

    } catch (error) {
        console.error(error);
        agregarMensaje('❌ Error al conectar con TraxIA.', 'ia');
    }
});

// ===== CHAT (solo UI por ahora) =====
const chatForm = document.getElementById('chat_form');
const chatInput = document.getElementById('chat-input');

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const texto = chatInput.value.trim();
    if (!texto) return;

    agregarMensaje(texto, 'usuario');
    agregarMensaje('🤖 TraxIA está analizando tu pregunta...', 'ia');

    chatInput.value = '';
});

// ===== FUNCIÓN PARA MENSAJES =====
function agregarMensaje(texto, tipo) {
    const div = document.createElement('div');
    div.className = tipo === 'ia' ? 'mensaje-ia' : 'mensaje-usuario';
    div.textContent = texto;

    chatMensajes.appendChild(div);
    chatMensajes.scrollTop = chatMensajes.scrollHeight;
}
