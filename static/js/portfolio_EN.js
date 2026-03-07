// Detect environment: local or deployed
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
// SIDEBAR
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
    console.warn('Sidebar toggle not attached. Elements:', { sidebar: !!sidebar, toggle: !!toggle, content: !!content });
}


// -----------------------------
// CHAT WIDGET (refactor: UI vs HTTP client)
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
    retry.textContent = 'Retry';
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
            const msg = err && err.message ? `Error: ${err.message}` : 'Unable to get response from server.';
            renderError(msg, () => {
                chatSendBtn.click();
            });
        } finally {
            chatSendBtn.disabled = false;
        }
    };
}


// -----------------------------
// OPEN / CLOSE WIDGET (legacy modal: guarded)
// -----------------------------
const widget = document.getElementById("chat-widget");
const launcher = document.getElementById("chat-launcher");

if (launcher && widget) {
    launcher.onclick = () => {
        widget.style.display = widget.style.display === "flex" ? "none" : "flex";
    };
}


// -----------------------------
// PROJECTS
// -----------------------------
async function loadProjectsEN() {
    const container = document.getElementById("projects-container");
    if (!container) return; // not on a page that needs projects

    // If static project cards already exist in the template, don't overwrite them
    if (container.children && container.children.length > 0) return;

    try {
        const response = await fetch(`${API}/proyectos`);
        const projects = await response.json();
        renderProjectsEN(projects);
    } catch (err) {
        console.error("Error loading projects (EN):", err);
        // fallback to embedded list if available
        if (window.PROJECTS_EN) {
            renderProjectsEN(window.PROJECTS_EN);
        }
    }
}

function renderProjectsEN(projects) {
    const container = document.getElementById("projects-container");
    container.innerHTML = "";

    projects.forEach(p => {
        const card = document.createElement("div");
        card.classList.add("project-card");

        card.innerHTML = `
            <h3>${p.title}</h3>
            <p>${p.description}</p>
            <a href="${p.url}" target="_blank">View project</a>
            <a href="${p.repo}" target="_blank">GitHub Code</a>
        `;

        container.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", loadProjectsEN);

// Wire inline chat inputs (if present) to the same handlers
const inlineSend = document.getElementById('chat-inline-send');
if (inlineSend) {
    inlineSend.addEventListener('click', () => {
        const input = document.getElementById('chat-inline-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        if (typeof chatSendBtn !== 'undefined' && chatSendBtn) {
            const oldInput = document.getElementById('chat-widget-input');
            if (oldInput) oldInput.value = text;
            chatSendBtn.click();
            input.value = '';
            return;
        }

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
                const msg = err && err.message ? `Error: ${err.message}` : 'Unable to get response from server.';
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
            modal.innerHTML = '<div style="text-align:center;">Loading...</div>';
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
                    html += `
                        <div style="line-height:1.6;">
                            <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
                            <p><strong>Title:</strong> ${data.title || 'N/A'}</p>
                            <p><strong>Summary:</strong> ${data.summary || 'N/A'}</p>
                            ${data.email ? `<p><strong>Email:</strong> ${data.email}</p>` : ''}
                            ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
                            ${data.location ? `<p><strong>Location:</strong> ${data.location}</p>` : ''}
                        </div>
                    `;
                } else if (endpoint === 'skills') {
                    if (Array.isArray(data)) {
                        html += '<ul style="line-height:1.8;">';
                        data.forEach(skill => {
                            if (typeof skill === 'string') {
                                html += `<li>${skill}</li>`;
                            } else if (skill.name) {
                                html += `<li><strong>${skill.name}</strong>${skill.level ? ` - ${skill.level}` : ''}</li>`;
                            }
                        });
                        html += '</ul>';
                    } else {
                        html += `<pre style="background:#f5f5f5;padding:15px;border-radius:8px;overflow:auto;">${JSON.stringify(data, null, 2)}</pre>`;
                    }
                } else if (endpoint === 'experience') {
                    if (Array.isArray(data)) {
                        data.forEach(exp => {
                            html += `
                                <div style="margin-bottom:20px;padding:15px;background:#f9f9f9;border-radius:8px;">
                                    <h3 style="margin:0 0 10px 0;color:#4a90e2;">${exp.position || exp.title || 'Position'}</h3>
                                    <p style="margin:5px 0;"><strong>${exp.company || exp.organization || ''}</strong></p>
                                    <p style="margin:5px 0;font-size:0.9em;color:#666;">${exp.period || exp.dates || ''}</p>
                                    ${exp.description ? `<p style="margin:10px 0 0 0;">${exp.description}</p>` : ''}
                                </div>
                            `;
                        });
                    } else {
                        html += `<pre style="background:#f5f5f5;padding:15px;border-radius:8px;overflow:auto;">${JSON.stringify(data, null, 2)}</pre>`;
                    }
                } else if (endpoint === 'education') {
                    if (Array.isArray(data)) {
                        data.forEach(edu => {
                            html += `
                                <div style="margin-bottom:20px;padding:15px;background:#f9f9f9;border-radius:8px;">
                                    <h3 style="margin:0 0 10px 0;color:#4a90e2;">${edu.degree || edu.title || 'Degree'}</h3>
                                    <p style="margin:5px 0;"><strong>${edu.institution || edu.school || ''}</strong></p>
                                    <p style="margin:5px 0;font-size:0.9em;color:#666;">${edu.year || edu.period || ''}</p>
                                    ${edu.description ? `<p style="margin:10px 0 0 0;">${edu.description}</p>` : ''}
                                </div>
                            `;
                        });
                    } else {
                        html += `<pre style="background:#f5f5f5;padding:15px;border-radius:8px;overflow:auto;">${JSON.stringify(data, null, 2)}</pre>`;
                    }
                } else if (endpoint === 'publications') {
                    if (Array.isArray(data)) {
                        data.forEach(pub => {
                            html += `
                                <div style="margin-bottom:20px;padding:15px;background:#f9f9f9;border-radius:8px;">
                                    <h3 style="margin:0 0 10px 0;color:#4a90e2;">${pub.title || 'Publication'}</h3>
                                    ${pub.authors ? `<p style="margin:5px 0;"><em>${pub.authors}</em></p>` : ''}
                                    ${pub.journal ? `<p style="margin:5px 0;"><strong>${pub.journal}</strong></p>` : ''}
                                    ${pub.year ? `<p style="margin:5px 0;font-size:0.9em;color:#666;">${pub.year}</p>` : ''}
                                    ${pub.description ? `<p style="margin:10px 0 0 0;">${pub.description}</p>` : ''}
                                    ${pub.url ? `<p style="margin:10px 0 0 0;"><a href="${pub.url}" target="_blank" style="color:#4a90e2;">View publication</a></p>` : ''}
                                </div>
                            `;
                        });
                    } else {
                        html += `<pre style="background:#f5f5f5;padding:15px;border-radius:8px;overflow:auto;">${JSON.stringify(data, null, 2)}</pre>`;
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
                        <p>Unable to load data: ${error.message}</p>
                    </div>
                `;
            }
        });
    });
});
