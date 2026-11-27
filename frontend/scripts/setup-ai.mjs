
import {
  mkdir,
  readFile,
  writeFile,
  rename,
  rm,
  copyFile,
  stat,
} from "node:fs/promises";

import { createHash } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Buffer } from "node:buffer";
import process from "node:process";

const ROOT = fileURLToPath(
  new URL("../", import.meta.url)
);

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const MODEL_SHA256 =
  "fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1";

const MODEL_DIRECTORY = join(
  ROOT,
  "public",
  "models"
);

const MODEL_PATH = join(
  MODEL_DIRECTORY,
  "hand_landmarker.task"
);

const WASM_SOURCE = join(
  ROOT,
  "node_modules",
  "@mediapipe",
  "tasks-vision",
  "wasm"
);

const WASM_DESTINATION = join(
  ROOT,
  "public",
  "mediapipe",
  "wasm"
);

const WASM_FILES = [
  "vision_wasm_internal.js",
  "vision_wasm_internal.wasm",
  "vision_wasm_module_internal.js",
  "vision_wasm_module_internal.wasm",
];

function checksum(data) {
  return createHash("sha256")
    .update(data)
    .digest("hex");
}

async function hasValidModel() {
  try {
    const data = await readFile(MODEL_PATH);

    return checksum(data) === MODEL_SHA256;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

async function installModel() {
  await mkdir(MODEL_DIRECTORY, {
    recursive: true,
  });

  if (await hasValidModel()) {
    console.log(
      "[OK] Hand Landmarker model already installed."
    );

    return;
  }

  console.log(
    "Downloading Hand Landmarker model..."
  );

  const response = await fetch(MODEL_URL, {
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    throw new Error(
      `Model download failed: HTTP ${response.status}`
    );
  }

  const data = Buffer.from(
    await response.arrayBuffer()
  );

  if (checksum(data) !== MODEL_SHA256) {
    throw new Error(
      "Model checksum verification failed."
    );
  }

  const temporaryPath =
    `${MODEL_PATH}.${process.pid}.tmp`;

  try {
    await writeFile(temporaryPath, data);

    await rename(
      temporaryPath,
      MODEL_PATH
    );
  } finally {
    await rm(temporaryPath, {
      force: true,
    });
  }

  console.log(
    "[OK] Hand Landmarker model downloaded and verified."
  );
}

async function installWasm() {
  // Validate the installed MediaPipe package.
  for (const file of WASM_FILES) {
    const source = join(WASM_SOURCE, file);

    const information = await stat(source);

    if (
      !information.isFile() ||
      information.size === 0
    ) {
      throw new Error(
        `Invalid MediaPipe runtime file: ${file}`
      );
    }
  }

  await mkdir(WASM_DESTINATION, {
    recursive: true,
  });

  for (const file of WASM_FILES) {
    await copyFile(
      join(WASM_SOURCE, file),
      join(WASM_DESTINATION, file)
    );

    console.log(`[OK] ${file}`);
  }
}

async function setup() {
  console.log("\nLyricLens AI — Asset Setup\n");

  await installWasm();
  await installModel();

  console.log(
    "\nAI assets installed successfully."
  );

  console.log(
    "Start LyricLens AI with npm run dev.\n"
  );
}

setup().catch((error) => {
  console.error(
    "\nAI setup failed:",
    error.message
  );

  process.exitCode = 1;
});
