import { getSupabase } from "./supabase-client.js";

const SITE_ROW_ID = "main";

const TAB_KEYS = ["agenda", "eventos", "calendario", "trotes", "interclasse", "gebe"];
const TAB_LABELS = {
  agenda: "Geral",
  eventos: "Eventos",
  calendario: "Calendário",
  trotes: "Trotes",
  interclasse: "Interclasse",
  gebe: "Gebe",
};

function defaultContent() {
  return {
    v: 1,
    geralIntro: "",
    agenda: [],
    eventos: [],
    calendario: [],
    trotesItems: [],
    interclasseItems: [],
    gebeItems: [],
    trotes: "",
    interclasse: "",
  };
}

function normalizePayload(o) {
  if (!o || typeof o !== "object") return defaultContent();
  return {
    ...defaultContent(),
    ...o,
    agenda: Array.isArray(o.agenda) ? o.agenda : [],
    eventos: Array.isArray(o.eventos) ? o.eventos : [],
    calendario: Array.isArray(o.calendario) ? o.calendario : [],
    trotesItems: Array.isArray(o.trotesItems) ? o.trotesItems : [],
    interclasseItems: Array.isArray(o.interclasseItems) ? o.interclasseItems : [],
    gebeItems: Array.isArray(o.gebeItems) ? o.gebeItems : [],
  };
}

async function load() {
  const supabase = await getSupabase();
  if (!supabase) return defaultContent();
  const { data, error } = await supabase.from("site_content").select("payload").eq("id", SITE_ROW_ID).maybeSingle();
  if (error) {
    console.error("fsstore load:", error);
    return defaultContent();
  }
  if (!data || data.payload == null) return defaultContent();
  return normalizePayload(data.payload);
}

async function saveRemote(data) {
  const supabase = await getSupabase();
  if (!supabase) throw new Error("Supabase não configurado.");
  const { error } = await supabase.from("site_content").upsert(
    {
      id: SITE_ROW_ID,
      payload: data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

async function getSession() {
  const supabase = await getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

function uid() {
  return "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emptyBlock(title, hint) {
  return (
    '<div class="panel-empty">' +
    '<p class="panel-empty__title">' +
    escapeHtml(title) +
    "</p>" +
    '<p class="panel-empty__hint">' +
    escapeHtml(hint) +
    "</p>" +
    "</div>"
  );
}

const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const MONTH_ABBR_PT = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEKDAYS_FULL = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

function pad2(n) {
  return n < 10 ? "0" + n : String(n);
}

function isoFromYmd(y, m1, d) {
  return `${y}-${pad2(m1)}-${pad2(d)}`;
}

/** @returns {{ start: Date, end: Date, display: string } | null} */
function parseItemDateRange(item) {
  const s = String(item.date || "").trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    const start = new Date(y, m - 1, d, 12, 0, 0);
    return { start, end: start, display: formatBrFromParts(d, m, y) };
  }
  const rangeRe =
    /de\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+até\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})/i.exec(s);
  if (rangeRe) {
    let y1 = +rangeRe[3];
    let y2 = +rangeRe[6];
    if (y1 < 100) y1 += 2000;
    if (y2 < 100) y2 += 2000;
    const start = new Date(y1, +rangeRe[2] - 1, +rangeRe[1], 12, 0, 0);
    const end = new Date(y2, +rangeRe[5] - 1, +rangeRe[4], 12, 0, 0);
    if (start > end) return { start: end, end: start, display: s };
    return { start, end, display: s };
  }
  /* de 29/06 até 03/07 (sem ano: ano corrente; atravessa ano se o fim for antes do início no mesmo ano) */
  const rangeShort = /de\s+(\d{1,2})\/(\d{1,2})\s+até\s+(\d{1,2})\/(\d{1,2})\b/i.exec(s);
  if (rangeShort) {
    const d1 = +rangeShort[1];
    const m1 = +rangeShort[2];
    const d2 = +rangeShort[3];
    const m2 = +rangeShort[4];
    if (m1 >= 1 && m1 <= 12 && m2 >= 1 && m2 <= 12 && d1 >= 1 && d1 <= 31 && d2 >= 1 && d2 <= 31) {
      const y = new Date().getFullYear();
      const start = new Date(y, m1 - 1, d1, 12, 0, 0);
      let end = new Date(y, m2 - 1, d2, 12, 0, 0);
      if (end < start) {
        end = new Date(y + 1, m2 - 1, d2, 12, 0, 0);
      }
      return { start, end, display: s };
    }
  }
  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(s);
  if (br) {
    let y = +br[3];
    if (y < 100) y += 2000;
    const start = new Date(y, +br[2] - 1, +br[1], 12, 0, 0);
    return { start, end: start, display: s };
  }
  const shortBr = /^(\d{1,2})\/(\d{1,2})$/.exec(s);
  if (shortBr) {
    const y = new Date().getFullYear();
    const start = new Date(y, +shortBr[2] - 1, +shortBr[1], 12, 0, 0);
    return { start, end: start, display: s };
  }
  return null;
}

function formatBrFromParts(d, m, y) {
  return `${pad2(d)}/${pad2(m)}/${y}`;
}

function itemCoversLocalDay(item, y, m0, d) {
  const r = parseItemDateRange(item);
  if (!r) return false;
  const t = new Date(y, m0, d, 12, 0, 0);
  return t >= r.start && t <= r.end;
}

function tryTextDateToIso(s) {
  if (!s || typeof s !== "string") return "";
  const t = s.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(t);
  if (br) {
    let y = +br[3];
    if (y < 100) y += 2000;
    return isoFromYmd(y, +br[2], +br[1]);
  }
  return "";
}

function buildCalendarShell() {
  return (
    '<div class="calendar-view">' +
    '<div class="calendar-nav">' +
    '<button type="button" class="calendar-nav__btn" data-cal-prev aria-label="Mês anterior">‹</button>' +
    '<span class="calendar-nav__title" data-cal-month-title></span>' +
    '<button type="button" class="calendar-nav__btn" data-cal-next aria-label="Próximo mês">›</button>' +
    "</div>" +
    '<div class="calendar-weekdays" role="row" aria-label="Dias da semana (domingo a sábado)">' +
    WEEKDAYS_SHORT.map(
      (w, i) =>
        '<span class="calendar-weekdays__cell" title="' +
        escapeHtml(WEEKDAYS_FULL[i]) +
        '">' +
        escapeHtml(w) +
        "</span>"
    ).join("") +
    "</div>" +
    '<div class="calendar-grid" data-cal-grid role="grid" aria-label="Dias do mês"></div>' +
    '<div class="calendar-strip">' +
    '<button type="button" class="calendar-strip__nav" data-cal-strip-prev aria-label="Dia anterior">‹</button>' +
    '<span class="calendar-strip__wrap"><input type="date" class="calendar-strip__input" data-cal-strip-date aria-label="Ir para data" /></span>' +
    '<button type="button" class="calendar-strip__nav" data-cal-strip-next aria-label="Próximo dia">›</button>' +
    "</div>" +
    '<p class="calendar-selected-label" data-cal-selected-label></p>' +
    '<div class="calendar-events" data-cal-events></div>' +
    "</div>"
  );
}

function calendarEventItemHtml(item, selY, selM, selD) {
  const r = parseItemDateRange(item);
  const whenLine = r ? r.display : String(item.date || "").trim() || "—";
  const badge =
    '<div class="calendar-day-event__badge">' +
    '<span class="calendar-day-event__num">' +
    selD +
    "</span>" +
    '<span class="calendar-day-event__mon">' +
    escapeHtml(MONTH_ABBR_PT[selM]) +
    "</span>" +
    "</div>";
  const title = item.title && String(item.title).trim() ? item.title : "Evento";
  return (
    '<article class="agenda__item calendar-day-event">' +
    badge +
    '<div class="agenda__meta">' +
    '<div class="agenda__title">' +
    escapeHtml(title) +
    "</div>" +
    (item.desc
      ? '<div class="agenda__desc">' + escapeHtml(item.desc).replace(/\n/g, "<br>") + "</div>"
      : "") +
    '<div class="calendar-day-event__when">' +
    escapeHtml(whenLine) +
    "</div>" +
    "</div>" +
    "</article>"
  );
}

function initCalendarView(root, items) {
  const navPrev = root.querySelector("[data-cal-prev]");
  const navNext = root.querySelector("[data-cal-next]");
  const monthTitle = root.querySelector("[data-cal-month-title]");
  const grid = root.querySelector("[data-cal-grid]");
  const stripInput = root.querySelector("[data-cal-strip-date]");
  const stripPrev = root.querySelector("[data-cal-strip-prev]");
  const stripNext = root.querySelector("[data-cal-strip-next]");
  const labelEl = root.querySelector("[data-cal-selected-label]");
  const eventsEl = root.querySelector("[data-cal-events]");
  if (!grid || !monthTitle || !eventsEl) return;

  const today = new Date();
  let viewY = today.getFullYear();
  let viewM = today.getMonth();
  let selY = viewY;
  let selM = viewM;
  let selD = today.getDate();

  function isToday(y, m, d) {
    return y === today.getFullYear() && m === today.getMonth() && d === today.getDate();
  }

  function itemsForDay(y, m0, d) {
    return items.filter((it) => itemCoversLocalDay(it, y, m0, d));
  }

  function dayHasEvent(y, m0, d) {
    return items.some((it) => itemCoversLocalDay(it, y, m0, d));
  }

  function paint() {
    monthTitle.textContent = `${MONTHS_PT[viewM]} ${viewY}`;
    if (stripInput) stripInput.value = isoFromYmd(selY, selM + 1, selD);
    if (labelEl) {
      labelEl.textContent = isToday(selY, selM, selD) ? "Hoje" : "Eventos neste dia";
    }

    const dim = new Date(viewY, viewM + 1, 0).getDate();
    const first = new Date(viewY, viewM, 1);
    const pad = first.getDay();
    const prevDim = new Date(viewY, viewM, 0).getDate();

    const cells = [];
    for (let i = 0; i < pad; i++) {
      const d = prevDim - pad + i + 1;
      const pm = viewM === 0 ? 11 : viewM - 1;
      const py = viewM === 0 ? viewY - 1 : viewY;
      cells.push({ y: py, m: pm, d, muted: true });
    }
    for (let d = 1; d <= dim; d++) {
      cells.push({ y: viewY, m: viewM, d, muted: false });
    }
    const total = cells.length;
    const tail = (7 - (total % 7)) % 7;
    let nd = 1;
    const nm = viewM === 11 ? 0 : viewM + 1;
    const ny = viewM === 11 ? viewY + 1 : viewY;
    for (let i = 0; i < tail; i++) {
      cells.push({ y: ny, m: nm, d: nd++, muted: true });
    }

    grid.replaceChildren();
    cells.forEach((cell) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "calendar-day";
      if (cell.muted) btn.classList.add("calendar-day--muted");
      if (dayHasEvent(cell.y, cell.m, cell.d)) btn.classList.add("calendar-day--has-events");
      if (selY === cell.y && selM === cell.m && selD === cell.d) btn.classList.add("calendar-day--selected");
      if (isToday(cell.y, cell.m, cell.d)) btn.classList.add("calendar-day--today");
      const num = document.createElement("span");
      num.className = "calendar-day__num";
      num.textContent = String(cell.d);
      btn.appendChild(num);
      btn.addEventListener("click", () => {
        selY = cell.y;
        selM = cell.m;
        selD = cell.d;
        paint();
      });
      grid.appendChild(btn);
    });

    const list = itemsForDay(selY, selM, selD);
    if (list.length === 0) {
      eventsEl.innerHTML = '<p class="calendar-events-empty">Nenhum evento neste dia.</p>';
    } else {
      eventsEl.innerHTML = list.map((item) => calendarEventItemHtml(item, selY, selM, selD)).join("");
    }
  }

  if (navPrev) {
    navPrev.addEventListener("click", () => {
      if (viewM === 0) {
        viewM = 11;
        viewY--;
      } else viewM--;
      paint();
    });
  }
  if (navNext) {
    navNext.addEventListener("click", () => {
      if (viewM === 11) {
        viewM = 0;
        viewY++;
      } else viewM++;
      paint();
    });
  }
  if (stripPrev) {
    stripPrev.addEventListener("click", () => {
      const dt = new Date(selY, selM, selD);
      dt.setDate(dt.getDate() - 1);
      selY = dt.getFullYear();
      selM = dt.getMonth();
      selD = dt.getDate();
      viewY = selY;
      viewM = selM;
      paint();
    });
  }
  if (stripNext) {
    stripNext.addEventListener("click", () => {
      const dt = new Date(selY, selM, selD);
      dt.setDate(dt.getDate() + 1);
      selY = dt.getFullYear();
      selM = dt.getMonth();
      selD = dt.getDate();
      viewY = selY;
      viewM = selM;
      paint();
    });
  }
  if (stripInput) {
    stripInput.addEventListener("change", () => {
      const v = stripInput.value;
      if (!v) return;
      const [y, m, d] = v.split("-").map(Number);
      selY = y;
      selM = m - 1;
      selD = d;
      viewY = selY;
      viewM = selM;
      paint();
    });
  }

  paint();
}

function agendaBlock(items) {
  return (
    '<div class="agenda">' +
    items
      .map(
        (item) =>
          '<article class="agenda__item">' +
          '<div class="agenda__date">' +
          escapeHtml(item.date || "—") +
          "</div>" +
          '<div class="agenda__meta">' +
          '<div class="agenda__title">' +
          escapeHtml(item.title) +
          "</div>" +
          (item.desc ? '<div class="agenda__desc">' + escapeHtml(item.desc).replace(/\n/g, "<br>") + "</div>" : "") +
          "</div>" +
          "</article>"
      )
      .join("") +
    "</div>"
  );
}

function renderGeral(c) {
  const root = document.getElementById("site-geral");
  if (!root) return;
  const intro = c.geralIntro.trim();
  const hasAgenda = Array.isArray(c.agenda) && c.agenda.length > 0;
  const geralLead =
    "Este site foi desenvolvido por alunos do período noturno da Etec Ferrucio Humberto Gazzetta, com a finalidade de divulgar informações institucionais e atividades escolares, tais como eventos, trotes, interclasses, entre outras iniciativas promovidas pela escola.";
  let html = "";
  html +=
    '<div class="geral-hero">' +
    '<h2 class="geral-welcome">Bem vindo ao site do Etec Noturno!</h2>' +
    '<p class="geral-hero__lead">' +
    escapeHtml(geralLead) +
    "</p>" +
    '<img class="geral-hero__img" src="foto-etec.jpeg" alt="Etec Noturno" loading="lazy" decoding="async" />' +
    "</div>";
  if (intro) {
    html += '<p class="site-block__intro">' + escapeHtml(intro).replace(/\n/g, "<br>") + "</p>";
  }
  if (hasAgenda) {
    html += '<h3 class="site-block__heading">Agenda</h3>';
    html += agendaBlock(c.agenda);
  }
  root.innerHTML = html;
}

function renderEventos(c) {
  const root = document.getElementById("site-eventos");
  if (!root) return;
  const items = Array.isArray(c.eventos) ? c.eventos : [];
  if (items.length === 0) {
    root.innerHTML = emptyBlock(
      "Eventos",
      "Calendário e avisos de eventos serão publicados aqui."
    );
    return;
  }
  root.innerHTML = '<h3 class="site-block__heading">Próximos eventos</h3>' + agendaBlock(items);
}

function renderCalendario(c) {
  const root = document.getElementById("site-calendario");
  if (!root) return;
  const cal = Array.isArray(c.calendario) ? c.calendario : [];
  const ev = Array.isArray(c.eventos) ? c.eventos : [];
  const items = [...cal, ...ev];
  const withDates = items.filter((it) => parseItemDateRange(it));

  let extra = "";
  if (items.length > 0 && withDates.length === 0) {
    extra =
      '<div class="site-block__spacer"></div>' +
      '<p class="calendar-note">Nenhuma data foi reconhecida. No Admin use o seletor de data (aba Calendário) ou texto no formato <strong>15/04/2026</strong>.</p>' +
      '<h3 class="site-block__heading">Itens cadastrados</h3>' +
      agendaBlock(items);
  }

  root.innerHTML = buildCalendarShell() + extra;
  initCalendarView(root, items);
}

function renderTrotesPanel(c) {
  const root = document.getElementById("site-trotes");
  if (!root) return;
  const items = Array.isArray(c.trotesItems) ? c.trotesItems : [];
  const text = String(c.trotes || "").trim();
  if (items.length === 0 && !text) {
    root.innerHTML = emptyBlock("Trotes", "Conteúdo da aba Trotes em breve.");
    return;
  }
  let html = "";
  if (items.length > 0) html += agendaBlock(items);
  if (text) {
    html +=
      (items.length ? '<div class="site-block__spacer"></div>' : "") +
      '<div class="site-block__text">' +
      escapeHtml(text).replace(/\n/g, "<br>") +
      "</div>";
  }
  root.innerHTML = html;
}

function renderInterclassePanel(c) {
  const root = document.getElementById("site-interclasse");
  if (!root) return;
  const items = Array.isArray(c.interclasseItems) ? c.interclasseItems : [];
  const text = String(c.interclasse || "").trim();
  if (items.length === 0 && !text) {
    root.innerHTML = emptyBlock("Interclasse", "Notícias do interclasse em breve.");
    return;
  }
  let html = "";
  if (items.length > 0) html += agendaBlock(items);
  if (text) {
    html +=
      (items.length ? '<div class="site-block__spacer"></div>' : "") +
      '<div class="site-block__text">' +
      escapeHtml(text).replace(/\n/g, "<br>") +
      "</div>";
  }
  root.innerHTML = html;
}

function renderGebePanel(c) {
  const root = document.getElementById("site-gebe-items");
  if (!root) return;
  const items = Array.isArray(c.gebeItems) ? c.gebeItems : [];
  if (items.length === 0) {
    root.innerHTML = "";
    return;
  }
  root.innerHTML = '<div class="site-gebe-dynamic">' + agendaBlock(items) + "</div>";
}

async function renderPublic() {
  const c = await load();
  renderGeral(c);
  renderEventos(c);
  renderCalendario(c);
  renderTrotesPanel(c);
  renderInterclassePanel(c);
  renderGebePanel(c);
}

function buildRow(item) {
  const wrap = document.createElement("div");
  wrap.className = "admin-row";
  wrap.dataset.id = item.id || uid();

  const tabSel = document.createElement("label");
  tabSel.className = "admin-field admin-field--target";
  const tabLabel = document.createElement("span");
  tabLabel.className = "admin-field__label";
  tabLabel.textContent = "Mostrar na aba";
  const sel = document.createElement("select");
  sel.className = "admin-item-target";
  sel.setAttribute("aria-label", "Mostrar na aba");
  TAB_KEYS.forEach((key) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = TAB_LABELS[key];
    sel.appendChild(opt);
  });
  sel.value = TAB_KEYS.includes(item.tab) ? item.tab : "agenda";
  tabSel.appendChild(tabLabel);
  tabSel.appendChild(sel);

  const d = document.createElement("label");
  d.className = "admin-field admin-field--inline";
  const dLab = document.createElement("span");
  dLab.className = "admin-field__label";
  dLab.textContent = "Data";
  const dHint = document.createElement("span");
  dHint.className = "admin-field__sublabel";
  dHint.textContent = "Dia único ou período (ex.: de 20/03 até 03/07)";
  const di = document.createElement("input");
  di.type = "text";
  di.dataset.field = "date";
  di.placeholder = "ex.: 15/04 ou de 20/03 até 03/07";
  di.setAttribute(
    "aria-label",
    "Data: dia único ou período, por exemplo de 20/03 até 03/07"
  );
  di.value = item.date || "";
  const diCal = document.createElement("input");
  diCal.type = "date";
  diCal.className = "admin-item-date-cal";
  diCal.setAttribute("aria-label", "Data do evento (calendário)");
  const iso = tryTextDateToIso(item.date || "");
  diCal.value = /^\d{4}-\d{2}-\d{2}$/.test(String(item.date || "").trim())
    ? String(item.date || "").trim()
    : iso;
  diCal.style.display = "none";

  function applyTabDateInputs() {
    const isCal = sel.value === "calendario";
    if (!isCal && diCal.value) {
      const p = diCal.value.split("-").map(Number);
      if (p.length === 3) di.value = `${pad2(p[2])}/${pad2(p[1])}/${p[0]}`;
    }
    di.style.display = "";
    diCal.style.display = isCal ? "" : "none";
    if (isCal) {
      di.placeholder = "Um dia (15/04/2026) ou período: de 29/06 até 03/07";
      dHint.textContent =
        "Seletor = um dia. Para vários dias, digite no texto (ex.: de 29/06 até 03/07) — todos ficam verdes na grade.";
    } else {
      di.placeholder = "ex.: 15/04 ou de 20/03 até 03/07";
      dHint.textContent = "Dia único ou período (ex.: de 20/03 até 03/07)";
    }
    if (isCal && !diCal.value && di.value.trim()) {
      const parsed = tryTextDateToIso(di.value);
      if (parsed) diCal.value = parsed;
    }
  }
  sel.addEventListener("change", applyTabDateInputs);

  d.appendChild(dLab);
  d.appendChild(dHint);
  d.appendChild(di);
  d.appendChild(diCal);
  applyTabDateInputs();

  const t = document.createElement("label");
  t.className = "admin-field admin-field--inline";
  t.innerHTML = '<span class="admin-field__label">Título</span>';
  const ti = document.createElement("input");
  ti.type = "text";
  ti.dataset.field = "title";
  ti.value = item.title || "";
  t.appendChild(ti);

  const desc = document.createElement("label");
  desc.className = "admin-field";
  desc.innerHTML = '<span class="admin-field__label">Descrição (opcional)</span>';
  const ta = document.createElement("textarea");
  ta.dataset.field = "desc";
  ta.rows = 2;
  ta.value = item.desc || "";
  desc.appendChild(ta);

  const rm = document.createElement("button");
  rm.type = "button";
  rm.className = "btn btn--negative btn--compact admin-row__remove";
  rm.textContent = "Remover";

  rm.addEventListener("click", () => wrap.remove());

  wrap.appendChild(tabSel);
  wrap.appendChild(d);
  wrap.appendChild(t);
  wrap.appendChild(desc);
  wrap.appendChild(rm);
  return wrap;
}

function mountList(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.replaceChildren();
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) {
    el.appendChild(buildRow({ id: uid(), tab: "agenda", date: "", title: "", desc: "" }));
  } else {
    list.forEach((item) =>
      el.appendChild(buildRow({ ...item, id: item.id || uid(), tab: item.tab || "agenda" }))
    );
  }
}

function mergedItemsForMount(c) {
  const agenda = (c.agenda || []).map((i) => ({ ...i, tab: "agenda" }));
  const eventos = (c.eventos || []).map((i) => ({ ...i, tab: "eventos" }));
  const calendario = (c.calendario || []).map((i) => ({ ...i, tab: "calendario" }));
  const trotes = (c.trotesItems || []).map((i) => ({ ...i, tab: "trotes" }));
  const interclasse = (c.interclasseItems || []).map((i) => ({ ...i, tab: "interclasse" }));
  const gebe = (c.gebeItems || []).map((i) => ({ ...i, tab: "gebe" }));
  return [...agenda, ...eventos, ...calendario, ...trotes, ...interclasse, ...gebe];
}

function collectItemsSplit() {
  const el = document.getElementById("admin-items-list");
  if (!el) {
    return { agenda: [], eventos: [], calendario: [], trotesItems: [], interclasseItems: [], gebeItems: [] };
  }
  const agenda = [];
  const eventos = [];
  const calendario = [];
  const trotesItems = [];
  const interclasseItems = [];
  const gebeItems = [];
  Array.from(el.querySelectorAll(".admin-row")).forEach((row) => {
    const target = row.querySelector("select.admin-item-target") || row.querySelector("select");
    const raw = target && target.value ? String(target.value).trim().toLowerCase() : "agenda";
    const date = row.querySelector('[data-field="date"]');
    const dateCal = row.querySelector(".admin-item-date-cal");
    const title = row.querySelector('[data-field="title"]');
    const desc = row.querySelector('[data-field="desc"]');
    let dateStr = "";
    if (raw === "calendario") {
      const text = date ? date.value.trim() : "";
      const iso = dateCal && dateCal.value ? dateCal.value.trim() : "";
      dateStr = text || iso;
    } else {
      dateStr = date ? date.value.trim() : "";
    }
    const item = {
      id: row.dataset.id || uid(),
      date: dateStr,
      title: title ? title.value.trim() : "",
      desc: desc ? desc.value.trim() : "",
    };
    if (!item.title && !item.date && !item.desc) return;
    if (raw === "eventos") eventos.push(item);
    else if (raw === "calendario") calendario.push(item);
    else if (raw === "trotes") trotesItems.push(item);
    else if (raw === "interclasse") interclasseItems.push(item);
    else if (raw === "gebe") gebeItems.push(item);
    else agenda.push(item);
  });
  return { agenda, eventos, calendario, trotesItems, interclasseItems, gebeItems };
}

async function collectForm() {
  const c = await load();
  const intro = document.getElementById("admin-geral-intro");
  const trotes = document.getElementById("admin-trotes");
  const inter = document.getElementById("admin-interclasse");
  c.geralIntro = intro ? intro.value : "";
  c.trotes = trotes ? trotes.value : "";
  c.interclasse = inter ? inter.value : "";
  const split = collectItemsSplit();
  c.agenda = split.agenda;
  c.eventos = split.eventos;
  c.calendario = split.calendario;
  c.trotesItems = split.trotesItems;
  c.interclasseItems = split.interclasseItems;
  c.gebeItems = split.gebeItems;
  return c;
}

function setSaveMsg(text, isError) {
  const el = document.getElementById("admin-save-msg");
  if (!el) return;
  el.textContent = text || "";
  el.dataset.error = isError ? "1" : "";
}

async function initAdminDashboard() {
  if (!(await getSession())) return;
  const c = await load();
  mountList("admin-items-list", mergedItemsForMount(c));

  const intro = document.getElementById("admin-geral-intro");
  const trotes = document.getElementById("admin-trotes");
  const inter = document.getElementById("admin-interclasse");
  if (intro) intro.value = c.geralIntro;
  if (trotes) trotes.value = c.trotes;
  if (inter) inter.value = c.interclasse;

  const addItems = document.getElementById("admin-items-add");
  if (addItems) {
    addItems.onclick = () => {
      document.getElementById("admin-items-list")?.appendChild(buildRow({ id: uid(), tab: "agenda", date: "", title: "", desc: "" }));
    };
  }

  const saveBtn = document.getElementById("admin-save-all");
  if (saveBtn && !saveBtn.dataset.bound) {
    saveBtn.dataset.bound = "1";
    saveBtn.addEventListener("click", async () => {
      try {
        if (!(await getSupabase())) {
          setSaveMsg("Supabase não configurado.", true);
          return;
        }
        const next = await collectForm();
        await saveRemote(next);
        await renderPublic();
        await initAdminDashboard();
        setSaveMsg("Alterações salvas para todos os visitantes.", false);
        window.setTimeout(() => setSaveMsg(""), 3200);
      } catch (err) {
        console.error(err);
        setSaveMsg(err?.message || "Não foi possível salvar.", true);
      }
    });
  }
}

async function boot() {
  try {
    await renderPublic();
  } catch (err) {
    console.error("fsstore boot:", err);
    const c = defaultContent();
    renderGeral(c);
    renderEventos(c);
    renderCalendario(c);
    renderTrotesPanel(c);
    renderInterclassePanel(c);
    renderGebePanel(c);
  }
  window.addEventListener("fsstore-admin-login", () => initAdminDashboard());
  window.addEventListener("fsstore-admin-logout", () => setSaveMsg("", false));
  if (await getSession()) await initAdminDashboard();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
