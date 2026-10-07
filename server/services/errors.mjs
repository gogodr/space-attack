/** Expected request failures; HTTP middleware translates these without logging credentials. */
export class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'RequestError';
    this.status = status;
  }
}
