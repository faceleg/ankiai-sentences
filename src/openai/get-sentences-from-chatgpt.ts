import fs from 'fs';
import path from 'path';
import { createJsonTranslator, createLanguageModel } from 'typechat';
import { createTypeScriptJsonValidator } from 'typechat/ts';

import type { Sentences, SentencesList } from './typechat-response-schema';
import { logger } from '../utils/logger';
import { AnkiWord } from '../utils/load-tsv-content';
import { GeneraSentencePrompt } from '../main';

export const fetchSentences = async (
    word: AnkiWord,
    generateSentencePrompt: GeneraSentencePrompt
): Promise<Sentences[]> => {
    const exampleSentencesModel = createLanguageModel(process.env);

    const exampleSentencesSchema = fs.readFileSync(
        path.join(__dirname, '../../src/openai/typechat-response-schema.ts'),
        'utf8',
    );
    const exampleSentencesValidator = createTypeScriptJsonValidator<SentencesList>(
        exampleSentencesSchema,
        'SentencesList',
    );
    const exampleSentencesTranslator = createJsonTranslator(exampleSentencesModel, exampleSentencesValidator);
    const exampleSentencesPrompt = generateSentencePrompt(word)

    logger.debug(exampleSentencesPrompt);

    const exampleSentencesResponse = await exampleSentencesTranslator.translate(exampleSentencesPrompt);

    if (!exampleSentencesResponse.success) {
        console.dir({ note: word, exampleSentencesResponse }, { depth: 15 });
        throw new Error('Error fetching data from chatGPT: ' + exampleSentencesResponse.message);
    } else {
        logger.debug(exampleSentencesResponse.data.items);
        return exampleSentencesResponse.data.items;
    }
};
