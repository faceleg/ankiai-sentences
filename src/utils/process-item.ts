import { FileHandle } from 'fs/promises';
import { fetchSentences } from '../openai/get-sentences-from-chatgpt';
import { AnkiWord } from './load-tsv-content';
import { SentencePair, Sentences } from '../openai/typechat-response-schema';
import { GeneraSentencePrompt } from '../main';

export interface ProcessAnkiTSVEntry {
    (word: AnkiWord): Promise<void>;
}

interface MergedObject {
    id: number;
    sentences: SentencePair[];
}

function mergeObjects(objects: Sentences[]): Sentences {
    const mergedObject: MergedObject = {
        id: 0,
        sentences: [],
    };

    objects.forEach((obj) => {
        mergedObject.id = obj.id;
        mergedObject.sentences = mergedObject.sentences.concat(obj.sentences);
    });

    return mergedObject;
}

export const primeProcessNote = (
    fileHandle: FileHandle,
    generateSentencePrompt: GeneraSentencePrompt
): ProcessAnkiTSVEntry => {
    return async (word: AnkiWord): Promise<void> => {
        const sentencesFromChatGPT = await fetchSentences(word, generateSentencePrompt);
        const mergedSentences = mergeObjects(sentencesFromChatGPT);
        for (const sentence of mergedSentences.sentences) {
            await fileHandle.appendFile(`${sentence.sentence}|${sentence.translation}|${sentence.pinyin}|sentences` + '\n');
        }
    };
};
