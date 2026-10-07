// Lógica para pasajero.html

function obtenerTodasLasRutas() {
// Obtenemos las empresas para verificar su estado
    let empresas = JSON.parse(localStorage.getItem('empresasTransporte')) || [];
    let empresasInactivas = empresas.filter(e => e.estado === 'Inactiva').map(e => e.nombre);

    let todas = JSON.parse(localStorage.getItem('rutasTransporte')) || {};
    let listaGlobal = [];
    
    let rutasDefault = {
        "Transportes Rápido Andino": [
            {
                origen: 'Juigalpa', destino: 'Managua', salida: '06:00 am', llegada: '08:00 am',
                dias: ['Lunes', 'Miércoles', 'Viernes'], servicio: 'Expreso', precio: 'C$ 150.00',
                telefono: '+505 8888 8888', whatsapp: '+505 8888 8888', notas: 'Llamar antes de las 5pm para reservar.', paradas: []
            },
            {
                origen: 'Juigalpa', destino: 'Managua', salida: '06:30 am', llegada: '09:30 am',
                dias: ['Martes', 'Jueves', 'Sábado'], servicio: 'Ruteado', precio: 'C$ 120.00',
                telefono: '+505 8888 8888', whatsapp: '+505 8888 8888', notas: 'Llamar antes de las 5pm para reservar.',
                paradas: [{nombre: 'Las Lajitas', hora: '6:45 am', precio: 'C$ 20.00'}, {nombre: 'San Esteban', hora: '6:50 am', precio: 'C$ 40.00'}]
            }
        ]
    };

    let combinado = Object.assign({}, rutasDefault, todas);

    for (let empresa in combinado) {
        // SI LA EMPRESA ESTÁ INACTIVA, LA SALTAMOS Y NO AGREGAMOS SUS RUTAS
        if (empresasInactivas.includes(empresa)) {
            continue; 
        }

        combinado[empresa].forEach(r => {
            r.empresaNombre = empresa;
            listaGlobal.push(r);
        });
    }
    return listaGlobal;
}

function cargarRutasPasajero(filtradas = null) {
    const contenedor = document.getElementById('contenedorTarjetas');
    if (!contenedor) return;
    const rutas = filtradas || obtenerTodasLasRutas();
    contenedor.innerHTML = '';

    if (rutas.length === 0) {
        contenedor.innerHTML = `<p class="text-center text-slate-500 text-xs py-8">No se encontraron rutas disponibles.</p>`;
        return;
    }

    rutas.forEach((r, index) => {
        let diasHtml = r.dias.map(d => `<span class="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-blue-100">${d}</span>`).join(' ');
        
        let paradasHtml = '';
        if (r.servicio === 'Ruteado' && r.paradas && r.paradas.length > 0) {
            let detalleParadas = r.paradas.map((p, idx) => `
                <div class="flex justify-between border-b border-slate-200 pb-1 text-slate-600">
                    <span>${idx + 1}. ${p.nombre} (${p.hora})</span>
                    <span class="font-semibold text-slate-800">${p.precio}</span>
                </div>
            `).join('');

            paradasHtml = `
                <div class="mt-3">
                    <button onclick="toggleParadas('paradas-${index}')" class="text-blue-600 hover:underline text-xs font-semibold flex items-center space-x-1">
                        <span id="txt-paradas-${index}">Ver paradas intermedias</span>
                        <span id="icon-paradas-${index}">▼</span>
                    </button>
                    <div id="paradas-${index}" class="hidden mt-3 bg-slate-50 border border-slate-200 rounded p-3 space-y-2 text-xs">
                        <p class="font-bold text-slate-700 mb-1">Detalle de Paradas y Precios por Tramo:</p>
                        ${detalleParadas}
                    </div>
                </div>
            `;
        }

        contenedor.innerHTML += `
            <div class="admin-card p-6 space-y-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-bold text-slate-900 text-sm">${r.origen} → ${r.destino}</h3>
                        <p class="text-xs text-slate-500 font-medium">${r.empresaNombre}</p>
                    </div>
                    <div class="text-right">
                        <span class="font-bold text-emerald-600 text-base">${r.precio}</span>
                        <p class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">${r.servicio}</p>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-4 text-xs border-t border-b border-slate-100 py-3">
                    <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-semibold">Salida</span>
                        <span class="font-bold text-slate-700">${r.salida}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-semibold">Llegada</span>
                        <span class="font-bold text-slate-700">${r.llegada}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-semibold">Días</span>
                        <div class="flex space-x-1 mt-0.5 flex-wrap gap-1">${diasHtml}</div>
                    </div>
                </div>

                ${paradasHtml}

                <div class="flex justify-between items-end pt-1">
                    <div class="text-xs space-y-0.5 text-slate-600">
                        <p><strong class="text-slate-700">Contacto:</strong> ${r.telefono}</p>
                        <p><strong class="text-slate-700">WhatsApp:</strong> ${r.whatsapp || r.telefono}</p>
                        <p class="text-slate-400 italic">"${r.notas || 'Sin notas adicionales.'}"</p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="alert('Iniciando llamada...')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded transition">Llamar</button>
                        <button onclick="alert('Abriendo WhatsApp...')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-1.5 rounded transition">WhatsApp</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function filtrarRutasPasajero() {
    const origen = document.getElementById('filtroOrigen').value.toLowerCase().trim();
    const destino = document.getElementById('filtroDestino').value.toLowerCase().trim();
    const todas = obtenerTodasLasRutas();

    const filtradas = todas.filter(r => {
        const matchOrigen = r.origen.toLowerCase().includes(origen);
        const matchDestino = r.destino.toLowerCase().includes(destino);
        return matchOrigen && matchDestino;
    });

    cargarRutasPasajero(filtradas);
}

function toggleParadas(id) {
    const contenedor = document.getElementById(id);
    const texto = document.getElementById('txt-' + id);
    const icono = document.getElementById('icon-' + id);

    if (contenedor.classList.contains('hidden')) {
        contenedor.classList.remove('hidden');
        texto.textContent = 'Ocultar paradas intermedias';
        icono.textContent = '▲';
    } else {
        contenedor.classList.add('hidden');
        texto.textContent = 'Ver paradas intermedias';
        icono.textContent = '▼';
    }
}