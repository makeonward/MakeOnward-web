// Generates the site's art-directed imagery with Google Gemini and records it in
// src/data/generatedImages.json, which the site reads to swap in each image.
// Anything not generated yet falls back to the existing artwork, so the site never breaks.
//
//   npm run images                 generate whatever is missing
//   npm run images -- --force      regenerate everything
//   npm run images -- --only=hero-about,service-web
//
// Needs GEMINI_API_KEY in .env. Model can be overridden with GEMINI_IMAGE_MODEL.
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(root, "public", "generated");
const MANIFEST = path.join(root, "src", "data", "generatedImages.json");

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

// Shared art direction keeps every image in the MakeOnward palette:
// Onyx #0B0B0C, Onward Orange #FF6A00, Stone #D9D4CD, Ivory #F7F5EF.
const STYLE =
  "Premium editorial art direction for a creative studio. Deep onyx shadows (#0B0B0C) as the dominant tone, " +
  "ivory highlights (#F7F5EF), stone ambient light (#D9D4CD), a single vivid orange accent (#FF6A00) " +
  "and no other hues. Warm, cinematic lighting, shallow depth of field, minimal composition " +
  "with generous negative space, subtle film grain. No blue, pink or purple tones. No text, no letters, no logos, no watermarks, no UI copy.";

const IMAGES = [
  // Inner-page hero backdrops (wide, abstract, sit behind headings)
  { key: "hero-services", ratio: "16:9", prompt: "Abstract sculpture of interlocking dark metal and glass ribbons floating in darkness, warm light trails in orange and ivory, composition weighted to the right." },
  { key: "hero-about", ratio: "16:9", prompt: "A quiet, dark design studio at night: a large desk with sketches, a monitor glow in warm orange, dark metal desk lamp, rain-streaked window, composition weighted to the right." },
  { key: "hero-portfolio", ratio: "16:9", prompt: "A gallery wall of floating glowing screens and frames in a dark void, reflections on a glossy black floor, orange and ivory rim light." },
  { key: "hero-process", ratio: "16:9", prompt: "A sequence of seven glowing dark metal rings receding into darkness like a path, connected by a thin warm orange light line, top-down perspective." },
  { key: "hero-contact", ratio: "16:9", prompt: "Two dark metal orbs connected by a soft beam of orange light in a dark space, suggesting connection and conversation." },

  // About page
  { key: "about-studio", ratio: "4:5", prompt: "Close-up of a designer's hands sketching interface wireframes on paper beside a laptop, dark moody studio, warm orange screen glow, dark metal stylus." },

  // Home: video & content frames
  { key: "content-shoot", ratio: "16:9", prompt: "Behind the scenes of a professional video shoot: cinema camera on a rig, softbox light, dark set, warm orange rim light, silhouetted crew out of focus." },
  { key: "content-edit", ratio: "16:9", prompt: "Video editing suite in a dark room: colour grading panel, timeline glowing on ultrawide monitor, orange and ivory ambient light." },
  { key: "content-social", ratio: "16:9", prompt: "A smartphone on a tripod filming a stylish product flat-lay on a dark surface, ring light reflection, orange and ivory accents." },

  // One per service (matches the `visual` field of each service)
  { key: "service-web", ratio: "4:3", prompt: "Layered translucent website layouts floating in 3D space, dark metal edges, a warm orange glowing cursor, depth and parallax." },
  { key: "service-app", ratio: "4:3", prompt: "A sleek dark smartphone and tablet floating at angles, screens showing abstract glowing app cards, dark metal bezels." },
  { key: "service-crm", ratio: "4:3", prompt: "An abstract network of dark metal nodes connected by thin glowing warm orange lines converging on a central sphere, data flow." },
  { key: "service-social", ratio: "4:3", prompt: "Floating dark metal social reaction icons as abstract 3D shapes (hearts, speech bubbles) without logos, orange glow." },
  { key: "service-content", ratio: "4:3", prompt: "Neatly stacked translucent content cards and folders in 3D, organised grid, dark metal edges, soft warm orange light." },
  { key: "service-wordpress", ratio: "4:3", prompt: "Modular building blocks of a web page assembling themselves in mid-air, dark metal and frosted glass, warm orange light seams." },
  { key: "service-stack", ratio: "4:3", prompt: "Three stacked glowing layers representing front end, server and database, floating dark metal slabs with warm orange light between them." },
  { key: "service-edit", ratio: "4:3", prompt: "Film strips and a video timeline unspooling through the air, dark metal reels, orange and ivory light leaks." },
  { key: "service-shoot", ratio: "4:3", prompt: "A cinema camera lens in extreme close-up, reflections of orange and ivory lights in the glass, dark background." },
  { key: "service-handling", ratio: "4:3", prompt: "A calendar grid of glowing tiles in 3D, some lit in warm orange, a dark metal hand-like mechanical arm placing a tile, abstract." },
  { key: "service-search", ratio: "4:3", prompt: "A dark metal magnifying glass over an abstract glowing landscape of search result bars, warm orange light, dark." },
  { key: "service-ai", ratio: "4:3", prompt: "An abstract glowing neural sphere made of fine dark metal filaments, pulses of orange and ivory light, dark void." },
  { key: "service-answer", ratio: "4:3", prompt: "A single glowing speech bubble made of glass rising above many dim ones, warm orange highlight, dark background." },
  { key: "service-ads", ratio: "4:3", prompt: "A dark metal megaphone emitting rings of orange and ivory light waves into darkness, abstract and minimal." },
  { key: "service-reach", ratio: "4:3", prompt: "Concentric ripples of light spreading across a dark reflective surface from a single dark metal point, orange and ivory." },
];

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyArg = args.find((a) => a.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.slice(7).split(",").map((s) => s.trim())) : null;

const EXT = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

async function readManifest() {
  try {
    return JSON.parse(await fs.readFile(MANIFEST, "utf8"));
  } catch {
    return {};
  }
}

async function generate({ prompt, ratio }) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${prompt} ${STYLE}` }] }],
      generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: ratio } },
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) throw new Error(`No image returned (${data?.candidates?.[0]?.finishReason || "unknown reason"})`);
  return { buffer: Buffer.from(img.inlineData.data, "base64"), ext: EXT[img.inlineData.mimeType] || "png" };
}

async function main() {
  if (!API_KEY) {
    console.error("GEMINI_API_KEY is not set. Add it to .env (get one at https://aistudio.google.com/apikey).");
    process.exit(1);
  }
  await fs.mkdir(OUT_DIR, { recursive: true });
  const manifest = await readManifest();
  const queue = IMAGES.filter((img) => (!only || only.has(img.key)) && (force || !manifest[img.key]));

  console.log(`Model: ${MODEL} · ${queue.length} image(s) to generate`);
  let ok = 0;
  for (const img of queue) {
    process.stdout.write(`  ${img.key} … `);
    try {
      const { buffer, ext } = await generate(img);
      const file = `${img.key}.${ext}`;
      await fs.writeFile(path.join(OUT_DIR, file), buffer);
      manifest[img.key] = `/generated/${file}`;
      // Write after every image so an interrupted run keeps its progress.
      await fs.writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
      console.log(`saved (${Math.round(buffer.length / 1024)} KB)`);
      ok += 1;
    } catch (err) {
      console.log(`failed: ${err.message}`);
    }
  }
  console.log(`Done: ${ok}/${queue.length} generated.`);
}

main();
