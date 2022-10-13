export interface ErrorController {
  message: string | null;
  code?: number;
  data?: any;
}
