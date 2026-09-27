// Polyfill Buffer for the browser — required by Midnight SDK WASM modules
import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;
