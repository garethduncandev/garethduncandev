import { VERSION } from './version.js';

export default class GarethDuncanDev {
  public get version(): string {
    return VERSION;
  }

  public readme(): string {
    return 'Hello, this is Gareth';
  }
}
