/** Demonstration MCP transport over MessagePort: no fabricated requests. */
export class PortTransport {
  constructor(port, observe = () => {}, side = 'unknown') {
    this.port = port;
    this.observe = observe;
    this.side = side;
    this.started = false;
    this.closed = false;
    this.handle = event => {
      const packet = event.data;
      if (!packet || packet.kind !== 'mcp' || typeof packet.message !== 'object' || !packet.message) return;
      this.observe({direction: 'received', side: this.side, message: packet.message});
      this.onmessage?.(packet.message);
    };
  }
  async start() {
    if (this.started) throw Error('PortTransport already started');
    this.started = true;
    this.port.addEventListener('message', this.handle);
    this.port.start();
  }
  async send(message) {
    if (!this.started || this.closed) throw Error('Transport non actif');
    this.observe({direction: 'sent', side: this.side, message});
    this.port.postMessage({kind: 'mcp', message});
  }
  async close() {
    if (this.closed) return;
    this.closed = true;
    this.port.removeEventListener('message', this.handle);
    this.port.close();
    this.onclose?.();
  }
}
export function describeMessage(message) {
  if (message.method) return {method: message.method, class: message.id === undefined ? 'notification' : 'request'};
  if ('error' in message) return {method: null, class: 'rpc-error'};
  if ('result' in message) return {method: null, class: 'response'};
  return {method: null, class: 'other'};
}
