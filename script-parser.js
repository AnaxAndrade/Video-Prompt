/**
 * Utility script to help parse the original script format into JSON for the teleprompter
 * 
 * This script can be run in a browser console while viewing the original HTML
 * to extract the structured data from the script content
 */

function parseScript() {
    // Get the script content from the page
    const scriptContent = document.body.innerText;
    
    // Split by paragraphs
    const paragraphs = scriptContent.split('\n').filter(line => line.trim().length > 0);
    
    const scriptData = [];
    let currentContext = '';
    
    paragraphs.forEach(paragraph => {
        // Extract context (text in square brackets)
        const contextMatch = paragraph.match(/\[(.*?)\]/);
        if (contextMatch && contextMatch[0].startsWith(paragraph.trim())) {
            currentContext = contextMatch[1];
            return;
        }
        
        // Extract speech (text in quotes)
        const speechMatch = paragraph.match(/"(.*?)"/);
        if (!speechMatch) return;
        
        // Extract emotion (text in braces)
        const emotionMatch = paragraph.match(/\{(.*?)\}/);
        
        // Extract visual (text in angle brackets)
        const visualMatch = paragraph.match(/<(.*?)>/);
        
        if (speechMatch) {
            scriptData.push({
                context: currentContext,
                speech: speechMatch[1],
                emotion: emotionMatch ? emotionMatch[1] : "",
                visual: visualMatch ? visualMatch[1] : ""
            });
        }
    });
    
    // Output the resulting JSON
    console.log(JSON.stringify(scriptData, null, 2));
    return scriptData;
}

// Call the function to parse the script
const scriptData = parseScript();
