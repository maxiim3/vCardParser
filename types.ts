export type VCard = {
    [key: string]: any;
};
export type TypeInfo = {
    name: string;
    value: string;
};
export type Context = {
    info: (desc: string) => void;
    error: (err: string) => void;
    data: string[];
    currentCard: VCard;
    cards: VCard[];
};
