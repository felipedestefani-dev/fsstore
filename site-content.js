import { getSupabase } from "./supabase-client.js";

const SITE_ROW_ID = "main";

const TAB_KEYS = ["agenda", "eventos", "trotes", "interclasse", "gebe"];
const TAB_LABELS = {
  agenda: "Geral",
  eventos: "Eventos",
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
  d.appendChild(dLab);
  d.appendChild(dHint);
  d.appendChild(di);

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
  const trotes = (c.trotesItems || []).map((i) => ({ ...i, tab: "trotes" }));
  const interclasse = (c.interclasseItems || []).map((i) => ({ ...i, tab: "interclasse" }));
  const gebe = (c.gebeItems || []).map((i) => ({ ...i, tab: "gebe" }));
  return [...agenda, ...eventos, ...trotes, ...interclasse, ...gebe];
}

function collectItemsSplit() {
  const el = document.getElementById("admin-items-list");
  if (!el) {
    return { agenda: [], eventos: [], trotesItems: [], interclasseItems: [], gebeItems: [] };
  }
  const agenda = [];
  const eventos = [];
  const trotesItems = [];
  const interclasseItems = [];
  const gebeItems = [];
  Array.from(el.querySelectorAll(".admin-row")).forEach((row) => {
    const target = row.querySelector("select.admin-item-target") || row.querySelector("select");
    const raw = target && target.value ? String(target.value).trim().toLowerCase() : "agenda";
    const date = row.querySelector('[data-field="date"]');
    const title = row.querySelector('[data-field="title"]');
    const desc = row.querySelector('[data-field="desc"]');
    const item = {
      id: row.dataset.id || uid(),
      date: date ? date.value.trim() : "",
      title: title ? title.value.trim() : "",
      desc: desc ? desc.value.trim() : "",
    };
    if (!item.title && !item.date && !item.desc) return;
    if (raw === "eventos") eventos.push(item);
    else if (raw === "trotes") trotesItems.push(item);
    else if (raw === "interclasse") interclasseItems.push(item);
    else if (raw === "gebe") gebeItems.push(item);
    else agenda.push(item);
  });
  return { agenda, eventos, trotesItems, interclasseItems, gebeItems };
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
