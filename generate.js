const fs = require('fs');
const path = require('path');

const SUBMISSIONS_DIR = path.join(__dirname, 'submissions');
const DATA_FILE = path.join(__dirname, 'js', 'data.js');

let existingData = {};
try {
    const data = require(DATA_FILE);
    existingData = data;
    console.log("✅ Loaded existing data.js (Comments will be preserved)");
} catch (e) {
    console.log("⚠️ Could not load existing data.js (Creating fresh)");
}

const newShowcaseGroups = [];
const newReviewQueue = [];

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

            const students = fs.readdirSync(sectionPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory());

        students.forEach(student => {
            const studentName = student.name;
            const studentPathInt = `./submissions/${sectionName}/${studentName}/index.html`;

            let existingProject = null;
            
            if (existingData.showcaseGroups) {
                for (const g of existingData.showcaseGroups) {
                    const found = g.projects.find(p => p.path === studentPathInt);
                    if (found) {
                        existingProject = found;
                        break;
                    }
                }
            }

            let detectedThumb = "assets/placeholder.jpg";
            try {
                const studentFiles = fs.readdirSync(path.join(sectionPath, studentName));
                const imageFile = studentFiles.find(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
                if (imageFile) {
                    detectedThumb = `./submissions/${sectionName}/${studentName}/${imageFile}`;
                }
            } catch (err) {
            }

            const projectObj = {
                id: existingProject ? existingProject.id : 'id_' + Math.random().toString(36).substr(2, 9),
                studentName: studentName,
                projectTitle: existingProject ? existingProject.projectTitle : "Portfolio",
                thumbnail: existingProject ? existingProject.thumbnail !== "assets/placeholder.jpg" ? existingProject.thumbnail : detectedThumb : detectedThumb, 
                path: studentPathInt,
                teacherComment: existingProject ? existingProject.teacherComment : "",
                tags: existingProject ? existingProject.tags : ['New']
            };

            groupObj.projects.push(projectObj);

            newReviewQueue.push({
                id: projectObj.id,
                name: studentName,
                path: studentPathInt,
                group: sectionName
            });
        });

        if (groupObj.projects.length > 0) {
            newShowcaseGroups.push(groupObj);
        }
    });
} else {
    console.log("❌ 'submissions' folder not found!");
}

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
