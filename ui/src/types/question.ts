export interface Question {
    id: number;
    text: string;
}

export interface Category {
    id: number;
    name: string;
    questions: Question[];
}
