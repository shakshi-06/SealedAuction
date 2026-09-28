// Polyfill Buffer for the browser. Required by Midnight SDK WASM modules
import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;
