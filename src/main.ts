import { logger } from './utils/logger';

import * as dotenv from 'dotenv-extended';
import fs from 'fs';

import { AnkiWord, loadTSVContent } from './utils/load-tsv-content';
import path from 'path';
import { concurrentProcessor } from './utils/concurrent-processor';
import { primeProcessNote } from './utils/process-item';

// Load environment variables from .env file
dotenv.load({
    path: '.env.local',
    errorOnMissing: true,
    errorOnExtra: true,
});

// Define types for your environment variables
interface EnvVariables {
    TSV_ANKI_EXPORT_FILE: string;
    TSV_ANKI_OUTPUT_FILE: string;
    ANKI_LANGUAGE: string;
    MAX_CONCURRENCY: string;
    FROM_LANGUAGE: string;
    TO_LANGUAGE: string
}

const {
    MAX_CONCURRENCY,
    TSV_ANKI_EXPORT_FILE,
    FROM_LANGUAGE,
    TO_LANGUAGE,
 }: EnvVariables = process.env as unknown as EnvVariables;

export interface GeneraSentencePrompt {
    (word: AnkiWord): string;
}
const primeGenerateSentencePrompt = (fromLanguage: string, toLanguage: string): GeneraSentencePrompt => {
    return (word: AnkiWord): string => {

        // Modify this string to change the output
//         return `Using this word or phrase "${word.text}" in ${fromLanguage} please generate 4 sentences in both ${fromLanguage} and ${toLanguage}. 2 sentences should be from the patient to the medical professional and 2 from the medical professional to the patient.

// The sentences should be from a medical setting at a hospital either in a 1:1 session between medical professional and patient or while the dr is doing rounds.

// Please vary the content and tone of the sentences. Make these sentences quite long and complex.

        // When the medical professionals are speaking make sure they use correct and typical medical terminology.`;
        
        return `Using this word or phrase "${word.text}" in ${fromLanguage} please generate 4 sentences in ${fromLanguage}. Also generate the translation in ${fromLanguage}. The words are from a technology/software engineering vocabulary list.

Please vary the content and tone of the sentences. The sentences should vary from short to long and complex.`;
    }
}

(async function (): Promise<void> {
    logger.info(`Processing words from TSV deck "${TSV_ANKI_EXPORT_FILE}"`);
    
    const words = await loadTSVContent(path.join(__dirname, '../data', TSV_ANKI_EXPORT_FILE));
        logger.info(`Found ${words.length} entries eligible for fetching`);
        if (words.length === 0) {
            throw new Error('TSV file is empty')
        }
    
        const fileHandle = await fs.promises.open(path.join(__dirname, '../data', `sentences-${TSV_ANKI_EXPORT_FILE}`), 'a');

    await concurrentProcessor(
        words,
        parseInt(MAX_CONCURRENCY as string),
        primeProcessNote(fileHandle, primeGenerateSentencePrompt(FROM_LANGUAGE, TO_LANGUAGE))
    );
})();
