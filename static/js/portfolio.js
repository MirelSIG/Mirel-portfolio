// Detectar entorno: local o Render
// Use the page origin when running locally so fetch calls hit the same server
const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? window.location.origin
    : "/api";

// Debug: show which API origin the client will use (visible in DevTools)
console.log('API ->', API);

// Global error handler to avoid silent script termination
window.addEventListener('error', (ev) => {
    console.error('Global error caught:', ev.error || ev.message, ev);
});
window.addEventListener('unhandledrejection', (ev) => {
    console.error('Unhandled promise rejection:', ev.reason);
});


// -----------------------------
// PANEL LATERAL
// -----------------------------
const sidebar = document.getElementById("sidebar");
const toggle = document.getElementById("sidebar-toggle");
const content = document.getElementById("content-wrapper");

// Guarded toggle: only attach handler if all elements exist to avoid runtime errors
if (toggle && sidebar && content) {
    toggle.addEventListener('click', () => {
        const isOpen = sidebar.style.left === "0px";

        if (isOpen) {
            sidebar.style.left = "-260px";
            content.classList.remove("shifted");
        } else {
            sidebar.style.left = "0px";
            content.classList.add("shifted");
        }
    });
} else {
    // If elements are missing, log for easier debugging in browser console
    console.warn('Sidebar toggle not attached. Elements:', { sidebar: !!sidebar, toggle: !!toggle, content: !!content });
}


// -----------------------------
// WIDGET DE CHAT (refactor: UI vs HTTP client)
// -----------------------------
const chatSendBtn = document.getElementById("chat-widget-send");

// --- UI helpers (pure DOM manipulation) ---
function getChatBody() {
    return document.getElementById('chat-body') || document.getElementById('chat-inline-body');
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
    if (!res.ok) {
        // try to capture response body for debugging
        let bodyText = '';
        try { bodyText = await res.text(); } catch (e) { bodyText = '<unable to read body>'; }
        const err = new Error(`HTTP ${res.status}: ${bodyText}`);
        err.status = res.status;
        err.body = bodyText;
        throw err;
    }
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
            console.error('sendQuestion error:', err);
            const msg = err && err.message ? `Error: ${err.message}` : 'No se pudo obtener respuesta del servidor.';
            renderError(msg, () => {
                // retry: simulate user clicking send again
                chatSendBtn.click();
            });
        } finally {
            chatSendBtn.disabled = false;
        }
    };
}


// -----------------------------
// ABRIR / CERRAR WIDGET (legacy modal: guarded)
// -----------------------------
const widget = document.getElementById("chat-widget");
const launcher = document.getElementById("chat-launcher");

if (launcher && widget) {
    launcher.onclick = () => {
        widget.style.display = widget.style.display === "flex" ? "none" : "flex";
    };
}


// -----------------------------
// PROYECTOS
// -----------------------------
async function loadProjects() {
    const container = document.getElementById("projects-container");
    if (!container) return; // nothing to do on pages without projects

    // If static project cards already exist in the template, don't overwrite them
    if (container.children && container.children.length > 0) return;

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

// Wire inline chat inputs (if present) to the same handlers
const inlineSend = document.getElementById('chat-inline-send');
if (inlineSend) {
    inlineSend.addEventListener('click', () => {
        const input = document.getElementById('chat-inline-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        // reuse the widget flow by delegating to chatSendBtn logic if available
        // otherwise call sendQuestion directly and render
        if (typeof chatSendBtn !== 'undefined' && chatSendBtn) {
            // populate the original input for compatibility (if exists)
            const oldInput = document.getElementById('chat-widget-input');
            if (oldInput) oldInput.value = text;
            chatSendBtn.click();
            input.value = '';
            return;
        }

        // fallback: use inline UI and sendQuestion
        renderUserMessage(text);
        input.value = '';
        const loadingEl = showLoading();
        inlineSend.disabled = true;
        sendQuestion(text)
            .then(answer => {
                hideLoading(loadingEl);
                renderBotMessage(answer);
            })
            .catch((err) => {
                hideLoading(loadingEl);
                console.error('inline sendQuestion error:', err);
                const msg = err && err.message ? `Error: ${err.message}` : 'No se pudo obtener respuesta del servidor.';
                renderError(msg, () => inlineSend.click());
            })
            .finally(() => { inlineSend.disabled = false; });
    });
}

// Allow sending with Enter key for inline input
const inlineInput = document.getElementById('chat-inline-input');
if (inlineInput && inlineSend) {
    inlineInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            inlineSend.click();
        }
    });
}

// Allow sending with Enter key for legacy widget input (if present)
const legacyInput = document.getElementById('chat-widget-input');
if (legacyInput && typeof chatSendBtn !== 'undefined' && chatSendBtn) {
    legacyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            chatSendBtn.click();
        }
    });
}
