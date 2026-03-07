async function loadProjectsEN() {
    const response = await fetch("https://mirel-api.onrender.com/proyectos");
    const projects = await response.json();
    renderProjectsEN(projects);
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