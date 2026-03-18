function mostrarFormulario() {
  const animal = document.getElementById("animal").value;
  const contenedor = document.getElementById("formularioAnimal");
  let html = "";

  if (animal === "vaca") {
    html = `
      <h3>Datos de Vacas 🐄</h3>
      <label>Cantidad:</label><input type="number" id="cantidad"><br>
      <label>Litros por vaca:</label><input type="number" id="produccion"><br>
      <label>Precio por litro de leche:</label><input type="number" id="precio"><br>
      <label>Gastos:</label><input type="number" id="gastos"><br>
    `;
  } else if (animal === "gallina") {
    html = `
      <h3>Datos de Gallinas 🐔</h3>
      <label>Cantidad:</label><input type="number" id="cantidad"><br>
      <label>Huevos por gallina:</label><input type="number" id="produccion"><br>
      <label>Precio por huevo:</label><input type="number" id="precio"><br>
      <label>Gastos:</label><input type="number" id="gastos"><br>
    `;
  } else if (animal === "cerdo") {
    html = `
      <h3>Datos de Cerdos 🐖</h3>
      <label>Cantidad:</label><input type="number" id="cantidad"><br>
      <label>Kilos de carne por cerdo:</label><input type="number" id="produccion"><br>
      <label>Precio por kilo de carne:</label><input type="number" id="precio"><br>
      <label>Gastos:</label><input type="number" id="gastos"><br>
    `;
  }

  contenedor.innerHTML = html;
}

function calcular() {
  const animal = document.getElementById("animal").value;
  const cantidad = parseFloat(document.getElementById("cantidad").value) || 0;
  const produccion = parseFloat(document.getElementById("produccion").value) || 0;
  const precio = parseFloat(document.getElementById("precio").value) || 0;
  const gastos = parseFloat(document.getElementById("gastos").value) || 0;

  let ingreso = cantidad * produccion * precio;
  let utilidad = ingreso - gastos;

  document.getElementById("resultado").innerHTML = `
    <h3>Resultado</h3>
    <p>Ingresos: $${ingreso.toFixed(2)}</p>
    <p>Gastos: $${gastos.toFixed(2)}</p>
    <p>Utilidad: $${utilidad.toFixed(2)}</p>
  `;
}
let grafica; // variable global para manejar la gráfica

function calcular() {
  const animal = document.getElementById("animal").value;
  const cantidad = parseFloat(document.getElementById("cantidad").value) || 0;
  const produccion = parseFloat(document.getElementById("produccion").value) || 0;
  const precio = parseFloat(document.getElementById("precio").value) || 0;
  const gastos = parseFloat(document.getElementById("gastos").value) || 0;

  let produccionTotal = cantidad * produccion;
  let ingreso = produccionTotal * precio;
  let utilidad = ingreso - gastos;
  let ingresoPromedio = cantidad > 0 ? ingreso / cantidad : 0;
  let porcentajeUtilidad = ingreso > 0 ? (utilidad / ingreso) * 100 : 0;

  document.getElementById("resultado").innerHTML = `
    <h3>📊 Estadísticas</h3>
    <p><strong>Producción total:</strong> ${produccionTotal.toFixed(2)} unidades</p>
    <p><strong>Ingresos totales:</strong> $${ingreso.toFixed(2)}</p>
    <p><strong>Gastos:</strong> $${gastos.toFixed(2)}</p>
    <p><strong>Utilidad:</strong> $${utilidad.toFixed(2)}</p>
    <p><strong>Ingreso promedio por ${animal}:</strong> $${ingresoPromedio.toFixed(2)}</p>
    <p><strong>Margen de utilidad:</strong> ${porcentajeUtilidad.toFixed(2)}%</p>
  `;

  // Crear o actualizar gráfica
  const ctx = document.getElementById("graficaResultados").getContext("2d");

  if (grafica) {
    grafica.destroy(); // eliminar gráfica anterior
  }

  grafica = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Ingresos", "Gastos", "Utilidad"],
      datasets: [{
        label: "Resultados en $",
        data: [ingreso, gastos, utilidad],
        backgroundColor: ["#3498db", "#e74c3c", "#2ecc71"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Comparación de resultados"
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
