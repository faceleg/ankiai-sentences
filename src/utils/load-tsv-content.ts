import fs from 'fs';

export interface AnkiWord {
    text: string;
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
}
function stripSoundTags(text: string): string {
    return text.replace(/\[sound:.*?\]/g, '');
}
function replaceNbsp(text: string): string {
    return text.replace('&nbsp;', '');
}

// Define a function to read and parse the TSV file
// Assumes the first item is the word
export function loadTSVContent(filename: string): Promise<AnkiWord[]> {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                const lines = data
                    .split('\n')
                    .filter((line) => !line.startsWith('#')) // Ignore lines starting with #
                    .map(stripHtml)
                    .map(replaceNbsp)
                    .map(stripSoundTags)
                    .map((line) => line.trim());

                resolve(
                    lines.map((line) => ({
                        text: line.split('\t')[0].trim(),
                    })),
                );
            }
        });
    });
}
