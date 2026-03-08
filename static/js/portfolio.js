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
// Mover todo el código de inicialización del DOM aquí
document.addEventListener('DOMContentLoaded', () => {
    // Sidebar toggle
    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("sidebar-toggle");
    const content = document.getElementById("content-wrapper");

    if (toggle && sidebar && content) {
        console.log('Sidebar toggle elements found and ready');
        
        toggle.addEventListener('click', () => {
            console.log('Toggle clicked, current left:', sidebar.style.left);
            const isOpen = sidebar.style.left === "0px";

            if (isOpen) {
                sidebar.style.left = "-260px";
                content.classList.remove("shifted");
                console.log('Sidebar closed');
            } else {
                sidebar.style.left = "0px";
                content.classList.add("shifted");
                console.log('Sidebar opened');
            }
        });
    } else {
        console.warn('Sidebar toggle not attached. Elements:', { sidebar: !!sidebar, toggle: !!toggle, content: !!content });
    }

    // Chat widget launcher
    const widget = document.getElementById("chat-widget");
    const launcher = document.getElementById("chat-launcher");

    if (launcher && widget) {
        launcher.onclick = () => {
            widget.style.display = widget.style.display === "flex" ? "none" : "flex";
        };
        console.log('Chat launcher attached');
    }

    // Chat send button
    const chatSendBtn = document.getElementById("chat-widget-send");

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
                    chatSendBtn.click();
                });
            } finally {
                chatSendBtn.disabled = false;
            }
        };
        console.log('Chat send button attached');
    }
});
// -----------------------------
// WIDGET DE CHAT (refactor: UI vs HTTP client)
// -----------------------------

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


// -----------------------------
// ABRIR / CERRAR WIDGET - Ya está en DOMContentLoaded arriba
// -----------------------------


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


// -----------------------------
// SIDEBAR DATA VIEWERS
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('#sidebar a[data-endpoint]');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const endpoint = link.getAttribute('data-endpoint');
            
            // Create or find modal container
            let modal = document.getElementById('data-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'data-modal';
                modal.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    max-width: 800px;
                    max-height: 80vh;
                    overflow-y: auto;
                    z-index: 10000;
                    display: none;
                `;
                document.body.appendChild(modal);
                
                // Create overlay
                const overlay = document.createElement('div');
                overlay.id = 'modal-overlay';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 9999;
                    display: none;
                `;
                overlay.addEventListener('click', () => {
                    modal.style.display = 'none';
                    overlay.style.display = 'none';
                });
                document.body.appendChild(overlay);
            }
            
            const overlay = document.getElementById('modal-overlay');
            
            // Show modal with loading state
            modal.innerHTML = '<div style="text-align:center;">Cargando...</div>';
            modal.style.display = 'block';
            overlay.style.display = 'block';
            
            try {
                const response = await fetch(`${API}/${endpoint}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                
                // Render data based on endpoint
                let html = `
                    <div style="position:relative;">
                        <button onclick="document.getElementById('data-modal').style.display='none';document.getElementById('modal-overlay').style.display='none';" 
                                style="position:absolute;top:-10px;right:-10px;background:#e74c3c;color:white;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;font-size:18px;line-height:1;">×</button>
                        <h2 style="margin-top:0;color:#333;">${link.textContent}</h2>
                `;
                
                if (endpoint === 'profile') {
                    const info = data.personal_info || {};
                    const location = info.location || {};
                    const summaryLines = data.summary?.es || [];
                    html += `
                        <div style="line-height:1.6;">
                            <p><strong>Nombre:</strong> ${info.full_name || 'N/A'}</p>
                            ${info.email ? `<p><strong>Email:</strong> ${info.email}</p>` : ''}
                            ${location.city ? `<p><strong>Ubicación:</strong> ${location.city}, ${location.region || ''}, ${location.country || ''}</p>` : ''}
                            ${summaryLines.length > 0 ? `<div style="margin-top:15px;"><strong>Resumen:</strong><ul style="margin-top:10px;">${summaryLines.map(line => `<li style="margin-bottom:8px;">${line}</li>`).join('')}</ul></div>` : ''}
                        </div>
                    `;
                } else if (endpoint === 'skills') {
                    const technical = data.technical?.es || [];
                    const soft = data.skills?.es || [];
                    
                    if (technical.length > 0) {
                        html += '<h3 style="color:#4a90e2;margin-top:20px;">Habilidades Técnicas</h3>';
                        html += '<ul style="line-height:1.8;columns:2;-webkit-columns:2;-moz-columns:2;">';
                        technical.forEach(skill => {
                            html += `<li style="break-inside:avoid;page-break-inside:avoid;">${skill}</li>`;
                        });
                        html += '</ul>';
                    }
                    
                    if (soft.length > 0) {
                        html += '<h3 style="color:#4a90e2;margin-top:20px;">Habilidades Blandas</h3>';
                        html += '<ul style="line-height:1.8;">';
                        soft.forEach(skill => {
                            html += `<li>${skill}</li>`;
                        });
                        html += '</ul>';
                    }
                } else if (endpoint === 'experience') {
                    if (Array.isArray(data)) {
                        data.forEach(exp => {
                            const responsibilities = exp.responsibilities_es || [];
                            html += `
                                <div style="margin-bottom:20px;padding:15px;background:#f9f9f9;border-radius:8px;">
                                    <h3 style="margin:0 0 10px 0;color:#4a90e2;">${exp.role_es || exp.role_en || 'Posición'}</h3>
                                    <p style="margin:5px 0;"><strong>${exp.company || ''}</strong></p>
                                    <p style="margin:5px 0;font-size:0.9em;color:#666;">${exp.location || ''} | ${exp.period || ''}</p>
                                    ${responsibilities.length > 0 ? `<ul style="margin:10px 0 0 0;font-size:0.95em;line-height:1.6;">${responsibilities.map(r => `<li>${r}</li>`).join('')}</ul>` : ''}
                                </div>
                            `;
                        });
                    } else {
                        html += '<p>No hay experiencia disponible.</p>';
                    }
                } else if (endpoint === 'education') {
                    if (Array.isArray(data)) {
                        data.forEach(edu => {
                            const focus = edu.focus_es || [];
                            html += `
                                <div style="margin-bottom:20px;padding:15px;background:#f9f9f9;border-radius:8px;">
                                    <h3 style="margin:0 0 10px 0;color:#4a90e2;">${edu.degree_es || edu.degree_en || 'Título'}</h3>
                                    <p style="margin:5px 0;"><strong>${edu.institution || ''}</strong></p>
                                    <p style="margin:5px 0;font-size:0.9em;color:#666;">${edu.location || ''} | ${edu.period || ''}</p>
                                    ${focus.length > 0 ? `<p style="margin:10px 0 0 0;font-size:0.95em;"><strong>Enfoque:</strong> ${focus.join(', ')}</p>` : ''}
                                </div>
                            `;
                        });
                    } else {
                        html += '<p>No hay educación disponible.</p>';
                    }
                } else if (endpoint === 'publications') {
                    if (Array.isArray(data)) {
                        data.forEach(pub => {
                            const details = pub.details || {};
                            html += `
                                <div style="margin-bottom:20px;padding:15px;background:#f9f9f9;border-radius:8px;">
                                    <h3 style="margin:0 0 10px 0;color:#4a90e2;">${pub.title_es || pub.title_en || 'Publicación'}</h3>
                                    ${pub.description_es ? `<p style="margin:10px 0;font-size:0.95em;line-height:1.6;">${pub.description_es}</p>` : ''}
                                    ${details.journal ? `<p style="margin:5px 0;"><strong>Revista:</strong> ${details.journal}</p>` : ''}
                                    ${details.year ? `<p style="margin:5px 0;"><strong>Año:</strong> ${details.year}</p>` : ''}
                                    ${details.coauthor ? `<p style="margin:5px 0;"><strong>Coautor:</strong> ${details.coauthor}</p>` : ''}
                                    ${details.url ? `<p style="margin:10px 0;"><a href="${details.url}" target="_blank" style="color:#4a90e2;text-decoration:none;">➡ Ver publicación</a></p>` : ''}
                                </div>
                            `;
                        });
                    } else {
                        html += '<p>No hay publicaciones disponibles.</p>';
                    }
                } else {
                    // Generic JSON display
                    html += `<pre style="background:#f5f5f5;padding:15px;border-radius:8px;overflow:auto;">${JSON.stringify(data, null, 2)}</pre>`;
                }
                
                html += '</div>';
                modal.innerHTML = html;
                
            } catch (error) {
                console.error('Error loading data:', error);
                modal.innerHTML = `
                    <div style="position:relative;">
                        <button onclick="document.getElementById('data-modal').style.display='none';document.getElementById('modal-overlay').style.display='none';" 
                                style="position:absolute;top:-10px;right:-10px;background:#e74c3c;color:white;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;font-size:18px;line-height:1;">×</button>
                        <h2 style="color:#e74c3c;">Error</h2>
                        <p>No se pudo cargar la información: ${error.message}</p>
                    </div>
                `;
            }
        });
    });
});
