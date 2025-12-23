// --- Questions ---
export interface QuestionCreate {
    answerText?: string | null;
    categoryId?: number | null;
    inviteToken?: string | null;
    isPublished?: boolean;
    questionText: string;
}

export interface QuestionUpdate {
    answerText?: string | null;
    askerUserIds?: number[] | null;
    questionText?: string | null;
}

export interface OrderUpdateItem {
    categoryId?: number | null;
    draftOrder?: number | null;
    isPublished: boolean;
    publishedOrder?: number | null;
    questionId: number;
}

export interface OrderUpdate {
    items: OrderUpdateItem[];
}

export interface QuestionOut {
    answerText?: string | null;
    askerUserIds: number[];
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
    createdAt: string;
    displayOrder: number;
    eventId: number;
    id: number;
    name: string;
    updatedAt: string;
}
