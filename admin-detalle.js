// Lógica para admin-detalle-empresa.html
let empresaActual = "Transportes Rápido Andino";

function inicializarPanel() {
// 1. Capturamos el parámetro 'empresa' de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const empParam = urlParams.get('empresa');
    if (empParam) {
        empresaActual = decodeURIComponent(empParam);
    }

    // 2. Buscamos los datos de esta empresa en el localStorage
    let empresas = JSON.parse(localStorage.getItem('empresasTransporte')) || [];
    let empresaEncontrada = empresas.find(e => e.nombre === empresaActual);

    // 3. Pintamos los datos reales en la interfaz si existen
    if (empresaEncontrada) {
        document.getElementById('tituloEmpresaNav').textContent = empresaEncontrada.nombre;
        document.getElementById('lblNombreEmpresa').textContent = empresaEncontrada.nombre;
        document.getElementById('lblResponsable').textContent = empresaEncontrada.responsable || 'Sin asignar';
        document.getElementById('lblTelefono').textContent = empresaEncontrada.contacto;
    }

    cambiarPestana('empresa');
    cargarBuses();
    cargarRutas();
}

function cambiarPestana(pestana) {
    document.getElementById('seccion-empresa').classList.add('hidden');
    document.getElementById('seccion-buses').classList.add('hidden');
    document.getElementById('seccion-rutas').classList.add('hidden');

    document.getElementById('tab-empresa').classList.remove('active');
    document.getElementById('tab-buses').classList.remove('active');
    document.getElementById('tab-rutas').classList.remove('active');

    document.getElementById('seccion-' + pestana).classList.remove('hidden');
    document.getElementById('tab-' + pestana).classList.add('active');
}

// --- GESTIÓN DE BUSES ASOCIADOS A LA EMPRESA ---

function obtenerBuses() {
    let todosLosBuses = JSON.parse(localStorage.getItem('busesTransporte')) || {};
    // Retorna únicamente los buses de la empresa actual, o un arreglo vacío si no tiene
    return todosLosBuses[empresaActual] || [];
}

function cargarBuses() {
    const buses = obtenerBuses();
    const tbody = document.getElementById('tablaBuses');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (buses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-slate-400 py-4">No hay buses registrados para esta empresa.</td></tr>`;
        return;
    }

    buses.forEach((b, i) => {
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 font-medium text-slate-900">${b.nombre}</td>
                <td class="py-3 px-4 text-slate-500">${b.placa || 'N/A'}</td>
                <td class="py-3 px-4 text-slate-500">${b.capacidad} pasajero(s)</td>
                <td class="py-3 px-4 text-slate-500">${b.servicio}</td>
                <td class="py-3 px-4 text-right space-x-3">
                    <a href="#" onclick="eliminarBus(${i})" class="text-red-600 hover:underline font-medium">Eliminar</a>
                </td>
            </tr>
        `;
    });
}

function guardarBus(e) {
    e.preventDefault();

    const nuevoBus = {
        nombre: document.getElementById('busNombre').value,
        placa: document.getElementById('busPlaca').value,
        capacidad: document.getElementById('busCapacidad').value,
        servicio: document.getElementById('busServicio').value
    };

    let todosLosBuses = JSON.parse(localStorage.getItem('busesTransporte')) || {};
    
    // Si la empresa aún no tiene registro de buses, inicializamos su lista
    if (!todosLosBuses[empresaActual]) {
        todosLosBuses[empresaActual] = [];
    }

    todosLosBuses[empresaActual].push(nuevoBus);
    localStorage.setItem('busesTransporte', JSON.stringify(todosLosBuses));

    // LLAMAMOS A NUESTRA NOTIFICACIÓN FLOTANTE ELEGANTE
    mostrarNotificacion('¡Bus registrado con éxito!', 'success');

    document.querySelector('#formBusContainer form').reset();
    toggleFormBus();
    cargarBuses();
}

function eliminarBus(i) {
    if (confirm('¿Estás seguro de eliminar este bus?')) {
        let todosLosBuses = JSON.parse(localStorage.getItem('busesTransporte')) || {};
        
        if (todosLosBuses[empresaActual]) {
            todosLosBuses[empresaActual].splice(i, 1);
            localStorage.setItem('busesTransporte', JSON.stringify(todosLosBuses));
            cargarBuses();
        }
    }
}
// --- RUTAS ---
function obtenerRutas() {
    let todas = JSON.parse(localStorage.getItem('rutasTransporte')) || {};
    return todas[empresaActual] || [
        {
            origen: 'Juigalpa', destino: 'Managua', salida: '06:00 am', llegada: '08:00 am',
            dias: ['Lunes', 'Miércoles', 'Viernes'], servicio: 'Expreso', precio: 'C$ 150.00',
            telefono: '+505 8888 8888', whatsapp: '+505 8888 8888', notas: 'Llamar antes de las 5pm para reservar.', paradas: []
        }
    ];
}

function cargarRutas() {
    const rutas = obtenerRutas();
    const tbody = document.getElementById('tablaRutas');
    if (!tbody) return;
    tbody.innerHTML = '';
    rutas.forEach((r, i) => {
        let diasHtml = r.dias.map(d => `<span class="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold border border-blue-100" title="${d}">${d[0]}</span>`).join('');
        tbody.innerHTML += `
            <tr>
                <td class="font-medium text-slate-900">${r.origen} → ${r.destino}</td>
                <td class="text-slate-500">${r.salida} - ${r.llegada}</td>
                <td><div class="flex space-x-1">${diasHtml}</div></td>
                <td class="text-slate-500">${r.servicio}</td>
                <td class="text-right space-x-3">
                    <a href="#" onclick="eliminarRuta(${i})" class="text-red-600 hover:underline font-medium">Eliminar</a>
                </td>
            </tr>
        `;
    });
}

function guardarRuta(e) {
    e.preventDefault();
    const checkboxes = document.querySelectorAll('#grupoDias input[type="checkbox"]:checked');
    let diasSeleccionados = Array.from(checkboxes).map(cb => cb.value);

    let paradasLista = [];
    if (document.getElementById('selectTipoServicio').value === 'Ruteado') {
        const itemsParadas = document.querySelectorAll('#listaParadas > div');
        itemsParadas.forEach(div => {
            const inputs = div.querySelectorAll('input');
            paradasLista.push({
                nombre: inputs[0].value,
                hora: inputs[1].value,
                precio: inputs[2].value
            });
        });
    }

    const nuevaRuta = {
        origen: document.getElementById('rutaOrigen').value,
        destino: document.getElementById('rutaDestino').value,
        salida: document.getElementById('rutaSalida').value,
        llegada: document.getElementById('rutaLlegada').value,
        dias: diasSeleccionados,
        servicio: document.getElementById('selectTipoServicio').value,
        precio: document.getElementById('rutaPrecio').value,
        telefono: document.getElementById('rutaTelefono').value,
        whatsapp: document.getElementById('rutaWhatsapp').value,
        notas: document.getElementById('rutaNotas').value,
        paradas: paradasLista
    };

    let todas = JSON.parse(localStorage.getItem('rutasTransporte')) || {};
    if (!todas[empresaActual]) todas[empresaActual] = [];
    todas[empresaActual].push(nuevaRuta);
    localStorage.setItem('rutasTransporte', JSON.stringify(todas));

    alert('Ruta registrada con éxito');
    document.querySelector('#formRutaContainer form').reset();
    document.getElementById('listaParadas').innerHTML = '';
    toggleFormRuta();
    cargarRutas();
}

function eliminarRuta(i) {
    let todas = JSON.parse(localStorage.getItem('rutasTransporte')) || {};
    if (todas[empresaActual]) {
        todas[empresaActual].splice(i, 1);
        localStorage.setItem('rutasTransporte', JSON.stringify(todas));
        cargarRutas();
    }
}

function toggleFormBus() {
    document.getElementById('formBusContainer').classList.toggle('hidden');
}

function toggleFormRuta() {
    document.getElementById('formRutaContainer').classList.toggle('hidden');
}

function verificarTipoServicio() {
    const tipo = document.getElementById('selectTipoServicio').value;
    const seccionParadas = document.getElementById('seccionParadas');
    if (tipo === 'Ruteado') seccionParadas.classList.remove('hidden');
    else seccionParadas.classList.add('hidden');
}

function agregarParada() {
    const lista = document.getElementById('listaParadas');
    const item = document.createElement('div');
    item.className = 'flex items-center space-x-2 bg-white p-2 rounded border border-slate-200';
    item.innerHTML = `
        <input type="text" placeholder="Nombre de parada" class="flex-1 border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500" required>
        <input type="text" placeholder="Hora (ej. 6:45 am)" class="border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500" required>
        <input type="text" placeholder="Precio (C$ 20.00)" class="w-28 border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500" required>
        <button type="button" onclick="this.parentElement.remove()" class="text-red-600 font-bold px-2 text-xs">✕</button>
    `;
    lista.appendChild(item);
}

// FUNCIÓN PARA MOSTRAR LA ALERTA VISUAL MODERNA (TOAST)
function mostrarNotificacion(mensaje, tipo = 'success') {
    const contenedor = document.getElementById('toastContainer');
    if (!contenedor) return;

    const toast = document.createElement('div');
    toast.className = `flex items-center px-4 py-3 rounded-lg shadow-lg text-xs font-semibold text-white transition-all transform translate-y-2 opacity-0 ${
        tipo === 'success' ? 'bg-emerald-600' : 'bg-blue-600'
    }`;
    toast.innerHTML = `<span>${mensaje}</span>`;

    contenedor.appendChild(toast);

    // Animación de aparición
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    // Desaparición automática después de 3 segundos
    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}