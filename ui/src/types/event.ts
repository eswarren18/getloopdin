export interface EventBase {
    description?: string;
    endTime: string;
    startTime: string;
    title: string;
}

export interface EventCreate extends EventBase {}

export interface EventOut extends EventBase {
    id: number;
}

export interface ParticipantOut {
    id: number;
    name: string;
    role: string;
}
