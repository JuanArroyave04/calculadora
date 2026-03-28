# Calculadora Ganadera

Aplicacion web enfocada en el sector agropecuario para analizar la rentabilidad de un predio o lote productivo de manera clara, visual y practica.
Permite evaluar vacas, gallinas y cerdos a partir de datos simples del corte productivo para obtener ingresos, costos, utilidad, margen y punto de equilibrio.

## Enfoque del proyecto

La idea principal se mantiene intacta: una calculadora ganadera.
La diferencia es que ahora la experiencia se siente mas profesional, mas util para la toma de decisiones y mucho mas alineada con una identidad rural y agropecuaria.

## Caracteristicas principales

- Interfaz con identidad visual agropecuaria, inspirada en finca, predio, lote y cuaderno de campo.
- Fondo local con paisaje de granja para evitar dependencias externas.
- Formulario dinamico segun la linea pecuaria seleccionada.
- Soporte para:
  - Ganado lechero.
  - Produccion avicola.
  - Produccion porcina.
- Validaciones para evitar entradas vacias o inconsistentes.
- Indicadores financieros y productivos en tiempo real:
  - Produccion total.
  - Ingreso del lote.
  - Gastos del manejo.
  - Utilidad del corte.
  - Margen neto.
  - ROI.
  - Costo por animal.
  - Costo por unidad producida.
- Punto de equilibrio en unidades y equivalencia aproximada por animal.
- Semaforo del lote para lectura rapida del estado del negocio.
- Recomendaciones de manejo y accion segun el resultado del analisis.
- Comparacion automatica frente al ultimo corte similar guardado.
- Proyecciones de manejo:
  - Tiempo apretado.
  - Corte actual.
  - Buen levante.
- Exportacion del reporte a CSV.
- Impresion o guardado en PDF desde el navegador.
- Historial local de cortes usando `localStorage`.
- Grafica comparativa con Chart.js.
- Diseno responsive para escritorio y movil.

## Que problema resuelve

Ayuda a responder preguntas practicas como:

- El lote realmente esta dejando utilidad?
- Cuanto cuesta producir cada litro, huevo o kilo?
- Cuanto necesito vender para cubrir costos?
- Voy mejor o peor que en el corte anterior?
- Que pasa si el precio baja o si logro mejorar costos?

## Estructura del proyecto

- `index.html`: estructura principal de la interfaz.
- `style.css`: sistema visual, layout responsive y estilos del tablero.
- `script.js`: logica del formulario, calculos, grafica, historial y exportacion.
- `farm-landscape.svg`: paisaje de granja usado como fondo local.

## Como ejecutarlo

Opcion 1: abrir directamente el archivo principal.

1. Descarga o clona el repositorio.
2. Abre `index.html` en tu navegador.

Opcion 2: ejecutar un servidor local.

```bash
python -m http.server 5500
```

Luego abre:

```text
http://127.0.0.1:5500
```

## Flujo de uso

1. Selecciona la linea pecuaria.
2. Ingresa cantidad, produccion, precio y gastos del mismo periodo.
3. Haz clic en `Calcular rentabilidad`.
4. Revisa el centro de mando rural, la grafica y el punto de equilibrio.
5. Compara el resultado con la bitacora del predio.
6. Exporta el reporte si necesitas compartirlo o archivarlo.

## Recomendaciones para un uso mas realista

- Usa el mismo periodo de analisis para todas las variables.
- No dejes los gastos en cero si quieres una lectura confiable.
- Registra cortes frecuentes para que la comparacion historica tenga valor.
- Usa la proyeccion para tomar decisiones antes de mover precio, alimento o escala.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Chart.js

## Valor del proyecto

Esta calculadora no solo entrega numeros.
Busca traducir datos productivos del campo en decisiones utiles para mejorar la gestion economica de una operacion ganadera.
