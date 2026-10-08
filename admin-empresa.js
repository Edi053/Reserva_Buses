// Lógica para admin-empresa.html

function obtenerEmpresas() {
    let empresas = JSON.parse(localStorage.getItem('empresasTransporte'));
    if (!empresas) {
        empresas = [
            { nombre: 'Transportes Rápido Andino', responsable: 'Carlos Mendoza', contacto: '+51987654321', estado: 'Activa' },
            { nombre: 'Bus Express del Sur', responsable: 'María López', contacto: '+51999888777', estado: 'Activa' }
        ];
        localStorage.setItem('empresasTransporte', JSON.stringify(empresas));
    }
    return empresas;
}

function cargarEmpresas() {
    const empresas = obtenerEmpresas();
    const tbody = document.getElementById('listaEmpresas');
    if (!tbody) return;
    tbody.innerHTML = '';

empresas.forEach((emp, index) => {
        // Determinamos el estilo y el texto del botón según su estado actual
        const esActiva = emp.estado === 'Activa';
        const claseEstado = esActiva ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
        const textoAccionEstado = esActiva ? 'Desactivar' : 'Activar';
        const claseAccionEstado = esActiva ? 'text-amber-600' : 'text-emerald-600';

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition">
                <td class="py-4 px-6 font-medium text-slate-900">${emp.nombre}</td>
                <td class="py-4 px-6 text-slate-500">${emp.responsable}<br><span class="text-[11px]">${emp.contacto}</span></td>
                <td class="py-4 px-6">
                    <span class="${claseEstado} text-[10px] font-semibold px-2 py-0.5 rounded-full">${emp.estado}</span>
                </td>
                <td class="py-4 px-6 text-right space-x-3">
                    <a href="admin-detalle-empresa.html?empresa=${encodeURIComponent(emp.nombre)}" class="text-blue-600 hover:underline font-medium">Seleccionar</a>
                    <a href="#" onclick="toggleEstadoEmpresa(${index})" class="${claseAccionEstado} hover:underline font-medium">${textoAccionEstado}</a>
                    <a href="#" onclick="eliminarEmpresa(${index})" class="text-red-600 hover:underline font-medium">Eliminar</a>
                </td>
            </tr>
        `;
    });
}

function guardarEmpresa(event) {
    event.preventDefault();
    const nombre = document.getElementById('nombreEmpresa').value;
    const responsable = document.getElementById('responsableEmpresa').value || 'Sin asignar';
    const contacto = document.getElementById('contactoEmpresa').value;

    let empresas = obtenerEmpresas();
    empresas.push({ nombre, responsable, contacto, estado: 'Activa' });
    localStorage.setItem('empresasTransporte', JSON.stringify(empresas));

    //alert('Empresa registrada con éxito');
    // REEMPLAZAMOS EL ALERT POR UNA NOTIFICACIÓN FLOTANTE ELEGANTE
    mostrarNotificacion('¡Empresa registrada con éxito!', 'success');

    document.querySelector('form').reset();
    toggleFormulario();
    cargarEmpresas();
}

// FUNCIÓN PARA MOSTRAR LA ALERTA VISUAL MODERNA
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

function eliminarEmpresa(index) {
    let empresas = obtenerEmpresas();
    const empresaActual = empresas[index];
    empresaIndexTemporal = index;

    // Personalizamos los textos del modal para la eliminación
    document.getElementById('modalTitulo').textContent = '¿Estás seguro de eliminar esta empresa?';
    document.getElementById('modalMensaje').textContent = `Esta acción borrará permanentemente a "${empresaActual.nombre}" junto con sus configuraciones.`;
    
    const btnConfirmar = document.getElementById('btnConfirmarAccion');
    btnConfirmar.textContent = 'Sí, eliminar';
    btnConfirmar.className = 'w-1/2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded transition';

    // Asignamos la acción de borrado al botón del modal
    btnConfirmar.onclick = ejecutarEliminacionEmpresa;

    // Mostramos el modal
    document.getElementById('modalConfirmacion').classList.remove('hidden');
}

function ejecutarEliminacionEmpresa() {
    if (empresaIndexTemporal === null) return;

    let empresas = obtenerEmpresas();
    empresas.splice(empresaIndexTemporal, 1);
    localStorage.setItem('empresasTransporte', JSON.stringify(empresas));

    mostrarNotificacion('Empresa eliminada con éxito.', 'success');

    // Cerramos el modal y limpiamos la variable temporal
    document.getElementById('modalConfirmacion').classList.add('hidden');
    empresaIndexTemporal = null;

    // Recargamos la lista
    cargarEmpresas();
}

function filtrarEmpresas() {
    const filtro = document.getElementById('filtroEmpresas').value.toLowerCase();
    const filas = document.querySelectorAll('#listaEmpresas tr');
    filas.forEach(fila => {
        const texto = fila.textContent.toLowerCase();
        fila.classList.toggle('hidden', !texto.includes(filtro));
    });
}

function toggleFormulario() {
    const formContainer = document.getElementById('formContainer');
    const btn = document.getElementById('btnToggleForm');
    if (formContainer.classList.contains('hidden')) {
        formContainer.classList.remove('hidden');
        btn.textContent = 'Cancelar';
        btn.className = 'bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded transition';
    } else {
        formContainer.classList.add('hidden');
        btn.textContent = '+ Nueva Empresa';
        btn.className = 'bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded transition';
    }
}

let empresaIndexTemporal = null;

function toggleEstadoEmpresa(index) {
    let empresas = obtenerEmpresas();
    const empresaActual = empresas[index];
    empresaIndexTemporal = index;

    const esActiva = empresaActual.estado === 'Activa';
    const accionTexto = esActiva ? 'desactivar' : 'activar';

    // Personalizamos los textos del modal según la acción
    document.getElementById('modalTitulo').textContent = `¿Desea ${accionTexto} esta empresa?`;
    document.getElementById('modalMensaje').textContent = `Estás a punto de ${accionTexto} a "${empresaActual.nombre}". Sus rutas ${esActiva ? 'dejarán de aparecer' : 'volverán a aparecer'} para los pasajeros.`;
    
    const btnConfirmar = document.getElementById('btnConfirmarAccion');
    btnConfirmar.textContent = esActiva ? 'Sí, desactivar' : 'Sí, activar';
    btnConfirmar.className = esActiva 
        ? 'w-1/2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded transition'
        : 'w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded transition';

    // Asignamos la acción al botón del modal
    btnConfirmar.onclick = ejecutarCambioEstado;

    // Mostramos el modal
    document.getElementById('modalConfirmacion').classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modalConfirmacion').classList.add('hidden');
    empresaIndexTemporal = null;
}

function ejecutarCambioEstado() {
    if (empresaIndexTemporal === null) return;

    let empresas = obtenerEmpresas();
    const empresaActual = empresas[empresaIndexTemporal];

    if (empresaActual.estado === 'Activa') {
        empresaActual.estado = 'Inactiva';
        mostrarNotificacion('Empresa desactivada con éxito. Sus rutas ya no aparecerán a los pasajeros.', 'success');
    } else {
        empresaActual.estado = 'Activa';
        mostrarNotificacion('Empresa activada con éxito. Sus rutas vuelven a estar visibles.', 'success');
    }
        // Guardamos los cambios en el localStorage
        localStorage.setItem('empresasTransporte', JSON.stringify(empresas));

        // 1. Cerramos el modal primero y limpiamos la variable
        document.getElementById('modalConfirmacion').classList.add('hidden');
        empresaIndexTemporal = null;

        // 2. Recargamos la lista de empresas para reflejar el cambio
        cargarEmpresas();
}