// Detectar entorno: local o Render
const API =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8000"
        : "/api";   // Render reescribe /api → mirel-api.onrender.com


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
// WIDGET DE CHAT
// -----------------------------
document.getElementById("chat-widget-send").onclick = async () => {
    const input = document.getElementById("chat-widget-input");
    const text = input.value.trim();
    if (!text) return;

    const body = document.getElementById("chat-body");

    // Mensaje del usuario
    body.innerHTML += `<div class="chat-msg-user">${text}</div>`;
    body.scrollTop = body.scrollHeight;

    input.value = "";

    try {
        const res = await fetch(`${API}/preguntar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pregunta: text })
        });

        const data = await res.json();

        body.innerHTML += `<div class="chat-msg-bot">${data.respuesta}</div>`;
        body.scrollTop = body.scrollHeight;

    } catch (error) {
        body.innerHTML += `<div class="chat-msg-bot">Error conectando con el servidor.</div>`;
    }
};


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
