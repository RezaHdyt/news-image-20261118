// news-image-20261118 entry: a one-page newspaper front page summing up
// Wednesday 18 November 2026 in 36 verified stories. The finished image
// lives beside this file as entry.png; this program checks it against the
// competition gate (whole PNG, at most 1 MiB, at most 1024x1024) and copies
// it to the output directory. Node 22, standard library only, no network.
//
// Run it locally with:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 1048576; // 1 MiB
const MAX_SIDE = 1024; // pixels
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const here = dirname(fileURLToPath(import.meta.url));
const imagePath = join(here, 'entry.png');

if (!existsSync(imagePath)) {
  throw new Error('entry.png is missing from the repository');
}
const image = readFileSync(imagePath);

function fail(message) {
  throw new Error(`entry.png rejected: ${message}`);
}

// A PNG starts with its 8-byte signature; anything else is not a PNG.
for (let i = 0; i < PNG_MAGIC.length; i += 1) {
  if (image[i] !== PNG_MAGIC[i]) fail('bad PNG signature');
}
// The IHDR chunk stores width and height as big-endian uint32s at byte
// offsets 16 and 20.
const width = image.readUInt32BE(16);
const height = image.readUInt32BE(20);
if (width > MAX_SIDE || height > MAX_SIDE) {
  fail(`dimensions ${width}x${height} exceed the ${MAX_SIDE}x${MAX_SIDE} limit`);
}
if (image.length > MAX_BYTES) {
  fail(`size ${image.length} bytes exceeds the ${MAX_BYTES}-byte limit`);
}

const destination = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(destination, { recursive: true });
// A plain byte copy: every run writes exactly the repository's image, so
// repeated runs are deterministic by construction.
copyFileSync(imagePath, join(destination, 'entry.png'));
