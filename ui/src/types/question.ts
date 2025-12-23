// --- Questions ---
export interface QuestionCreate {
    questioText: string;
    answerText?: string | null;
    categoryId?: number | null;
    isPublished?: boolean;
    inviteToken?: string | null;
}

export interface QuestionUpdate {
    askerUserIds?: number[] | null;
    answerText?: string | null;
    questionText?: string | null;
}

export interface OrderUpdateItem {
    questionId: number;
    isPublished: boolean;
    categoryId?: number | null;
    publishedOrder?: number | null;
    draftOrder?: number | null;
}

export interface OrderUpdate {
    items: OrderUpdateItem[];
}

export interface QuestionOut {
    answerText?: string | null;
    categoryId?: number | null;
    draftOrder?: number | null;
    eventId: number;
    id: number;
    isPublished: boolean;
    publishedOrder?: number | null;
    questionText: string;
    userId?: number | null;
}

// --- Categories ---
export interface QuestionCategoryCreate {
    name: string;
}

export interface QuestionCategoryUpdate {
    name?: string | null;
}

export interface QuestionCategoryOrderItem {
    categoryId: number;
    displayOrder: number;
}

export interface QuestionCategoryOrderUpdate {
    items: QuestionCategoryOrderItem[];
}

export interface QuestionCategoryOut {
    id: number;
    eventId: number;
    name: string;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}
