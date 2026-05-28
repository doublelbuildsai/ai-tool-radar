const state = {
  tools: [],
  filters: {
    category: "all",
    readiness: "all"
  },
  query: ""
};

const elements = {
  grid: document.querySelector("#tool-grid"),
  emptyState: document.querySelector("#empty-state"),
  search: document.querySelector("#search"),
  total: document.querySelector("#metric-total"),
  adopt: document.querySelector("#metric-adopt"),
  pilot: document.querySelector("#metric-pilot"),
  updated: document.querySelector("#metric-updated"),
  chips: Array.from(document.querySelectorAll(".chip"))
};

const readinessOrder = {
  Adopt: 0,
  Pilot: 1,
  Watch: 2
};

init();

async function init() {
  try {
    const response = await fetch("./data/tools.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Unable to load tools.json: ${response.status}`);
    }

    state.tools = await response.json();
    bindEvents();
    render();
  } catch (error) {
    renderError(error);
  }
}

function bindEvents() {
  elements.search.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    render();
  });

  elements.chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const group = chip.dataset.filterGroup;
      const value = chip.dataset.filterValue;
      state.filters[group] = value;

      elements.chips
        .filter((candidate) => candidate.dataset.filterGroup === group)
        .forEach((candidate) => {
          candidate.classList.toggle("active", candidate === chip);
        });

      render();
    });
  });
}

function render() {
  const tools = getVisibleTools();
  renderMetrics();
  renderTools(tools);
}

function getVisibleTools() {
  return [...state.tools]
    .sort((left, right) => {
      const readinessDelta = readinessOrder[left.readiness] - readinessOrder[right.readiness];
      return readinessDelta || left.name.localeCompare(right.name);
    })
    .filter((tool) => {
      const matchesCategory =
        state.filters.category === "all" || tool.category === state.filters.category;
      const matchesReadiness =
        state.filters.readiness === "all" || tool.readiness === state.filters.readiness;
      const matchesQuery = !state.query || getSearchText(tool).includes(state.query);
      return matchesCategory && matchesReadiness && matchesQuery;
    });
}

function getSearchText(tool) {
  return [
    tool.name,
    tool.company,
    tool.category,
    tool.status,
    tool.readiness,
    tool.summary,
    tool.builderUseCase,
    tool.watchItem,
    ...tool.tags
  ]
    .join(" ")
    .toLowerCase();
}

function renderMetrics() {
  const adoptCount = state.tools.filter((tool) => tool.readiness === "Adopt").length;
  const pilotCount = state.tools.filter((tool) => tool.readiness === "Pilot").length;
  const latestDate = state.tools
    .map((tool) => tool.lastVerified)
    .sort()
    .at(-1);

  elements.total.textContent = String(state.tools.length);
  elements.adopt.textContent = String(adoptCount);
  elements.pilot.textContent = String(pilotCount);
  elements.updated.textContent = latestDate ? formatShortDate(latestDate) : "-";
}

function renderTools(tools) {
  elements.grid.replaceChildren(...tools.map(createToolCard));
  elements.emptyState.hidden = tools.length > 0;
}

function createToolCard(tool) {
  const card = document.createElement("article");
  card.className = "tool-card";

  card.innerHTML = `
    <div class="tool-card-header">
      <div class="tool-title">
        <h3>${escapeHtml(tool.name)}</h3>
        <span class="company">${escapeHtml(tool.company)} · ${escapeHtml(tool.category)}</span>
      </div>
      <span class="status-pill">${escapeHtml(tool.status)}</span>
    </div>
    <p class="summary">${escapeHtml(tool.summary)}</p>
    <div>
      <span class="field-label">Builder use case</span>
      <p class="use-case">${escapeHtml(tool.builderUseCase)}</p>
    </div>
    <div>
      <span class="field-label">Watch item</span>
      <p class="watch-item">${escapeHtml(tool.watchItem)}</p>
    </div>
    <div class="tag-list" aria-label="${escapeHtml(tool.name)} tags">
      ${tool.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
    </div>
    <div class="source-row">
      <a class="source-link" href="${escapeAttribute(tool.sourceUrl)}" target="_blank" rel="noreferrer">
        Source
      </a>
      <span class="confidence">${escapeHtml(tool.confidence)} confidence · ${escapeHtml(tool.readiness)}</span>
    </div>
  `;

  return card;
}

function renderError(error) {
  elements.grid.innerHTML = "";
  elements.emptyState.hidden = false;
  elements.emptyState.textContent = error.message;
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00Z`));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

