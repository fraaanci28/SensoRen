
// Variable global para saber si estamos editando un medicamento existente
let editandoIndex = null;

// Función principal que carga los datos simulados desde un archivo JSON
async function cargarDatos() {
  
  // Se obtiene el archivo JSON con los datos simulados
  const res = await fetch("datos_sensoRen.json");
  const datos = await res.json();

  
  // Se inicializa un objeto para almacenar los datos por tipo de parámetro
  const datosPorParametro = {
    glucosa: [],
    frecuencia_cardiaca: [],
    pasos: [],
    hidratacion: [],
    peso: [],
    tension_sistolica: [],
    tension_diastolica: []
  };

  // Procesar glucosa
  if (datos.glucosa) {
    datos.glucosa.forEach(dato => {
      datosPorParametro.glucosa.push({ x: dato.timestamp, y: dato.valor });
    });
  }

  // Procesar frecuencia cardiaca
  if (datos.frecuencia_cardiaca) {
    datos.frecuencia_cardiaca.forEach(dato => {
      datosPorParametro.frecuencia_cardiaca.push({ x: dato.timestamp, y: dato.valor });
    });
  }

  // Procesar pasos
  if (datos.pasos) {
    datos.pasos.forEach(dato => {
      datosPorParametro.pasos.push({ x: dato.timestamp, y: dato.valor });
    });
  }

  // Procesar hidratacion
  if (datos.hidratacion) {
    datos.hidratacion.forEach(dato => {
      datosPorParametro.hidratacion.push({ x: dato.timestamp, y: dato.valor });
    });
  }

  // Procesar peso
  if (datos.peso) {
    datos.peso.forEach(dato => {
      datosPorParametro.peso.push({ x: dato.timestamp, y: dato.valor });
    });
  }

  // La tensión arterial viene como dos valores: sistólica y diastólica
  if (datos.tension) {
    datos.tension.forEach(dato => {
      datosPorParametro.tension_sistolica.push({ x: dato.timestamp, y: dato.sistolica });
      datosPorParametro.tension_diastolica.push({ x: dato.timestamp, y: dato.diastolica });
    });
  }

  // Se pintan las gráficas para cada parámetro usando Chart.js
  pintarGrafica("grafica-glucosa", "Glucosa (mg/dL)", datosPorParametro.glucosa, "rgb(255, 99, 132)");
  pintarGrafica("grafica-frecuencia", "Frecuencia Cardíaca (bpm)", datosPorParametro.frecuencia_cardiaca, "rgb(54, 162, 235)");
  pintarGrafica("grafica-pasos", "Pasos", datosPorParametro.pasos, "rgb(255, 206, 86)");
  pintarGrafica("grafica-hidratacion", "Hidratación (%)", datosPorParametro.hidratacion, "rgb(75, 192, 192)");
  pintarGrafica("grafica-peso", "Peso (kg)", datosPorParametro.peso, "rgb(153, 102, 255)");
  pintarGrafica("grafica-tension", "Tensión Arterial (mmHg)", [
    {
      label: "Sistólica",
      data: datosPorParametro.tension_sistolica,
      borderColor: "rgb(255, 99, 132)",
    },
    {
      label: "Diastólica",
      data: datosPorParametro.tension_diastolica,
      borderColor: "rgb(54, 162, 235)",
    }
  ], null, true);

  // Función auxiliar para calcular la media de un conjunto de datos
  const calcularMedia = datos => {
    const valores = datos.map(d => d.y);
    if (valores.length === 0) return null;
    const suma = valores.reduce((acc, val) => acc + val, 0);
    return (suma / valores.length).toFixed(1);
  };

  // Cálculo de medias y actualización de tarjetas informativas
  const mediaGlucosa = calcularMedia(datosPorParametro.glucosa);
  if (mediaGlucosa) actualizarTarjeta("info-glucosa", `Glucosa media: ${mediaGlucosa} mg/dL`);

  const mediaFrecuencia = calcularMedia(datosPorParametro.frecuencia_cardiaca);
  if (mediaFrecuencia) actualizarTarjeta("info-frecuencia", `Frecuencia media: ${mediaFrecuencia} bpm`);

  const mediaPasos = calcularMedia(datosPorParametro.pasos);
  if (mediaPasos) actualizarTarjeta("info-pasos", `Promedio diario: ${mediaPasos} pasos`);

  const mediaHidratacion = calcularMedia(datosPorParametro.hidratacion);
  if (mediaHidratacion) actualizarTarjeta("info-hidratacion", `Hidratación media: ${mediaHidratacion}%`);

  const mediaPeso = calcularMedia(datosPorParametro.peso);
  if (mediaPeso) actualizarTarjeta("info-peso", `Peso medio: ${mediaPeso} kg`);

  const mediaSistolica = calcularMedia(datosPorParametro.tension_sistolica);
  const mediaDiastolica = calcularMedia(datosPorParametro.tension_diastolica);

  // Generación de alertas visuales si las medias están fuera de los rangos saludables
  if (mediaSistolica && mediaDiastolica) {
    actualizarTarjeta("info-tension", `Tensión media: ${mediaSistolica}/${mediaDiastolica} mmHg`);
  }

  if (mediaGlucosa > 140 || mediaGlucosa < 70) {
      actualizarTarjeta("info-glucosa", `Glucosa media: ${mediaGlucosa} mg/dL ⚠️`, "#ffcccc");
  }
  if(mediaSistolica > 130 || mediaDiastolica > 80) {
      actualizarTarjeta("info-tension", `Tensión media: ${mediaSistolica}/${mediaDiastolica} mmHg ⚠️`, "#ffcccc");
  }
  if(mediaHidratacion < 50) {
      actualizarTarjeta("info-hidratacion", `Hidratación media: ${mediaHidratacion}% ⚠️`, "#ffcccc");
  }
  if(mediaPeso > 80) {
      actualizarTarjeta("info-peso", `Peso medio: ${mediaPeso} kg ⚠️`, "#ffcccc");
  } 
  if(mediaPasos < 5000) {
      actualizarTarjeta("info-pasos", `Promedio diario: ${mediaPasos} pasos ⚠️`, "#ffcccc");
  } 
  if(mediaFrecuencia > 100) {
      actualizarTarjeta("info-frecuencia", `Frecuencia media: ${mediaFrecuencia} bpm ⚠️`, "#ffcccc");
  } 
  
}

function pintarGrafica(id, titulo, datos, color, multipleSeries = false) {

  const ctx = document.getElementById(id).getContext("2d");

  let chart;
  if (multipleSeries) {

// Caso especial para parámetros con múltiples series (como la tensión arterial)
    // Se crean varias líneas en la misma gráfica (sistólica y diastólica)
    chart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: datos.map(serie => ({
          label: serie.label,
          data: [],
          borderColor: serie.borderColor,
          tension: 0.3,
          fill: false
        }))
      },
      options: getChartOptions(titulo)
    });
    
    // Animación progresiva: se añaden puntos uno a uno cada 2 segundos
    let i = 0;
    const intervalo = setInterval(() => {
      if (i < datos[0].data.length) {
        datos.forEach((serie, idx) => {
          chart.data.datasets[idx].data.push(serie.data[i]);
        });
        chart.update();
        i++;
      } else {
        clearInterval(intervalo);
      }
    }, 2000); // cada 300ms

  } else {
    // Caso general para parámetros individuales (glucosa, peso, etc.)
    chart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [{
          label: titulo,
          data: [],
          borderColor: color,
          tension: 0.3,
          fill: false
        }]
      },
      options: getChartOptions(titulo)
    });

    // Animación progresiva para una sola serie
    let i = 0;
    const intervalo = setInterval(() => {
      if (i < datos.length) {
        chart.data.datasets[0].data.push(datos[i]);
        chart.update();
        i++;
      } else {
        clearInterval(intervalo);
      }
    }, 2000); // cada 300ms
  }
}

function getChartOptions(titulo) {
  return {
    // Hace que la gráfica se adapte al tamaño del contenedor
    responsive: true,
    // Configuración de los ejes
    scales: {
      x: {
        // El eje X representa el tiempo
        type: "time",
        time: {
          tooltipFormat: "dd/MM/yyyy HH:mm",
          unit: "day"
        },
        title: {
          display: true,
          text: "Fecha"
        }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: titulo
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: titulo
      }
    }
  };
}

// Función para actualizar el contenido y color de una tarjeta informativa
function actualizarTarjeta(id, texto, color) {
  const tarjeta = document.getElementById(id);
  if (tarjeta) {
    tarjeta.textContent = texto;
    tarjeta.style.backgroundColor = color || "#a6faa1"; // color por defecto
  }
}

// Llamada inicial para cargar los datos fisiológicos al iniciar la app
cargarDatos();


// Muestra el formulario emergente para añadir o editar medicación
function mostrarFormularioMedicacion() {
  document.getElementById("formulario-medicacion").style.display = "block";
}

// Oculta el formulario de medicación
function cerrarFormularioMedicacion() {
  document.getElementById("formulario-medicacion").style.display = "none";
}


// Carga la lista de medicamentos desde localStorage y la muestra en pantalla
function cargarMedicacion() {
  const lista = document.getElementById("lista-medicacion");
  lista.innerHTML = "";
  const medicacion = JSON.parse(localStorage.getItem("medicacion")) || [];

  medicacion.forEach((med, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${med.nombre} - ${med.dosis} - ${med.frecuencia}
      ${med.observaciones ? " (" + med.observaciones + ")" : ""}
      <button onclick="editarMedicamento(${index})">✏️ Editar</button>
      <button onclick="borrarMedicamento(${index})">🗑️ Borrar</button>
    `;
    lista.appendChild(li);
  });
}

// Elimina un medicamento de la lista tras confirmación del usuario
function borrarMedicamento(index) {
  if (confirm("¿Estás seguro de que quieres eliminar este medicamento?")) {
    let medicacion = JSON.parse(localStorage.getItem("medicacion")) || [];
    medicacion.splice(index, 1);
    localStorage.setItem("medicacion", JSON.stringify(medicacion));
    cargarMedicacion();
  }
}

// Carga los datos de un medicamento en el formulario para editarlo
function editarMedicamento(index) {
  const medicacion = JSON.parse(localStorage.getItem("medicacion")) || [];
  const med = medicacion[index];

  document.getElementById("medicamento-nombre").value = med.nombre;
  document.getElementById("medicamento-dosis").value = med.dosis;
  document.getElementById("medicamento-frecuencia").value = med.frecuencia;
  document.getElementById("medicamento-observaciones").value = med.observaciones || "";

  editandoIndex = index;
  mostrarFormularioMedicacion();
}


// Maneja del envío del formulario de medicación
document.getElementById("form-medicacion").addEventListener("submit", function (e) {
  e.preventDefault();
  const nombre = document.getElementById("medicamento-nombre").value;
  const dosis = document.getElementById("medicamento-dosis").value;
  const frecuencia = document.getElementById("medicamento-frecuencia").value;
  const observaciones = document.getElementById("medicamento-observaciones").value;

  const nuevaMed = { nombre, dosis, frecuencia, observaciones };
  let medicacion = JSON.parse(localStorage.getItem("medicacion")) || [];

  if (editandoIndex !== null) {
    medicacion[editandoIndex] = nuevaMed;
    editandoIndex = null;
  } else {
    medicacion.push(nuevaMed);
  }

  localStorage.setItem("medicacion", JSON.stringify(medicacion));
  cerrarFormularioMedicacion();
  cargarMedicacion();
  this.reset();
});


// Redefinición de cerrarFormularioMedicacion para asegurarse de limpiar el formulario y el estado de edición
function cerrarFormularioMedicacion() {
  document.getElementById("formulario-medicacion").style.display = "none";
  document.getElementById("form-medicacion").reset();
  editandoIndex = null;
}

// Carga inicial de la medicación al iniciar la app
cargarMedicacion();
