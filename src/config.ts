export const BASE_URL = "http://localhost:8000";

export type resObjType = {
    status: number,
    message: string,
    data?: {
        title?: string,
        description?: string
    }
};