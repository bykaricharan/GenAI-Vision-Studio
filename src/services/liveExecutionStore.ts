export interface ModuleExecutionData {
  module: string;
  question: string;
  response: string;
  retrievedContext: string;
  timestamp: string;
}

const STORAGE_KEY = 'genai_vision_latest_module_executions';

class LiveExecutionStore {
  private memoryStore: Record<string, ModuleExecutionData> = {};

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.memoryStore = JSON.parse(data);
      }
    } catch {
      this.memoryStore = {};
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryStore));
    } catch {
      // Ignore storage errors
    }
  }

  public setLatestExecution(module: string, question: string, response: string, retrievedContext: string = '') {
    const record: ModuleExecutionData = {
      module,
      question,
      response,
      retrievedContext,
      timestamp: new Date().toISOString(),
    };
    this.memoryStore[module] = record;
    this.saveToStorage();
  }

  public getLatestExecution(module: string): ModuleExecutionData | null {
    return this.memoryStore[module] || null;
  }

  public clearModuleExecution(module: string) {
    delete this.memoryStore[module];
    this.saveToStorage();
  }
}

export const liveExecutionStore = new LiveExecutionStore();
