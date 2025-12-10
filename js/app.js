const sectionsContainer = document.getElementById('sections-container');
const overlay = document.getElementById('experience-overlay');
const frame = document.getElementById('exp-frame');
const sidebar = document.getElementById('sidebar');
const restoreBtn = document.getElementById('restore-btn');

const expTitle = document.getElementById('exp-title');
const expStudent = document.getElementById('exp-student');
const expComment = document.getElementById('exp-comment');

function init() {
    sectionsContainer.innerHTML = '';
    
    CONFIG.showcaseGroups.forEach((group, groupIndex) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'class-group';

        const header = document.createElement('div');
        header.className = 'class-header';
        header.innerHTML = `
            <span>${group.groupName}</span>
            <span class="arrow">▼</span>
        `;
        header.onclick = () => toggleGroup(header, contentDiv);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'group-grid-container';
        
        const grid = document.createElement('div');
        grid.className = 'project-grid';

        group.projects.forEach((project, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.animationDelay = `${index * 0.1}s`; 

            card.innerHTML = `
                <div class="card-img" style="background-image: url('${project.thumbnail}')"></div>
                <div class="card-content">
                    <h3>${project.projectTitle}</h3>
                    <span class="student">${project.studentName}</span>
                    <div class="tags">
                        ${project.tags.map(t => `<span>${t}</span>`).join('')}
                    </div>
                </div>
            `;
            
            card.onclick = () => openExperience(project);
            card.addEventListener('mousemove', handleTilt);
            card.addEventListener('mouseleave', resetTilt);
            grid.appendChild(card);
        });

        contentDiv.appendChild(grid);
        groupDiv.appendChild(header);
        groupDiv.appendChild(contentDiv);
        sectionsContainer.appendChild(groupDiv);
    });
}

function toggleGroup(header, content) {
    header.classList.toggle('active');
    
    if (content.classList.contains('open')) {
        content.classList.remove('open');
    } else {

        content.classList.add('open');
    }
}

function handleTilt(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xPct = x / rect.width;
    const yPct = y / rect.height;
    const xRot = (0.5 - yPct) * 20; 
    const yRot = (xPct - 0.5) * 20; 

    card.style.transform = `perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale3d(1.05, 1.05, 1.05)`;
}

function resetTilt(e) {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
}


window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (sidebar.classList.contains('collapsed')) {
            toggleRawMode();
        } else if (overlay.classList.contains('active')) {
            closeExperience();
        }
    }
});

const cursorDot = document.querySelector("[data-cursor-dot]");
const cursorOutline = document.querySelector("[data-cursor-outline]");

window.addEventListener("mousemove", function (e) {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;


    cursorOutline.style.left = `${posX}px`;
    cursorOutline.style.top = `${posY}px`;
});

const iframeContainer = document.querySelector('.exp-frame-container');

iframeContainer.addEventListener('mouseenter', () => {
    cursorDot.style.opacity = 0;
    cursorOutline.style.opacity = 0;
});

iframeContainer.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = 1;
    cursorOutline.style.opacity = 1;
});

restoreBtn.addEventListener('mouseenter', (e) => {
    e.stopPropagation(); 
    cursorDot.style.opacity = 1;
    cursorOutline.style.opacity = 1;
});

restoreBtn.addEventListener('mouseleave', () => {
    
    cursorOutline.style.opacity = 0;
});

const interactiveElements = document.querySelectorAll('a, button, .card, .class-header, h1');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

const observer = new MutationObserver(() => {
    document.querySelectorAll('.card, .class-header').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
});
observer.observe(sectionsContainer, { childList: true, subtree: true });

function openExperience(project) {
    expTitle.textContent = project.projectTitle;
    expStudent.textContent = project.studentName;
    expComment.textContent = project.teacherComment;
    frame.src = project.path;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; 
}

// stop
function closeExperience() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    
    if (sidebar.classList.contains('collapsed')) {
        toggleRawMode();
    }
    
    setTimeout(() => {
        frame.src = 'about:blank'; 
    }, 500);
}

// experience mode
function toggleRawMode() {
    sidebar.classList.toggle('collapsed');
    
    if (sidebar.classList.contains('collapsed')) {
        restoreBtn.style.display = 'block';
    } else {
        restoreBtn.style.display = 'none';
    }
}

// for mobile pra sektop experience
function toggleScale() {
    const frame = document.getElementById('exp-frame');
    const btn = document.getElementById('scale-btn');
    
    frame.classList.toggle('desktop-view');
    
    if (frame.classList.contains('desktop-view')) {
        btn.textContent = "🖥️ Scale: Desktop";
        btn.style.color = "var(--neon-primary)";
        btn.style.borderColor = "var(--neon-primary)";
    } else {
        btn.textContent = "📱 Scale: Mobile";
        btn.style.color = "white";
        btn.style.borderColor = "#444";
    }
}

// functions for html clicks
window.closeExperience = closeExperience;
window.toggleRawMode = toggleRawMode;
window.toggleScale = toggleScale;

init();
