export interface SentencesList {
    items: Sentences[];
}

export interface SentencePair {
    sentence: string;
    translation: string;
    pinyin: string;
}

export interface Sentences {
    id: number;
    sentences: SentencePair[];
}
