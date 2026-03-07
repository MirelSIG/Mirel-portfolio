// Detectar entorno: local o Render
const API =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8000"
        : "/api";


// -----------------------------
// PANEL LATERAL
// -----------------------------
const sidebar = document.getElementById("sidebar");
const toggle = document.getElementById("sidebar-toggle");
const content = document.getElementById("content-wrapper");

toggle.onclick = () => {
    const isOpen = sidebar.style.left === "0px";

    if (isOpen) {
        sidebar.style.left = "-260px";
        content.classList.remove("shifted");
    } else {
        sidebar.style.left = "0px";
        content.classList.add("shifted");
    }
};


// -----------------------------
// WIDGET DE CHAT (refactor: UI vs HTTP client)
// -----------------------------
const chatSendBtn = document.getElementById("chat-widget-send");

// --- UI helpers (pure DOM manipulation) ---
function getChatBody() {
    return document.getElementById('chat-body');
}

function renderUserMessage(text) {
    const body = getChatBody();
    if (!body) return;
    body.insertAdjacentHTML('beforeend', `<div class="chat-msg-user">${text}</div>`);
    body.scrollTop = body.scrollHeight;
}

function renderBotMessage(text) {
    const body = getChatBody();
    if (!body) return;
    body.insertAdjacentHTML('beforeend', `<div class="chat-msg-bot">${text}</div>`);
    body.scrollTop = body.scrollHeight;
}

function showLoading() {
    const body = getChatBody();
    if (!body) return null;
    let loading = document.getElementById('chat-loading');
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'chat-loading';
        loading.innerHTML = `<div class="spinner"></div>`;
        body.appendChild(loading);
    }
    loading.style.display = 'flex';
    body.scrollTop = body.scrollHeight;
    return loading;
}

function hideLoading(loadingEl) {
    if (loadingEl) loadingEl.style.display = 'none';
}

function renderError(message, retryCallback) {
    const body = getChatBody();
    if (!body) return;
    const errDiv = document.createElement('div');
    errDiv.className = 'chat-error';
    errDiv.textContent = message;
    const retry = document.createElement('a');
    retry.className = 'chat-retry';
    retry.textContent = 'Reintentar';
    retry.onclick = retryCallback;
    errDiv.appendChild(document.createElement('br'));
    errDiv.appendChild(retry);
    body.appendChild(errDiv);
    body.scrollTop = body.scrollHeight;
}

// --- HTTP client (testable) ---
async function sendQuestion(text) {
    const res = await fetch(`${API}/qa?question=${encodeURIComponent(text)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return typeof data === 'string' ? data : (data.answer || data.respuesta || data.example_answer || JSON.stringify(data));
}

// --- Wiring ---
if (chatSendBtn) {
    chatSendBtn.onclick = async () => {
        const input = document.getElementById('chat-widget-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        renderUserMessage(text);
        input.value = '';

        const loadingEl = showLoading();
        chatSendBtn.disabled = true;

        try {
            const answer = await sendQuestion(text);
            hideLoading(loadingEl);
            renderBotMessage(answer);
        } catch (err) {
            hideLoading(loadingEl);
            renderError('No se pudo obtener respuesta del servidor.', () => {
                // retry: simulate user clicking send again
                chatSendBtn.click();
            });
        } finally {
            chatSendBtn.disabled = false;
        }
    };
}


// -----------------------------
// ABRIR / CERRAR WIDGET
// -----------------------------
const widget = document.getElementById("chat-widget");
const launcher = document.getElementById("chat-launcher");

launcher.onclick = () => {
    widget.style.display = widget.style.display === "flex" ? "none" : "flex";
};


// -----------------------------
// PROYECTOS
// -----------------------------
async function loadProjects() {
    const container = document.getElementById("projects-container");
    if (!container) return; // nothing to do on pages without projects

    try {
        const response = await fetch(`${API}/proyectos`);
        const projects = await response.json();
        renderProjects(projects);
    } catch (error) {
        console.error("Error cargando proyectos:", error);
    }
}

function renderProjects(projects) {
    const container = document.getElementById("projects-container");
    container.innerHTML = "";

    projects.forEach(p => {
        const card = document.createElement("div");
        card.classList.add("project-card");

        card.innerHTML = `
            <h3>${p.title}</h3>
            <p>${p.description}</p>
            <a href="${p.url}" target="_blank">Ver proyecto</a>
            <a href="${p.repo}" target="_blank">Código en GitHub</a>
        `;

        container.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", loadProjects);
