export interface EventBase {
    description?: string;
    endTime: string;
    startTime: string;
    title: string;
}

export interface EventCreate extends EventBase {}

export interface HostOut {
    id: number;
    name: string;
}

export interface EventOut extends EventBase {
    hosts: HostOut[];
    id: number;
}

export interface ParticipantOut {
    participantName: string;
    role: string;
}
