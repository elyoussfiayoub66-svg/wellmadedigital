const fs = require('fs');

const lines = fs.readFileSync('C:/Users/AYOUB/.gemini/antigravity/brain/a3c3588b-3061-492e-98ba-fd370c2882ad/.system_generated/logs/transcript_full.jsonl', 'utf-8').split('\n');

for (const line of lines) {
  if (!line) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'PLANNER_RESPONSE' && data.tool_calls) {
      for (const call of data.tool_calls) {
        if (call.name === 'write_to_file' || call.name === 'replace_file_content') {
          if (call.arguments.TargetFile && call.arguments.TargetFile.includes('app\\page.jsx')) {
            console.log('--- FOUND WRITE TO app/page.jsx ---');
            console.log('Action:', call.name);
            console.log('Timestamp:', data.timestamp);
            if (call.arguments.CodeContent) {
              const content = call.arguments.CodeContent;
              if (/[\u0600-\u06FF]/.test(content)) {
                console.log('CONTAINS ARABIC');
                fs.writeFileSync('C:/Users/AYOUB/Desktop/webgobuilder/app/page.backup.jsx', content);
              }
            }
          }
        }
      }
    }
  } catch (e) {}
}
