const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'js', 'data.js');

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // API: Save Data
    if (req.method === 'POST' && req.url === '/api/save') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                handleSave(payload, res);
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Invalid JSON" }));
            }
        });
        return;
    }

    // STATIC FILE SERVING
    const safeUrl = decodeURIComponent(req.url === '/' ? 'index.html' : req.url);
    let filePath = path.join(__dirname, safeUrl);
    const ext = path.extname(filePath).toLowerCase();
    
    fs.exists(filePath, (exists) => {
        if (!exists) {
            res.writeHead(404);
            res.end(`File not found: ${req.url}`);
            return;
        }

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            } else {
                res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
                res.end(content, 'utf-8');
            }
        });
    });
});

function handleSave(payload, res) {
    // payload: { id, studentName, projectTitle, teacherComment, tags }

    // 1. Read existing file
    let fileContent = fs.readFileSync(DATA_FILE, 'utf8');
    
    // We need to parse the CONFIG object from the file string. 
    // Since it's a JS file, not JSON, we can't just JSON.parse it.
    // However, our `generate.js` writes it as `const CONFIG = JSON...`.
    // So we can try to find the JSON part.
    
    // Safety check: Does it look like our generated file?
    /*
        const CONFIG = {
            ...
        };
    */
    
    // STRATEGY: instead of complete re-write which might be risky with regex,
    // lets rely on the fact that `generate.js` writes valid JSON structure inside `const CONFIG = ... ;`
    
    // Actually, to be safe and robust, let's just load the module, modify the object, and re-write the file entirely using the SAME template as generate.js.
    
    try {
        // Clear cache to ensure we read latest
        delete require.cache[require.resolve(DATA_FILE)];
        const currentConfig = require(DATA_FILE);

        let found = false;

        // Find and Update in ShowcaseGroups
        if (currentConfig.showcaseGroups) {
            for (const group of currentConfig.showcaseGroups) {
                const project = group.projects.find(p => p.id === payload.id);
                if (project) {
                    project.projectTitle = payload.projectTitle;
                    project.teacherComment = payload.teacherComment;
                    project.tags = payload.tags; // Array
                    found = true;
                    // Note: We don't update path/thumbnail/name here usually, as those are filesystem based.
                }
            }
        }
        
        if (!found) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: "Project ID not found in database." }));
            return;
        }

        // Re-construct the file content
        const newFileContent = `// This file acts as your "Database".
// You edit this to add new students.

const CONFIG = ${JSON.stringify(currentConfig, null, 4)};

if (typeof module !== 'undefined') {
    module.exports = CONFIG;
}
`;
        fs.writeFileSync(DATA_FILE, newFileContent);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));

    } catch (e) {
        console.error(e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: e.message }));
    }
}

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Open http://localhost:${PORT}/reviewer.html to review.`);
});
