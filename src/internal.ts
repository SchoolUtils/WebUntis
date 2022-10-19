import type { SchoolYear } from './types';
export type InternalSchoolYear = Omit<SchoolYear, 'startDate' | 'endDate'> & { startDate: string; endDate: string };

export type SessionInformation = {
    klasseId?: number;
    personId?: number;
    sessionId?: string;
    personType?: number;
    jwt_token?: string;
};
