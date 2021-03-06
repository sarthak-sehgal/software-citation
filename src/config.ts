export const BASE_URL = "./api";

export type resObjType = {
    status: number,
    message: string,
    data?: {
        title?: string,
        description?: string
    }
};

export type cffDataType = {
  doi?: string,
  ["date-released"]?: string,
  version?: string,
  title?: string,
  abstract?: string,
  keywords?: [string],
  license?: string,
  repository?: string,
  url?: string,
  authors?: string,
  message?: string
};