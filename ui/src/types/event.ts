export interface Address {
    formattedAddress: string;
    lat: number;
    lon: number;
    placeId: number;
}

export interface EventBase {
    address: Address;
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
