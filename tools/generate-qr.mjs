#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import QRCode from 'qrcode';

function parseArgs(argv) {
  const args = { text: '', output: '', size: 512 };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === '--text' && argv[i + 1]) {
      args.text = argv[i + 1];
      i += 1;
      continue;
    }

    if (token === '--output' && argv[i + 1]) {
      args.output = argv[i + 1];
      i += 1;
      continue;
    }

    if (token === '--size' && argv[i + 1]) {
      const parsed = Number(argv[i + 1]);
      if (Number.isFinite(parsed) && parsed > 0) {
        args.size = parsed;
      }
      i += 1;
      continue;
    }

    if (!args.text) {
      args.text = token;
    }
  }

  return args;
}

async function main() {
  const { text, output, size } = parseArgs(process.argv.slice(2));

  if (!text) {
    console.error('Usage: npm run qr -- --text "https://example.com" [--output qr-output/my-code.png] [--size 512]');
    process.exit(1);
  }

  const fileName = output || path.join('qr-output', 'qr-code.png');
  const absoluteOutput = path.resolve(process.cwd(), fileName);
  await fs.mkdir(path.dirname(absoluteOutput), { recursive: true });

  await QRCode.toFile(absoluteOutput, text, {
    width: size,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });

  console.log(`QR generated: ${absoluteOutput}`);
}

main().catch((error) => {
  console.error('Failed to generate QR:', error);
  process.exit(1);
});
