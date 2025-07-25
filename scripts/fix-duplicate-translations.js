const fs = require('fs');
const path = require('path');

// Read the translations file
const translationsPath = path.join(__dirname, '..', 'data', 'translations.ts');
let content = fs.readFileSync(translationsPath, 'utf8');

// Remove the duplicate translations at the end (lines 844 onwards)
// Find the position of export const languageNames
const exportMatch = content.match(/export const languageNames: Record<string, string> = {/);
if (exportMatch) {
  const exportPosition = content.indexOf(exportMatch[0]);
  
  // Find the second occurrence of vi: { before the export
  const beforeExport = content.slice(0, exportPosition);
  const viMatches = [...beforeExport.matchAll(/  vi: \{/g)];
  
  if (viMatches.length > 1) {
    // Remove from the second vi: { to just before export
    const secondViPosition = viMatches[1].index;
    const newContent = content.slice(0, secondViPosition) + content.slice(exportPosition);
    
    fs.writeFileSync(translationsPath, newContent, 'utf8');
    console.log('Fixed duplicate translations!');
  } else {
    console.log('No duplicates found.');
  }
}