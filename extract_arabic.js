const fs = require('fs');

const lines = fs.readFileSync('C:/Users/AYOUB/.gemini/antigravity/brain/a3c3588b-3061-492e-98ba-fd370c2882ad/.system_generated/logs/transcript_full.jsonl', 'utf-8').split('\n');

for (const line of lines) {
  if (!line) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT' && /[\u0600-\u06FF]/.test(data.content)) {
      console.log('--- FOUND ARABIC IN USER_INPUT ---');
      console.log(data.content.substring(0, 500));
    } else if (data.type === 'PLANNER_RESPONSE' && data.tool_calls) {
      for (const call of data.tool_calls) {
        if (call.name === 'write_to_file' || call.name === 'replace_file_content') {
          if (call.arguments.CodeContent && /[\u0600-\u06FF]/.test(call.arguments.CodeContent)) {
             console.log('--- FOUND ARABIC IN TOOL CALL ---');
             console.log('File:', call.arguments.TargetFile);
             fs.writeFileSync('C:/Users/AYOUB/Desktop/webgobuilder/found_arabic.txt', call.arguments.CodeContent);
          } else if (call.arguments.ReplacementContent && /[\u0600-\u06FF]/.test(call.arguments.ReplacementContent)) {
             console.log('--- FOUND ARABIC IN REPLACEMENT ---');
             console.log('File:', call.arguments.TargetFile);
          }
        }
      }
    }
  } catch (e) {}
}
