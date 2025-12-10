# EXALTARE - Project Documentation

## 1. Project Overview
**Exaltare** is a high-performance, static-only web platform designed to showcase student portfolios.
- **Type**: Static Website (HTML/CSS/JS).
- **No Database**: Uses a flat JSON structure in `js/data.js` as the data source.
- **Aesthetic**: Dark Mode, Neon Glow (Cyberpunk/Glassmorphism), "Future" vibe.

## 2. File Structure
```text
/showcaze
├── index.html            # The Public Interface (Gallery, About, overlay)
├── reviewer.html         # INTERNAL TOOL: For grading & generating JSON
├── css/
│   ├── style.css         # Main styles (Glassmorphism, Animations, Cursor)
│   └── review.css        # Styles for the reviewer tool
├── js/
│   ├── app.js            # Main logic (Grid render, 3D tilt, Overlay)
│   ├── reviewer.js       # Logic for the reviewer tool
│   └── data.js           # THE DATABASE. Edit this to add students.
└── submissions/          # Raw student project folders
    └── student-name/     # Student's raw source code
        └── index.html
```

## 3. The "Database" (`js/data.js`)
We use a global variable `CONFIG` with two main arrays:
1.  `reviewQueue`: Used by `reviewer.html` to cycle through projects for grading.
2.  `showcaseGroups`: Used by `index.html` to display the public gallery.

**Data Structure (Public Showcase):**
```javascript
showcaseGroups: [
    {
        groupName: "BSIT 2A",
        projects: [
            {
                id: "unique_id",
                studentName: "Student Name",
                projectTitle: "Project Name",
                thumbnail: "path/to/img.jpg",
                path: "./submissions/student-folder/index.html",
                teacherComment: "Feedback...",
                tags: ["HTML", "CSS"]
            }
        ]
    }
]
```

## 4. Workflow: From "New Email" to "Live Site"

**Crucial Concept**: Your **Local Computer** is the "Control Center". The Live Site is just a mirror of your computer.

### Step 1: Ingest
*   Student sends you `my-project.zip`.
*   You unzip it into your local `showcaze/submissions/` folder.

### Step 2: Review & Configure (Local Only)
*   Open `reviewer.html` locally in Chrome/Edge.
*   It reads your local folders. You grade the project.
*   Click **Generate Code** to get the JSON block.
*   Paste that JSON block into `js/data.js`.
*   *At this point, it works on YOUR computer, but not the internet.*

### Step 3: Go Live
*   To update the live site, you must sync your changes:
    ```bash
    git add .
    git commit -m "Added Student Name's project"
    git push
    ```
*   **Vercel/GitHub** will detect the change to `data.js` and the new folder, and update the live site automatically within minutes.

### Why is `reviewer.html` ignored?
*   We kept the "Admin Tool" hidden from the public repo (`.gitignore`) so students can't accidentally see it or your grading interface. It is for **your eyes only** on your local machine.

## 5. Maintenance & Updates

### Scenario A: Updating Student Code (Content Change)
*   **Action**: Simply replace the files in the student's folder (e.g., `submissions/BSIT-2A/Student1/index.html`).
*   **Result**: The site updates immediately.
    *   *Note*: Browsers cache files aggressively. If you don't see the change, press **Ctrl + F5** (or Cmd + Shift + R) to hard refresh.
*   **Script Needed?**: **NO.** You do not need to run `node generate.js` just for file content changes.

### Scenario B: Adding/Moving/Renaming Students (Structure Change)
*   **Action**: You add a new folder, rename a folder, or move a student to a different group.
*   **Result**: The site won't know about this change yet.
*   **Script Needed?**: **YES.** Run `node generate.js`.
    *   It will detect the new structure.
    *   It will **preserve** your existing grades/comments (as long as the student's *folder name* matches an existing entry, it tries to map it, otherwise it treats it as new).

## 6. Key Features & Interactions

### Public Site (`index.html`)
*   **Custom Cursor**: A dot + lagging ring. Auto-hides when hovering the student iframe (handled in `js/app.js`).
*   **3D Tilt Cards**: Cards rotate in 3D perspective based on mouse position.
*   **Experience Overlay**:
    *   Clicking a card opens a full-screen overlay.
    *   **Teacher Side**: Left panel with feedback.
    *   **Raw Mode**: Collapses the left panel for 100% full-screen view. Triggered by "Go Raw" button or `Escape` key.
*   **Keyboard Shortcuts**:
    *   `Escape`: Exits Raw Mode -> Closes Overlay.

### Internal Tool (`reviewer.html`)
*   **Split View**: Sidebar controls + Full iframe preview.
*   **JSON Generator**: Helper to format the data correctly for `data.js`.

## 6. Style System
*   **Colors**:
    *   Neon Cyan: `#00f3ff` (`var(--neon-primary)`)
    *   Neon Purple: `#bc13fe` (`var(--neon-secondary)`)
    *   Background: Dark `#050505`
*   **Glassmorphism**: Heavy use of `backdrop-filter: blur(10px)` and semi-transparent backgrounds.
*   **Animations**: Custom keyframes for `fadeInUp` and pure CSS transitions for hover states.
