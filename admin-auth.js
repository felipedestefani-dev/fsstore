import { supabase } from "./supabase-client.js";

const guestEl = document.getElementById("admin-guest");
const sessionEl = document.getElementById("admin-session");
const form = document.getElementById("admin-login-form");
const msgEl = document.getElementById("admin-auth-msg");
const userEmailEl = document.getElementById("admin-user-email");
const logoutBtn = document.getElementById("admin-logout");

function setMsg(el, text, isError) {
  if (!el) return;
  el.textContent = text || "";
  el.dataset.error = isError ? "1" : "";
}

function emit(name) {
  window.dispatchEvent(new CustomEvent(name));
}

function applyLoggedInUi(label, emitLoginEvent = true) {
  if (!guestEl || !sessionEl) return;
  guestEl.classList.add("is-hidden");
  sessionEl.classList.remove("is-hidden");
  if (userEmailEl) userEmailEl.textContent = label || "";
  setMsg(msgEl, "", false);
  if (emitLoginEvent) emit("fsstore-admin-login");
}

function applyLoggedOutUi() {
  if (!guestEl || !sessionEl) return;
  guestEl.classList.remove("is-hidden");
  sessionEl.classList.add("is-hidden");
  if (userEmailEl) userEmailEl.textContent = "";
  setMsg(msgEl, "", false);
  emit("fsstore-admin-logout");
}

function init() {
  if (!guestEl || !sessionEl || !form) return;

  if (!supabase) {
    setMsg(
      msgEl,
      "Configure o Supabase: copie config.example.js para config.js e preencha URL e chave anônima.",
      true
    );
    form.querySelector("button[type=submit]")?.setAttribute("disabled", "disabled");
    return;
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      applyLoggedInUi("Sessão ativa", event === "SIGNED_IN");
    } else {
      applyLoggedOutUi();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");

    if (!email || !password) {
      setMsg(msgEl, "Preencha e-mail e senha.", true);
      return;
    }

    setMsg(msgEl, "Entrando…", false);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMsg(msgEl, error.message || "Não foi possível entrar.", true);
      return;
    }
    setMsg(msgEl, "", false);
  });

  logoutBtn?.addEventListener("click", async () => {
    await supabase.auth.signOut();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
