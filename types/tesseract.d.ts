declare module 'tesseract.js' {
  interface WorkerOptions {
    logger?: (log: any) => void;
    langPath?: string;
    corePath?: string;
    workerPath?: string;
    cachePath?: string;
    workerBlobURL?: boolean;
    gzip?: boolean;
    cacheMethod?: string;
    [key: string]: any;
  }

  interface RecognizeResult {
    data: {
      text: string;
      hocr?: string;
      tsv?: string;
      blocks?: any[];
      confidence?: number;
      lines?: any[];
      oem?: string;
      paragraphs?: any[];
      psm?: string;
      symbols?: any[];
      version?: string;
      words?: any[];
    };
    [key: string]: any;
  }

  interface Worker {
    load: (jobId?: string) => Promise<Worker>;
    loadLanguage: (langs: string | string[]) => Promise<Worker>;
    initialize: (langs: string | string[]) => Promise<Worker>;
    setParameters: (params: object) => Worker;
    recognize: (image: any) => Promise<RecognizeResult>;
    detect: (image: any) => Promise<any>;
    terminate: () => Promise<any>;
  }

  export function createWorker(options?: WorkerOptions): Promise<Worker>;
  export function setLogging(logging: boolean): void;
  export const PSM: Record<string, string | number>;
  export const OEM: Record<string, string | number>;
} 