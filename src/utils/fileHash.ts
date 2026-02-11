import { blake3 } from '@noble/hashes/blake3.js';

export function computeFileHashFromBuffer(buffer: ArrayBuffer): string {
  const hashBuffer = blake3(new Uint8Array(buffer));
  const hashHex = Array.from(hashBuffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

export async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return computeFileHashFromBuffer(buffer);
}
