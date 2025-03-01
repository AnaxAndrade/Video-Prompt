#!/usr/bin/env node
/**
 * Utility script to parse script files into JSON for the teleprompter
 * 
 * Usage: node script-parser.js <input-file.txt> <output-file.json>
 * 
 * Legend for the script:
 * [     ] = Context
 * {     } = Emotion to convey
 * <     > = Visuals
 * "     " = Speeches, to be spoken
 */

const fs = require('fs');
const path = require('path');

function parseScript(scriptContent) {
    // Split by lines
    const lines = scriptContent.split('\n');
    
    const scriptData = [];
    let contextStack = [];
    let currentSpeech = '';
    let currentEmotion = '';
    let currentVisual = '';
    let lastIndentation = -1;
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        const indentation = line.search(/\S|$/);
        
        // Skip empty lines
        if (trimmedLine === '') continue;
        
        // Process context blocks (text in square brackets)
        const contextMatch = trimmedLine.match(/^-\s*\[(.*?)\]/);
        if (contextMatch) {
            // Save any pending speech entry before changing context
            if (currentSpeech) {
                scriptData.push({
                    context: formatContext(contextStack),
                    speech: currentSpeech,
                    emotion: currentEmotion,
                    visual: currentVisual
                });
                
                // Reset for next entry
                currentSpeech = '';
                currentEmotion = '';
                currentVisual = '';
            }
            
            // If indentation is less than or equal to last context, pop from stack
            if (lastIndentation >= 0 && indentation <= lastIndentation) {
                // Remove contexts at same or deeper level
                while (contextStack.length > 0 && 
                       contextStack[contextStack.length - 1].indentation >= indentation) {
                    contextStack.pop();
                }
            }
            
            // Add new context to the stack
            contextStack.push({
                text: contextMatch[1],
                indentation: indentation
            });
            
            lastIndentation = indentation;
            continue;
        }
        
        // Process speech (allow straight or curly quotes)
        const speechMatch = trimmedLine.match(/^-\s*["“](.*?)["”]/);
        if (speechMatch) {
            // Add previous speech entry if there was one
            if (currentSpeech) {
                scriptData.push({
                    context: formatContext(contextStack),
                    speech: currentSpeech,
                    emotion: currentEmotion,
                    visual: currentVisual
                });
                
                // Reset emotion and visual for the next entry
                currentEmotion = '';
                currentVisual = '';
            }
            
            // Set the new current speech
            currentSpeech = speechMatch[1];
            continue;
        }
        
        // Process emotion (text in braces)
        const emotionMatch = trimmedLine.match(/^-\s*\{(.*?)\}/);
        if (emotionMatch) {
            currentEmotion = emotionMatch[1];
            continue;
        }
        
        // Process visual (text in angle brackets)
        const visualMatch = trimmedLine.match(/^-\s*<(.*?)>/);
        if (visualMatch) {
            currentVisual = visualMatch[1];
            
            // Check if this completes a speech entry
            const nextLineIndex = i + 1;
            const isEndOfSpeechGroup = 
                nextLineIndex >= lines.length || 
                (lines[nextLineIndex].trim() === '') ||
                lines[nextLineIndex].trim().match(/^-\s*"/) ||
                lines[nextLineIndex].trim().match(/^-\s*\[/);
                
            if (isEndOfSpeechGroup && currentSpeech) {
                // Add the completed speech entry
                scriptData.push({
                    context: formatContext(contextStack),
                    speech: currentSpeech,
                    emotion: currentEmotion,
                    visual: currentVisual
                });
                
                // Reset for next entry
                currentSpeech = '';
                currentEmotion = '';
                currentVisual = '';
            }
            
            continue;
        }
    }
    
    // Add any remaining speech entry
    if (currentSpeech) {
        scriptData.push({
            context: formatContext(contextStack),
            speech: currentSpeech,
            emotion: currentEmotion,
            visual: currentVisual
        });
    }
    
    return scriptData;
}

// Helper function to format the context stack into a string
function formatContext(contextStack) {
    if (contextStack.length === 0) return '';
    
    return contextStack
        .map(ctx => `[${ctx.text}]`)
        .join(' ');
}

function main() {
    // Check for correct number of arguments
    if (process.argv.length !== 4) {
        console.log('Usage: node script-parser.js <input-file.txt> <output-file.json>');
        process.exit(1);
    }

    const inputFile = process.argv[2];
    const outputFile = process.argv[3];

    try {
        // Read the input file
        const scriptContent = fs.readFileSync(inputFile, 'utf-8');
        
        // Parse the script
        const scriptData = parseScript(scriptContent);
        
        // Write the output JSON file
        fs.writeFileSync(outputFile, JSON.stringify(scriptData, null, 2));
        
        console.log(`Script successfully parsed and saved to ${outputFile}`);
        console.log(`Processed ${scriptData.length} script segments`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Execute the main function
main();
