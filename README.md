# Calculadora Ganadera

Aplicacion web para estimar la rentabilidad de operaciones ganaderas de vacas, gallinas y cerdos.
Permite cargar un escenario, calcular indicadores financieros clave y visualizar rapidamente si el negocio esta dejando utilidad, operando con margen estrecho o entrando en perdida.

## Lo que ahora incluye

- Interfaz renovada con enfoque tipo dashboard y mejor legibilidad.
- Identidad visual mucho mas agropecuaria, inspirada en predio, lote y cuaderno de campo.
- Formulario dinamico segun el animal seleccionado.
- Validaciones mas estrictas para evitar calculos inconsistentes.
- Indicadores clave:
  - Produccion total.
  - Ingreso bruto.
  - Gastos operativos.
  - Utilidad neta.
  - Margen neto.
  - ROI.
  - Costo por animal.
  - Costo por unidad producida.
- Punto de equilibrio en unidades y equivalencia aproximada por animal.
- Recomendaciones accionables segun el comportamiento del escenario.
- Comparacion automatica contra la referencia mas reciente del mismo animal.
- Proyecciones rapidas con escenarios conservador, base y optimista.
- Exportacion del reporte a CSV e impresion/guardado en PDF desde el navegador.
- Historial reciente guardado en el navegador.
- Grafica comparativa de ingresos, gastos y utilidad con Chart.js.

## Estructura del proyecto

- `index.html`: estructura principal de la interfaz.
- `style.css`: sistema visual, layout responsive y estilos del dashboard.
- `script.js`: logica del formulario, calculos, grafica e historial local.

## Uso

1. Abre `index.html` en el navegador.
2. Selecciona el tipo de animal.
3. Ingresa cantidad, produccion, precio y gastos del mismo periodo de analisis.
4. Haz clic en `Calcular rentabilidad`.
5. Revisa el reporte ejecutivo, el punto de equilibrio y el historial reciente.

## Recomendaciones de uso

- Usa el mismo periodo para todas las variables del calculo.
- No dejes los gastos en cero si quieres una lectura realista.
- Compara escenarios del historial para evaluar cambios en precio, costos o productividad.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Chart.js
