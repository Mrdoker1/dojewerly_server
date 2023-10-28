import * as NodePersist from 'node-persist';

export class StorageService {
  private storage: NodePersist.LocalStorage;

  constructor() {
    this.storage = NodePersist.create({
      dir: 'data', // Директория для сохранения данных
    });
    this.storage.init(); // Используйте метод init вместо initSync
  }

  async setItem(key: string, value: any): Promise<void> {
    await this.storage.setItem(key, value);
  }

  async getItem(key: string): Promise<any> {
    return await this.storage.getItem(key);
  }

  async removeItem(key: string): Promise<void> {
    await this.storage.removeItem(key);
  }
}
