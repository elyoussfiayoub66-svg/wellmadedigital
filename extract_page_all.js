const fs = require('fs');

const lines = fs.readFileSync('C:/Users/AYOUB/.gemini/antigravity/brain/a3c3588b-3061-492e-98ba-fd370c2882ad/.system_generated/logs/transcript_full.jsonl', 'utf-8').split('\n');
let maxLines = 0;
let bestContent = '';

for (const line of lines) {
  if (!line) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'PLANNER_RESPONSE' && data.tool_calls) {
      for (const call of data.tool_calls) {
        if (call.name === 'write_to_file' || call.name === 'replace_file_content') {
          if (call.arguments.TargetFile && (call.arguments.TargetFile.includes('app\\page.jsx') || call.arguments.TargetFile.includes('app/page.jsx'))) {
            if (call.arguments.CodeContent) {
              const contentLines = call.arguments.CodeContent.split('\n').length;
              console.log(`Found write_to_file for page.jsx with ${contentLines} lines`);
              if (contentLines > maxLines) {
                maxLines = contentLines;
                bestContent = call.arguments.CodeContent;
              }
            }
          }
        }
      }
    }
  } catch (e) {}
}

if (bestContent) {
  console.log(`Extracting the largest version found: ${maxLines} lines`);
  fs.writeFileSync('C:/Users/AYOUB/Desktop/webgobuilder/app/page.recovered.jsx', bestContent);
} else {
  console.log("No CodeContent found.");
}
