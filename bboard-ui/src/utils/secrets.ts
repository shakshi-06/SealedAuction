export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export function getOrCreateSecret(keyName: string, address: string): Uint8Array {
  const storageKey = `SECRET_${address}_${keyName}`;
  const existing = localStorage.getItem(storageKey);
  if (existing) {
    return fromHex(existing);
  }
  const newSecret = new Uint8Array(32);
  window.crypto.getRandomValues(newSecret);
  localStorage.setItem(storageKey, toHex(newSecret));
  return newSecret;
}

export function saveUserBid(walletAddress: string, contractAddress: string, amount: string) {
  localStorage.setItem(`BID_${walletAddress}_${contractAddress}`, amount);
}

export function getUserBid(walletAddress: string, contractAddress: string): string | null {
  return localStorage.getItem(`BID_${walletAddress}_${contractAddress}`);
}
