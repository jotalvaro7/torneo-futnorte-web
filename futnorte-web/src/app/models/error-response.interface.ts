export interface ErrorResponse {
  code: string;
  message: string;
  traceId: string;
  path: string;
  timestamp: string;
  details?: { [key: string]: string };
}