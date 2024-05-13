import { ApiResponse } from "../types/ResponeType";

export const errorApiResponse = ({ statusCode, message }: { statusCode: number, message: string }): ApiResponse => ({statusCode, message });

export const successApiResponse = ({ statusCode, message, data }: { statusCode: number, message:string, data?: any  }): ApiResponse => ({statusCode, message, data });
