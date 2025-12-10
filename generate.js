const fs = require('fs');
const path = require('path');

// 1. HELPERS
const SUBMISSIONS_DIR = path.join(__dirname, 'submissions');
const DATA_FILE = path.join(__dirname, 'js', 'data.js');

// Load existing data to preserve comments/tags
let existingData = {};
try {
    const data = require(DATA_FILE);
    existingData = data;
    console.log("✅ Loaded existing data.js (Comments will be preserved)");
} catch (e) {
    console.log("⚠️ Could not load existing data.js (Creating fresh)");
}

// 2. SCAN FOLDERS
const newShowcaseGroups = [];
const newReviewQueue = [];

// Get all Section folders (e.g., "BSIT 2A")
if (fs.existsSync(SUBMISSIONS_DIR)) {
    const sections = fs.readdirSync(SUBMISSIONS_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory());

    sections.forEach(section => {
        const sectionName = section.name;
        const sectionPath = path.join(SUBMISSIONS_DIR, sectionName);
        
        const groupObj = {
            groupName: sectionName,
            projects: []
        };

        // Get all Students in this Section
        const students = fs.readdirSync(sectionPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory());

        students.forEach(student => {
            const studentName = student.name; // Folder name is Student Name
            const studentPathInt = `./submissions/${sectionName}/${studentName}/index.html`;

            // Check if we have existing metadata for this specific path
            let existingProject = null;
            
            // Search in existing groups
            if (existingData.showcaseGroups) {
                for (const g of existingData.showcaseGroups) {
                    const found = g.projects.find(p => p.path === studentPathInt);
                    if (found) {
                        existingProject = found;
                        break;
                    }
                }
            }

            // AUTO-DETECT THUMBNAIL
            let detectedThumb = "assets/placeholder.jpg";
            try {
                const studentFiles = fs.readdirSync(path.join(sectionPath, studentName));
                const imageFile = studentFiles.find(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
                if (imageFile) {
                    detectedThumb = `./submissions/${sectionName}/${studentName}/${imageFile}`;
                }
            } catch (err) {
                // Ignore error, keep placeholder
            }

            // Build Project Object
            const projectObj = {
                id: existingProject ? existingProject.id : 'id_' + Math.random().toString(36).substr(2, 9),
                studentName: studentName, // Folder name
                projectTitle: existingProject ? existingProject.projectTitle : "Portfolio",
                thumbnail: existingProject ? existingProject.thumbnail !== "assets/placeholder.jpg" ? existingProject.thumbnail : detectedThumb : detectedThumb, 
                // Logic above: If existing has a real thumb, keep it. Else use detected.
                path: studentPathInt,
                teacherComment: existingProject ? existingProject.teacherComment : "",
                tags: existingProject ? existingProject.tags : ['New']
            };

            groupObj.projects.push(projectObj);

            // Add to Review Queue (Flat list)
            newReviewQueue.push({
                id: projectObj.id,
                name: studentName,
                path: studentPathInt,
                group: sectionName // Added for filtering
            });
        });

        if (groupObj.projects.length > 0) {
            newShowcaseGroups.push(groupObj);
        }
    });
} else {
    console.log("❌ 'submissions' folder not found!");
}

// 3. WRITE FILE
const FINAL_CONFIG = {
    reviewQueue: newReviewQueue,
    showcaseGroups: newShowcaseGroups
};

const fileContent = `// This file acts as your "Database".
// You edit this to add new students.

const CONFIG = ${JSON.stringify(FINAL_CONFIG, null, 4)};

if (typeof module !== 'undefined') {
    module.exports = CONFIG;
}
`;

fs.writeFileSync(DATA_FILE, fileContent);
console.log(`\n🎉 SUCCESS! Generated data.js with:`);
console.log(`   - ${newShowcaseGroups.length} Groups`);
console.log(`   - ${newReviewQueue.length} Projects`);
