const STORAGE_KEY = "calculadora-ganadera-history-v3";

const animalConfig = Object.freeze({
  vaca: {
    name: "Vaca",
    plural: "vacas",
    groupLabel: "hato lechero",
    lineLabel: "Ganado lechero",
    description:
      "Ideal para medir ingresos por leche y revisar si el lote cubre sus costos operativos.",
    quantityLabel: "Cantidad de vacas en produccion",
    productionLabel: "Litros por vaca en el periodo",
    priceLabel: "Precio por litro de leche (COP)",
    unitSingular: "litro",
    unitPlural: "litros",
    productName: "leche",
    optimizationTip:
      "Controla alimentacion, sanidad y eficiencia de ordeno para proteger el margen por vaca.",
    example: {
      quantity: 24,
      production: 16.5,
      price: 1850,
      expenses: 3200000
    }
  },
  gallina: {
    name: "Gallina",
    plural: "gallinas",
    groupLabel: "galpon de postura",
    lineLabel: "Produccion avicola",
    description:
      "Pensada para analizar postura, costo por huevo y rentabilidad del lote en el periodo evaluado.",
    quantityLabel: "Cantidad de gallinas activas",
    productionLabel: "Huevos por gallina en el periodo",
    priceLabel: "Precio por huevo (COP)",
    unitSingular: "huevo",
    unitPlural: "huevos",
    productName: "huevos",
    optimizationTip:
      "Vigila postura, mortalidad y conversion alimenticia para que el costo por huevo no se dispare.",
    example: {
      quantity: 180,
      production: 22,
      price: 620,
      expenses: 1450000
    }
  },
  cerdo: {
    name: "Cerdo",
    plural: "cerdos",
    groupLabel: "corral porcino",
    lineLabel: "Produccion porcina",
    description:
      "Permite revisar el margen por kilo producido y validar si el peso de salida es rentable.",
    quantityLabel: "Cantidad de cerdos",
    productionLabel: "Kilos por cerdo en el periodo",
    priceLabel: "Precio por kilo de carne (COP)",
    unitSingular: "kilo",
    unitPlural: "kilos",
    productName: "carne",
    optimizationTip:
      "Sigue de cerca el costo de alimento y el peso de salida para mejorar la utilidad por kilo.",
    example: {
      quantity: 36,
      production: 92,
      price: 9800,
      expenses: 21400000
    }
  }
});

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

const percentFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 1
});

const numberFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 2
});

const compactFormatter = new Intl.NumberFormat("es-CO", {
  notation: "compact",
  maximumFractionDigits: 1
});

const refs = {};

let chartInstance = null;
let historyEntries = [];
let currentSnapshot = null;

document.addEventListener("DOMContentLoaded", init);

function init() {
  refs.form = document.getElementById("calculatorForm");
  refs.animalSelect = document.getElementById("animal");
  refs.dynamicFields = document.getElementById("dynamicFields");
  refs.animalInsight = document.getElementById("animalInsight");
  refs.feedback = document.getElementById("formFeedback");
  refs.statusBadge = document.getElementById("statusBadge");
  refs.scenarioMeta = document.getElementById("scenarioMeta");
  refs.resultHeadline = document.getElementById("resultHeadline");
  refs.metricsGrid = document.getElementById("metricsGrid");
  refs.summaryList = document.getElementById("summaryList");
  refs.recommendationsList = document.getElementById("recommendationsList");
  refs.financialSignal = document.getElementById("financialSignal");
  refs.breakEvenText = document.getElementById("breakEvenText");
  refs.comparisonContent = document.getElementById("comparisonContent");
  refs.forecastGrid = document.getElementById("forecastGrid");
  refs.historyList = document.getElementById("historyList");
  refs.clearHistoryBtn = document.getElementById("clearHistoryBtn");
  refs.loadExampleBtn = document.getElementById("loadExampleBtn");
  refs.exportCsvBtn = document.getElementById("exportCsvBtn");
  refs.printReportBtn = document.getElementById("printReportBtn");
  refs.resultsChart = document.getElementById("resultsChart");
  refs.chartMessage = document.getElementById("chartMessage");

  configureChartDefaults();
  bindEvents();

  historyEntries = loadHistory();
  renderHistory();
  renderAnimalFields(refs.animalSelect.value);
  resetDashboard();
}

function configureChartDefaults() {
  if (!window.Chart) {
    return;
  }

  window.Chart.defaults.font.family = '"Source Sans 3", sans-serif';
  window.Chart.defaults.color = "#4e5e54";
}

function bindEvents() {
  refs.animalSelect.addEventListener("change", handleAnimalChange);
  refs.form.addEventListener("submit", handleFormSubmit);
  refs.form.addEventListener("reset", handleFormReset);
  refs.form.addEventListener("input", handleInputChange);
  refs.loadExampleBtn.addEventListener("click", handleLoadExample);
  refs.clearHistoryBtn.addEventListener("click", clearHistory);
  refs.exportCsvBtn.addEventListener("click", handleExportCsv);
  refs.printReportBtn.addEventListener("click", handlePrintReport);
  refs.historyList.addEventListener("click", handleHistoryClick);
}

function handleAnimalChange() {
  clearSelectValidation();
  renderAnimalFields(refs.animalSelect.value);
  clearFeedback();
  resetDashboard(refs.animalSelect.value);
}

function handleInputChange(event) {
  const target = event.target;

  if (target.matches("input, select")) {
    target.removeAttribute("aria-invalid");
  }

  if (refs.feedback.textContent) {
    clearFeedback();
  }
}

function handleFormSubmit(event) {
  event.preventDefault();

  const data = collectFormData();

  if (!data) {
    return;
  }

  const timestamp = new Date().toISOString();
  const config = animalConfig[data.animalKey];
  const metrics = calculateIndicators(data);
  const comparison = getComparisonSnapshot(data, metrics);
  const forecasts = buildForecastScenarios(data);

  currentSnapshot = {
    data,
    metrics,
    comparison,
    forecasts,
    timestamp
  };

  renderDashboard(data, metrics, config, timestamp);
  renderStrategicPanels(data, metrics, config, comparison, forecasts);
  renderChart(metrics);
  saveHistory(data, metrics, timestamp);
  renderHistory();
  setFeedback("Analisis actualizado correctamente.", "success");
}

function handleFormReset() {
  window.requestAnimationFrame(() => {
    refs.animalSelect.value = "";
    clearSelectValidation();
    renderAnimalFields("");
    clearFeedback();
    resetDashboard();
  });
}

function handleLoadExample() {
  const animalKey = refs.animalSelect.value;

  if (!animalKey) {
    refs.animalSelect.setAttribute("aria-invalid", "true");
    setFeedback("Selecciona primero la linea pecuaria para cargar un ejemplo coherente del predio.", "warning");
    refs.animalSelect.focus();
    return;
  }

  const example = animalConfig[animalKey].example;

  Object.entries(example).forEach(([key, value]) => {
    const input = document.getElementById(key);

    if (input) {
      input.value = value;
      input.removeAttribute("aria-invalid");
    }
  });

  setFeedback("Se cargaron valores de referencia para que pruebes el corte del predio.", "success");
}

function handleHistoryClick(event) {
  const button = event.target.closest("[data-index]");

  if (!button) {
    return;
  }

  const historyIndex = Number(button.dataset.index);
  const entry = historyEntries[historyIndex];

  if (!entry) {
    return;
  }

  refs.animalSelect.value = entry.animalKey;
  renderAnimalFields(entry.animalKey);

  ["quantity", "production", "price", "expenses"].forEach((fieldId) => {
    const input = document.getElementById(fieldId);

    if (input) {
      input.value = entry[fieldId];
    }
  });

  const metrics = calculateIndicators(entry);
  const comparison = getComparisonSnapshot(entry, metrics, historyIndex);
  const forecasts = buildForecastScenarios(entry);

  currentSnapshot = {
    data: {
      animalKey: entry.animalKey,
      quantity: entry.quantity,
      production: entry.production,
      price: entry.price,
      expenses: entry.expenses
    },
    metrics,
    comparison,
    forecasts,
    timestamp: entry.timestamp
  };

  renderDashboard(entry, metrics, animalConfig[entry.animalKey], entry.timestamp);
  renderStrategicPanels(entry, metrics, animalConfig[entry.animalKey], comparison, forecasts);
  renderChart(metrics);
  setFeedback("Corte del historial cargado en pantalla.", "success");
}

function clearHistory() {
  if (!historyEntries.length) {
    setFeedback("No hay cortes guardados para limpiar.", "warning");
    return;
  }

  historyEntries = [];
  persistHistory();
  renderHistory();

  if (currentSnapshot) {
    currentSnapshot.comparison = null;
    renderStrategicPanels(
      currentSnapshot.data,
      currentSnapshot.metrics,
      animalConfig[currentSnapshot.data.animalKey],
      null,
      currentSnapshot.forecasts
    );
  }

  setFeedback("La bitacora del predio fue limpiada.", "success");
}

function handleExportCsv() {
  if (!currentSnapshot) {
    setFeedback("Primero calcula un corte para poder exportarlo.", "warning");
    return;
  }

  const csvContent = buildCsvReport(currentSnapshot);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = buildExportFileName(currentSnapshot);
  document.body.append(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  setFeedback("El reporte agropecuario en CSV se exporto correctamente.", "success");
}

function handlePrintReport() {
  if (!currentSnapshot) {
    setFeedback("Primero calcula un corte para poder imprimirlo o guardarlo en PDF.", "warning");
    return;
  }

  window.print();
  setFeedback("Se abrio la vista de impresion del reporte del predio.", "success");
}

function renderAnimalFields(animalKey) {
  if (!animalKey || !animalConfig[animalKey]) {
    refs.dynamicFields.innerHTML = "";
    refs.animalInsight.textContent =
      "Elige la linea pecuaria para adaptar automaticamente las variables del corte productivo.";
    return;
  }

  const config = animalConfig[animalKey];
  const fields = [
    {
      id: "quantity",
      label: config.quantityLabel,
      helpText: `Registra solo ${config.plural} activos dentro del periodo analizado.`,
      placeholder: `${config.example.quantity}`,
      min: "1",
      step: "1"
    },
    {
      id: "production",
      label: config.productionLabel,
      helpText: `Produccion individual expresada en ${config.unitPlural}.`,
      placeholder: `${config.example.production}`,
      min: "0",
      step: "0.01"
    },
    {
      id: "price",
      label: config.priceLabel,
      helpText: `Valor unitario de venta de ${config.productName}.`,
      placeholder: `${config.example.price}`,
      min: "0",
      step: "0.01"
    },
    {
      id: "expenses",
      label: "Gastos operativos del periodo (COP)",
      helpText: "Incluye alimentacion, mano de obra, sanidad, transporte y otros costos.",
      placeholder: `${config.example.expenses}`,
      min: "0",
      step: "0.01"
    }
  ];

  refs.dynamicFields.innerHTML = fields.map(createFieldMarkup).join("");
  refs.animalInsight.textContent = `${config.lineLabel}: ${config.description} Lectura enfocada en el ${config.groupLabel} del predio.`;
}

function createFieldMarkup(field) {
  return `
    <div class="field-group">
      <label for="${field.id}">${field.label}</label>
      <input
        id="${field.id}"
        name="${field.id}"
        type="number"
        inputmode="decimal"
        min="${field.min}"
        step="${field.step}"
        placeholder="${field.placeholder}"
        autocomplete="off"
      >
      <span class="field-help">${field.helpText}</span>
    </div>
  `;
}

function collectFormData() {
  const animalKey = refs.animalSelect.value;

  if (!animalKey || !animalConfig[animalKey]) {
    refs.animalSelect.setAttribute("aria-invalid", "true");
    setFeedback("Selecciona la linea pecuaria antes de calcular el corte.", "error");
    refs.animalSelect.focus();
    return null;
  }

  const parsed = {
    animalKey,
    quantity: parseInputValue("quantity"),
    production: parseInputValue("production"),
    price: parseInputValue("price"),
    expenses: parseInputValue("expenses")
  };

  const validations = [
    {
      id: "quantity",
      label: animalConfig[animalKey].quantityLabel,
      validator: (value) => Number.isInteger(value) && value > 0,
      message: "La cantidad debe ser un numero entero mayor a 0."
    },
    {
      id: "production",
      label: animalConfig[animalKey].productionLabel,
      validator: (value) => Number.isFinite(value) && value > 0,
      message: "La produccion debe ser mayor a 0."
    },
    {
      id: "price",
      label: animalConfig[animalKey].priceLabel,
      validator: (value) => Number.isFinite(value) && value > 0,
      message: "El precio unitario debe ser mayor a 0."
    },
    {
      id: "expenses",
      label: "Gastos operativos del periodo",
      validator: (value) => Number.isFinite(value) && value >= 0,
      message: "Los gastos deben ser 0 o un numero positivo."
    }
  ];

  for (const rule of validations) {
    if (!rule.validator(parsed[rule.id])) {
      const input = document.getElementById(rule.id);
      input?.setAttribute("aria-invalid", "true");
      setFeedback(`${rule.label}: ${rule.message}`, "error");
      input?.focus();
      return null;
    }
  }

  return parsed;
}

function parseInputValue(fieldId) {
  const rawValue = document.getElementById(fieldId)?.value?.trim() ?? "";

  if (!rawValue) {
    return Number.NaN;
  }

  return Number(rawValue.replace(",", "."));
}

function calculateIndicators(data) {
  const totalProduction = data.quantity * data.production;
  const grossIncome = totalProduction * data.price;
  const netProfit = grossIncome - data.expenses;
  const revenuePerAnimal = grossIncome / data.quantity;
  const profitPerAnimal = netProfit / data.quantity;
  const costPerAnimal = data.expenses / data.quantity;
  const costPerUnit = totalProduction > 0 ? data.expenses / totalProduction : 0;
  const margin = grossIncome > 0 ? (netProfit / grossIncome) * 100 : 0;
  const roi = data.expenses > 0 ? (netProfit / data.expenses) * 100 : 0;
  const breakEvenUnits = data.price > 0 ? data.expenses / data.price : 0;
  const breakEvenAnimals = data.production > 0 ? breakEvenUnits / data.production : 0;
  const breakEvenPrice = totalProduction > 0 ? data.expenses / totalProduction : 0;
  const unitsAboveBreakEven = totalProduction - breakEvenUnits;

  return {
    totalProduction,
    grossIncome,
    netProfit,
    revenuePerAnimal,
    profitPerAnimal,
    costPerAnimal,
    costPerUnit,
    margin,
    roi,
    breakEvenUnits,
    breakEvenAnimals,
    breakEvenPrice,
    unitsAboveBreakEven
  };
}

function renderDashboard(data, metrics, config, timestamp) {
  const status = getPerformanceStatus(data, metrics);
  const summaryItems = buildSummary(data, metrics, config);
  const recommendationItems = buildRecommendations(data, metrics, config);

  refs.statusBadge.className = `status-badge ${status.tone}`;
  refs.statusBadge.textContent = status.label;
  refs.scenarioMeta.textContent = buildScenarioMeta(data, metrics, config, timestamp);
  refs.resultHeadline.textContent = status.headline;
  refs.metricsGrid.innerHTML = buildMetricCards(data, metrics, config);
  refs.summaryList.innerHTML = buildBulletList(summaryItems);
  refs.summaryList.className = "detail-list";
  refs.recommendationsList.innerHTML = buildBulletList(recommendationItems);
  refs.recommendationsList.className = "detail-list";
  refs.financialSignal.textContent = status.signalText;
  refs.breakEvenText.textContent = buildBreakEvenMessage(metrics, config);
}

function renderStrategicPanels(data, metrics, config, comparison, forecasts) {
  refs.comparisonContent.className = comparison ? "detail-list" : "detail-list empty-state";
  refs.comparisonContent.innerHTML = comparison
    ? buildComparisonMarkup(comparison, config)
    : "<p>Aun no existe una referencia comparable del mismo animal dentro de la bitacora del predio.</p>";

  refs.forecastGrid.className = forecasts.length ? "forecast-grid" : "forecast-grid empty-state";
  refs.forecastGrid.innerHTML = forecasts.length
    ? forecasts.map((forecast) => buildForecastCard(forecast, config, metrics)).join("")
    : "<p>Calcula un corte para generar simulaciones defensivas, base y favorables.</p>";
}

function buildMetricCards(data, metrics, config) {
  const cards = [
    {
      label: "Produccion total",
      value: `${formatNumber(metrics.totalProduction)} ${config.unitPlural}`,
      caption: `Volumen total de ${config.productName} en el periodo.`,
      tone: "emphasis"
    },
    {
      label: "Ingreso del lote",
      value: formatCurrency(metrics.grossIncome),
      caption: "Valor total del corte antes de descontar costos.",
      tone: "positive emphasis"
    },
    {
      label: "Gastos del manejo",
      value: formatCurrency(data.expenses),
      caption: "Suma de costos cargados al corte productivo.",
      tone: ""
    },
    {
      label: "Utilidad del corte",
      value: formatCurrency(metrics.netProfit),
      caption: "Resultado final del predio despues de cubrir gastos.",
      tone: metrics.netProfit >= 0 ? "positive emphasis" : "negative emphasis"
    },
    {
      label: "Margen neto",
      value: `${formatPercent(metrics.margin)}%`,
      caption: "Porcentaje de utilidad sobre las ventas.",
      tone: metrics.margin >= 20 ? "positive" : metrics.margin >= 0 ? "" : "negative"
    },
    {
      label: "ROI",
      value: `${formatPercent(metrics.roi)}%`,
      caption: "Retorno generado frente a los gastos.",
      tone: metrics.roi >= 0 ? "positive" : "negative"
    },
    {
      label: `Costo por ${config.name.toLowerCase()}`,
      value: formatCurrency(metrics.costPerAnimal),
      caption: "Costo promedio por animal dentro del lote.",
      tone: ""
    },
    {
      label: `Costo por ${config.unitSingular}`,
      value: formatCurrency(metrics.costPerUnit),
      caption: "Costo promedio por unidad producida.",
      tone: metrics.costPerUnit <= data.price ? "positive" : "negative"
    }
  ];

  return cards
    .map(
      (card) => `
        <article class="metric-card ${card.tone}">
          <span class="metric-label">${card.label}</span>
          <strong class="metric-value">${card.value}</strong>
          <span class="metric-caption">${card.caption}</span>
        </article>
      `
    )
    .join("");
}

function buildSummary(data, metrics, config) {
  const summary = [
    `${formatNumber(data.quantity)} ${config.plural} dentro del ${config.groupLabel} producen ${formatNumber(metrics.totalProduction)} ${config.unitPlural} y ${formatCurrency(metrics.grossIncome)} en ingresos brutos.`,
    `Cada ${config.name.toLowerCase()} del lote aporta en promedio ${formatCurrency(metrics.revenuePerAnimal)} de ingreso y ${formatCurrency(metrics.profitPerAnimal)} de utilidad neta.`,
    `El costo estimado es ${formatCurrency(metrics.costPerUnit)} por ${config.unitSingular}, frente a un precio de venta de ${formatCurrency(data.price)}.`,
    buildBreakEvenMessage(metrics, config)
  ];

  if (data.expenses === 0) {
    summary.push("Registraste gastos en cero. La lectura del predio puede verse inflada si faltan insumos o costos de manejo por incluir.");
  }

  return summary;
}

function buildRecommendations(data, metrics, config) {
  const recommendations = [];

  if (data.expenses === 0) {
    recommendations.push(
      "Incluye alimentacion, mano de obra, sanidad, transporte y otros costos del predio para evitar una rentabilidad inflada."
    );
  }

  if (metrics.netProfit < 0) {
    recommendations.push(
      `Hoy la operacion pierde ${formatCurrency(Math.abs(metrics.netProfit))}. Necesitas subir el precio a por lo menos ${formatCurrency(metrics.breakEvenPrice)} por ${config.unitSingular} o reducir ese mismo valor en costos.`
    );
  } else if (metrics.margin < 15) {
    recommendations.push(
      "El margen es estrecho. Revisa costos variables y gastos indirectos antes de crecer el lote o comprometer mas capital."
    );
  } else {
    recommendations.push(
      "El corte luce rentable. Puedes usarlo como base para comparar otro proveedor, otro lote o una nueva estrategia de alimentacion."
    );
  }

  if (metrics.unitsAboveBreakEven < 0) {
    recommendations.push(
      `La produccion actual no cubre el punto de equilibrio. Te faltan ${formatNumber(Math.abs(metrics.unitsAboveBreakEven))} ${config.unitPlural} en el mismo periodo para empatar.`
    );
  } else {
    recommendations.push(
      `Superas el punto de equilibrio por ${formatNumber(metrics.unitsAboveBreakEven)} ${config.unitPlural}, lo que deja un colchon operativo util para la finca.`
    );
  }

  if (metrics.costPerUnit >= data.price) {
    recommendations.push(
      `Cada ${config.unitSingular} cuesta ${formatCurrency(metrics.costPerUnit)} y se vende en ${formatCurrency(data.price)}. Ajustar precio o costo es prioritario.`
    );
  }

  recommendations.push(config.optimizationTip);

  return recommendations.slice(0, 4);
}

function buildBreakEvenMessage(metrics, config) {
  if (metrics.unitsAboveBreakEven >= 0) {
    return `Necesitas vender al menos ${formatNumber(metrics.breakEvenUnits)} ${config.unitPlural} para cubrir costos. Con el corte actual superas ese nivel por ${formatNumber(metrics.unitsAboveBreakEven)} ${config.unitPlural}.`;
  }

  return `El punto de equilibrio esta en ${formatNumber(metrics.breakEvenUnits)} ${config.unitPlural}, equivalentes a ${formatNumber(metrics.breakEvenAnimals)} ${config.plural} al ritmo actual. Todavia faltan ${formatNumber(Math.abs(metrics.unitsAboveBreakEven))} ${config.unitPlural} para alcanzarlo.`;
}

function getPerformanceStatus(data, metrics) {
  if (data.expenses === 0 && metrics.grossIncome > 0) {
    return {
      tone: "warning",
      label: "Revisar costos",
      headline:
      "El corte genera ingresos, pero con gastos en cero la rentabilidad del predio puede verse artificialmente alta.",
      signalText:
        "La lectura es prometedora, pero antes de confiar en ella debes registrar todos los costos reales del manejo."
    };
  }

  if (metrics.netProfit < 0) {
    return {
      tone: "critical",
      label: "En perdida",
      headline: `La operacion del predio proyecta una perdida de ${formatCurrency(Math.abs(metrics.netProfit))}. Se necesita ajustar precio, produccion o costos para recuperar el equilibrio.`,
      signalText:
        "La operacion no esta cubriendo sus costos. La prioridad debe ser frenar la perdida y recuperar el margen."
    };
  }

  if (metrics.margin < 12) {
    return {
      tone: "warning",
      label: "Margen bajo",
      headline: `La operacion rural sigue en positivo, pero el margen es de solo ${formatPercent(metrics.margin)}%. El negocio necesita mas holgura.`,
      signalText:
        "Hay utilidad, pero el colchon es muy corto. Cualquier subida en costos puede borrar la ganancia."
    };
  }

  if (metrics.margin < 28) {
    return {
      tone: "stable",
      label: "Saludable",
      headline: `La operacion del lote muestra una utilidad neta de ${formatCurrency(metrics.netProfit)} con un margen de ${formatPercent(metrics.margin)}%.`,
      signalText:
        "El corte es funcional y deja margen. Vale la pena seguir afinando costos del predio para fortalecer la rentabilidad."
    };
  }

  return {
    tone: "strong",
    label: "Fuerte",
      headline: `La operacion se ve robusta en el predio: ${formatCurrency(metrics.netProfit)} de utilidad neta y ${formatPercent(metrics.margin)}% de margen.`,
    signalText:
      "La rentabilidad es fuerte y el corte resiste mejor variaciones razonables en costos o precio."
  };
}

function getComparisonSnapshot(data, metrics, skipIndex = null) {
  const baselineEntry = historyEntries.find(
    (entry, index) => index !== skipIndex && entry.animalKey === data.animalKey
  );

  if (!baselineEntry) {
    return null;
  }

  const baselineMetrics = calculateIndicators(baselineEntry);

  return {
    baselineEntry,
    deltaProfit: metrics.netProfit - baselineMetrics.netProfit,
    deltaMargin: metrics.margin - baselineMetrics.margin,
    deltaRevenue: metrics.grossIncome - baselineMetrics.grossIncome,
    deltaCostPerUnit: metrics.costPerUnit - baselineMetrics.costPerUnit,
    deltaBreakEvenUnits: metrics.breakEvenUnits - baselineMetrics.breakEvenUnits
  };
}

function buildComparisonMarkup(comparison, config) {
  const summary = buildComparisonSummary(comparison);

  return `
    <p class="comparison-reference">
      Referencia mas reciente del ${config.groupLabel}: ${formatDate(comparison.baselineEntry.timestamp)}.
    </p>
    <p>${summary}</p>
    <div class="delta-list">
      ${buildDeltaRow("Utilidad del corte", formatSignedCurrency(comparison.deltaProfit), comparison.deltaProfit)}
      ${buildDeltaRow("Margen neto", `${formatSignedPercent(comparison.deltaMargin)} pts`, comparison.deltaMargin)}
      ${buildDeltaRow("Ingreso del lote", formatSignedCurrency(comparison.deltaRevenue), comparison.deltaRevenue)}
      ${buildDeltaRow("Costo por unidad", formatSignedCurrency(comparison.deltaCostPerUnit), comparison.deltaCostPerUnit, true)}
      ${buildDeltaRow("Punto de equilibrio", `${formatSignedNumber(comparison.deltaBreakEvenUnits)} ${config.unitPlural}`, comparison.deltaBreakEvenUnits, true)}
    </div>
  `;
}

function buildComparisonSummary(comparison) {
  const improvingProfit = comparison.deltaProfit > 0;
  const improvingMargin = comparison.deltaMargin > 0;

  if (improvingProfit && improvingMargin) {
    return "El corte actual mejora frente a la ultima referencia: deja mas plata y sostiene un margen mas saludable para la finca.";
  }

  if (!improvingProfit && !improvingMargin) {
    return "El corte actual se debilita frente a la ultima referencia: pierde utilidad y el margen se hace mas estrecho.";
  }

  return "El corte cambia de forma mixta frente a la ultima referencia. Conviene revisar si el ingreso extra compensa la presion sobre costos o margen.";
}

function buildDeltaRow(label, value, delta, lowerIsBetter = false) {
  const tone = getDeltaTone(delta, lowerIsBetter);
  const descriptor = getDeltaDescriptor(tone, lowerIsBetter);

  return `
    <div class="delta-row">
      <div>
        <strong>${label}</strong>
        <span>${descriptor}</span>
      </div>
      <span class="delta-value ${tone}">${value}</span>
    </div>
  `;
}

function getDeltaTone(delta, lowerIsBetter = false) {
  if (delta === 0) {
    return "neutral";
  }

  if (lowerIsBetter) {
    return delta < 0 ? "positive" : "negative";
  }

  return delta > 0 ? "positive" : "negative";
}

function getDeltaDescriptor(tone, lowerIsBetter = false) {
  if (tone === "neutral") {
    return "Sin cambio relevante frente a la referencia.";
  }

  if (lowerIsBetter) {
    return tone === "positive"
      ? "Mejora porque este indicador baja."
      : "Se deteriora porque este indicador sube.";
  }

  return tone === "positive"
    ? "Mejora frente a la referencia."
    : "Cae frente a la referencia.";
}

function buildForecastScenarios(data) {
  const variants = [
    {
      key: "conservative",
      label: "Tiempo apretado",
      chip: "precio flojo | costo alto",
      priceFactor: 0.92,
      expenseFactor: 1.08,
      caption: "Simula una venta mas dificil y una finca con mayor presion de insumos."
    },
    {
      key: "base",
      label: "Corte actual",
      chip: "manejo actual",
      priceFactor: 1,
      expenseFactor: 1,
      caption: "Mantiene exactamente el corte productivo que acabas de registrar."
    },
    {
      key: "optimistic",
      label: "Buen levante",
      chip: "mejor venta | menos costo",
      priceFactor: 1.08,
      expenseFactor: 0.95,
      caption: "Proyecta una mejor negociacion comercial y una operacion rural mas afinada."
    }
  ];

  return variants.map((variant) => {
    const adjustedData = {
      ...data,
      price: roundValue(data.price * variant.priceFactor),
      expenses: roundValue(data.expenses * variant.expenseFactor)
    };

    return {
      ...variant,
      data: adjustedData,
      metrics: calculateIndicators(adjustedData)
    };
  });
}

function buildForecastCard(forecast, config, baseMetrics) {
  const profitDelta = forecast.metrics.netProfit - baseMetrics.netProfit;
  const deltaLabel =
    forecast.key === "base" ? "Referencia del corte" : `Utilidad ${formatSignedCurrency(profitDelta)}`;

  return `
    <article class="forecast-card ${forecast.key}">
      <strong class="forecast-label">${forecast.label}</strong>
      <span class="forecast-chip">${forecast.chip}</span>
      <span class="forecast-profit">${formatCurrency(forecast.metrics.netProfit)}</span>
      <div class="forecast-metrics">
        <span>Margen: ${formatPercent(forecast.metrics.margin)}%</span>
        <span>Equilibrio: ${formatNumber(forecast.metrics.breakEvenUnits)} ${config.unitPlural}</span>
        <span>${deltaLabel}</span>
      </div>
      <p class="forecast-caption">${forecast.caption}</p>
    </article>
  `;
}

function renderChart(metrics) {
  if (!refs.resultsChart) {
    return;
  }

  if (!window.Chart) {
    refs.chartMessage.textContent =
      "No se pudo cargar la libreria de graficas. La calculadora sigue funcionando, pero sin visualizacion comparativa.";
    refs.chartMessage.classList.remove("hidden");
    return;
  }

  const ctx = refs.resultsChart.getContext("2d");

  if (!ctx) {
    return;
  }

  if (chartInstance) {
    chartInstance.destroy();
  }

  refs.chartMessage.classList.add("hidden");

  const profitColor = metrics.netProfit >= 0 ? "#3c7d57" : "#b4543a";
  const suggestedMin = metrics.netProfit < 0 ? metrics.netProfit * 1.25 : 0;

  chartInstance = new window.Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Ingreso del lote", "Costo del manejo", "Utilidad del corte"],
      datasets: [
        {
          data: [metrics.grossIncome, metrics.expenses, metrics.netProfit],
          backgroundColor: ["#2f6b45", "#d6942b", profitColor],
          borderRadius: 16,
          maxBarThickness: 64
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 650
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label(context) {
              return formatCurrency(context.parsed.y);
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          suggestedMin,
          ticks: {
            callback(value) {
              return `$${compactFormatter.format(value)}`;
            }
          }
        }
      }
    }
  });
}

function saveHistory(data, metrics, timestamp = new Date().toISOString()) {
  const nextEntry = {
    ...data,
    totalProduction: metrics.totalProduction,
    grossIncome: metrics.grossIncome,
    netProfit: metrics.netProfit,
    margin: metrics.margin,
    timestamp
  };

  const firstEntry = historyEntries[0];

  if (
    firstEntry &&
    firstEntry.animalKey === nextEntry.animalKey &&
    firstEntry.quantity === nextEntry.quantity &&
    firstEntry.production === nextEntry.production &&
    firstEntry.price === nextEntry.price &&
    firstEntry.expenses === nextEntry.expenses
  ) {
    historyEntries[0] = nextEntry;
  } else {
    historyEntries.unshift(nextEntry);
  }

  historyEntries = historyEntries.slice(0, 8);
  persistHistory();
}

function renderHistory() {
  if (!historyEntries.length) {
    refs.historyList.classList.add("empty-state");
    refs.historyList.innerHTML =
      "<p>Todavia no hay cortes guardados. Cada registro del predio quedara guardado aqui.</p>";
    return;
  }

  refs.historyList.classList.remove("empty-state");
  refs.historyList.innerHTML = historyEntries
    .map((entry, index) => {
      const config = animalConfig[entry.animalKey];
      const profitClass = entry.netProfit >= 0 ? "positive" : "negative";
      const profitLabel = entry.netProfit >= 0 ? "Utilidad" : "Perdida";

      return `
        <button type="button" class="history-item" data-index="${index}">
          <div class="history-main">
            <div>
              <strong>${config.lineLabel}</strong>
              <p>${formatDate(entry.timestamp)}</p>
            </div>
            <span class="history-chip ${profitClass}">
              ${profitLabel} ${formatCurrency(entry.netProfit)}
            </span>
          </div>
          <div class="history-meta">
            <span>${formatNumber(entry.quantity)} ${config.plural}</span>
            <span>${formatNumber(entry.totalProduction)} ${config.unitPlural}</span>
            <span>Margen ${formatPercent(entry.margin)}%</span>
          </div>
        </button>
      `;
    })
    .join("");
}

function resetDashboard(animalKey = "") {
  const prompt = animalKey
    ? `Completa los datos de ${animalConfig[animalKey].lineLabel.toLowerCase()} para generar el reporte rural del predio.`
    : "Selecciona una linea pecuaria e ingresa los datos del predio para obtener una lectura clara del corte productivo.";

  currentSnapshot = null;
  refs.statusBadge.className = "status-badge neutral";
  refs.statusBadge.textContent = "Sin corte";
  refs.scenarioMeta.textContent = "Todavia no hay un corte activo del predio para exportar o imprimir.";
  refs.resultHeadline.textContent = prompt;
  refs.metricsGrid.innerHTML =
    '<div class="empty-card">Los indicadores apareceran aqui cuando completes un corte productivo.</div>';
  refs.summaryList.className = "detail-list empty-state";
  refs.summaryList.innerHTML = "<p>Aun no hay resultados para interpretar.</p>";
  refs.recommendationsList.className = "detail-list empty-state";
  refs.recommendationsList.innerHTML =
    "<p>Cuando hagas un calculo, aqui veras sugerencias para fortalecer el manejo del predio.</p>";
  refs.financialSignal.textContent =
    "Aqui se mostrara una lectura rapida del rendimiento del lote evaluado.";
  refs.breakEvenText.textContent =
    "Aun no hay datos suficientes del predio para calcular el punto de equilibrio.";
  refs.comparisonContent.className = "detail-list empty-state";
  refs.comparisonContent.innerHTML =
    "<p>Cuando tengas mas de un corte del mismo animal, aqui veras una comparacion automatica contra la referencia mas reciente.</p>";
  refs.forecastGrid.className = "forecast-grid empty-state";
  refs.forecastGrid.innerHTML =
    "<p>Calcula un corte para generar simulaciones de manejo mas defensivas o mas favorables.</p>";
  refs.chartMessage.textContent =
    "Calcula un corte para ver la grafica comparativa entre ingreso del lote, costo del manejo y utilidad.";
  refs.chartMessage.classList.remove("hidden");

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

function loadHistory() {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsed = JSON.parse(storedValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function persistHistory() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(historyEntries));
  } catch (error) {
    setFeedback("No fue posible guardar la bitacora del predio en este navegador.", "warning");
  }
}

function buildCsvReport(snapshot) {
  const config = animalConfig[snapshot.data.animalKey];
  const lines = [["Seccion", "Indicador", "Valor"]];

  pushCsvRow(lines, "Corte", "Animal", config.name);
  pushCsvRow(lines, "Corte", "Linea", config.lineLabel);
  pushCsvRow(lines, "Corte", "Cantidad", snapshot.data.quantity);
  pushCsvRow(lines, "Corte", "Produccion por animal", snapshot.data.production);
  pushCsvRow(lines, "Corte", "Precio unitario", formatCurrency(snapshot.data.price));
  pushCsvRow(lines, "Corte", "Gastos", formatCurrency(snapshot.data.expenses));
  pushCsvRow(lines, "Corte", "Fecha de analisis", formatDate(snapshot.timestamp));

  pushCsvRow(lines, "Indicadores", "Produccion total", `${formatNumber(snapshot.metrics.totalProduction)} ${config.unitPlural}`);
  pushCsvRow(lines, "Indicadores", "Ingreso del lote", formatCurrency(snapshot.metrics.grossIncome));
  pushCsvRow(lines, "Indicadores", "Utilidad del corte", formatCurrency(snapshot.metrics.netProfit));
  pushCsvRow(lines, "Indicadores", "Margen neto", `${formatPercent(snapshot.metrics.margin)}%`);
  pushCsvRow(lines, "Indicadores", "ROI", `${formatPercent(snapshot.metrics.roi)}%`);
  pushCsvRow(lines, "Indicadores", "Costo por animal", formatCurrency(snapshot.metrics.costPerAnimal));
  pushCsvRow(lines, "Indicadores", "Costo por unidad", formatCurrency(snapshot.metrics.costPerUnit));
  pushCsvRow(lines, "Indicadores", "Punto de equilibrio", `${formatNumber(snapshot.metrics.breakEvenUnits)} ${config.unitPlural}`);

  if (snapshot.comparison) {
    pushCsvRow(lines, "Comparacion", "Referencia", formatDate(snapshot.comparison.baselineEntry.timestamp));
    pushCsvRow(lines, "Comparacion", "Delta utilidad", formatSignedCurrency(snapshot.comparison.deltaProfit));
    pushCsvRow(lines, "Comparacion", "Delta margen", `${formatSignedPercent(snapshot.comparison.deltaMargin)} pts`);
    pushCsvRow(lines, "Comparacion", "Delta ingreso", formatSignedCurrency(snapshot.comparison.deltaRevenue));
    pushCsvRow(lines, "Comparacion", "Delta costo por unidad", formatSignedCurrency(snapshot.comparison.deltaCostPerUnit));
    pushCsvRow(lines, "Comparacion", "Delta punto de equilibrio", formatSignedNumber(snapshot.comparison.deltaBreakEvenUnits));
  }

  snapshot.forecasts.forEach((forecast) => {
    pushCsvRow(lines, `Proyeccion ${forecast.label}`, "Utilidad del corte", formatCurrency(forecast.metrics.netProfit));
    pushCsvRow(lines, `Proyeccion ${forecast.label}`, "Margen", `${formatPercent(forecast.metrics.margin)}%`);
    pushCsvRow(lines, `Proyeccion ${forecast.label}`, "Punto de equilibrio", `${formatNumber(forecast.metrics.breakEvenUnits)} ${config.unitPlural}`);
  });

  return lines.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}

function pushCsvRow(lines, section, label, value) {
  lines.push([section, label, String(value)]);
}

function escapeCsvValue(value) {
  const normalizedValue = String(value).replace(/"/g, '""');
  return `"${normalizedValue}"`;
}

function buildExportFileName(snapshot) {
  const safeTimestamp = snapshot.timestamp.replace(/[:.]/g, "-");
  return `calculadora-ganadera-${snapshot.data.animalKey}-${safeTimestamp}.csv`;
}

function buildScenarioMeta(data, metrics, config, timestamp) {
  return `Corte activo: ${config.lineLabel} | ${formatNumber(data.quantity)} ${config.plural} en ${config.groupLabel} | ${formatNumber(metrics.totalProduction)} ${config.unitPlural} | actualizado ${formatDate(timestamp)}.`;
}

function buildBulletList(items) {
  return `<ul class="bullet-list">${items
    .map((item) => `<li>${item}</li>`)
    .join("")}</ul>`;
}

function setFeedback(message, tone) {
  refs.feedback.textContent = message;
  refs.feedback.className = `feedback ${tone}`;
}

function clearFeedback() {
  refs.feedback.textContent = "";
  refs.feedback.className = "feedback";
}

function clearSelectValidation() {
  refs.animalSelect.removeAttribute("aria-invalid");
}

function roundValue(value) {
  return Math.round(value * 100) / 100;
}

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

function formatSignedCurrency(value) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatCurrency(Math.abs(value))}`;
}

function formatPercent(value) {
  return percentFormatter.format(value);
}

function formatSignedPercent(value) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatPercent(Math.abs(value))}`;
}

function formatNumber(value) {
  return numberFormatter.format(value);
}

function formatSignedNumber(value) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatNumber(Math.abs(value))}`;
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(timestamp));
}
