// Detect environment: local or deployed
const API =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8000"
        : "/api";

async function loadProjectsEN() {
    const container = document.getElementById("projects-container");
    if (!container) return; // not on a page that needs projects

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