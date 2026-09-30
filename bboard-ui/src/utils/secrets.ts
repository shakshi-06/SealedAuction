export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function fromHex(hex: string): Uint8Array {
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = parseInt(normalized.substring(i, i + 2), 16);
  }
  return bytes;
}

function norm(str: string): string {
  return (str || '').trim().toLowerCase();
}

export function getOrCreateSecret(keyName: string, address: string): Uint8Array {
  const cleanAddr = norm(address);
  const storageKey = `SECRET_${cleanAddr}_${keyName}`;
  const existing = localStorage.getItem(storageKey);
  if (existing) {
    try {
      return fromHex(existing);
    } catch (_e) {
      // Regenerate if corrupted
    }
  }
  const newSecret = new Uint8Array(32);
  window.crypto.getRandomValues(newSecret);
  localStorage.setItem(storageKey, toHex(newSecret));
  return newSecret;
}

export function saveUserBid(walletAddress: string, contractAddress: string, amount: string) {
  const w = norm(walletAddress);
  const c = norm(contractAddress);
  if (w && c) localStorage.setItem(`BID_${w}_${c}`, amount);
  if (c) localStorage.setItem(`BID_CONTRACT_${c}`, amount);
  localStorage.setItem(`BID_LAST_GLOBAL`, amount);
}

export function getUserBid(walletAddress: string, contractAddress: string): string | null {
  const w = norm(walletAddress);
  const c = norm(contractAddress);
  if (w && c) {
    const specific = localStorage.getItem(`BID_${w}_${c}`);
    if (specific) return specific;
  }
  if (c) {
    const contractBid = localStorage.getItem(`BID_CONTRACT_${c}`);
    if (contractBid) return contractBid;
  }
  return localStorage.getItem(`BID_LAST_GLOBAL`);
}
