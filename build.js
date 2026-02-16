// build.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const target = process.argv[2]; // "chrome", "firefox" or "all"
if (!target || !["chrome", "firefox", "all"].includes(target)) {
  console.error("Usage: node build.js <chrome|firefox|all>");
  process.exit(1);
}

function buildTarget(targetName) {
  const srcManifest = path.join(__dirname, `manifest.${targetName}.json`);
  const outDir = path.join(__dirname, `dist-${targetName}`);
  const outManifest = path.join(outDir, "manifest.json");

  if (!fs.existsSync(srcManifest)) {
    console.error("Could not find manifest file for :", srcManifest);
    process.exit(2);
  }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // copy manifest
  fs.copyFileSync(srcManifest, outManifest);

  // Copy webpack compiled files from dist/content/
  const distContentDir = path.join(__dirname, "dist", "content");
  if (fs.existsSync(distContentDir)) {
    const outContentDir = path.join(outDir, "src", "content");
    if (!fs.existsSync(outContentDir))
      fs.mkdirSync(outContentDir, { recursive: true });

    const contentFiles = fs.readdirSync(distContentDir);
    for (const file of contentFiles) {
      const src = path.join(distContentDir, file);
      const dest = path.join(outContentDir, file);
      fs.copyFileSync(src, dest);
    }
  }

  // Copy icons and other static assets
  const srcDir = path.join(__dirname, "src");
  if (fs.existsSync(srcDir)) {
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });

    for (const entry of entries) {
      // Skip the content folder as it's handled by webpack
      if (entry.name === "content") continue;

      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(outDir, "src", entry.name);

      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath))
          fs.mkdirSync(destPath, { recursive: true });

        const files = fs.readdirSync(srcPath, { recursive: true });
        for (const file of files) {
          const src = path.join(srcPath, file);
          const dest = path.join(destPath, file);

          if (fs.existsSync(src) && fs.statSync(src).isFile()) {
            const destDir = path.dirname(dest);
            if (!fs.existsSync(destDir))
              fs.mkdirSync(destDir, { recursive: true });
            fs.copyFileSync(src, dest);
          }
        }
      } else if (entry.isFile()) {
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  // Copy CSS file separately
  const cssFile = path.join(__dirname, "src", "content", "zeus-calendar.css");
  if (fs.existsSync(cssFile)) {
    const outCssFile = path.join(outDir, "src", "content", "zeus-calendar.css");
    const outCssDir = path.dirname(outCssFile);
    if (!fs.existsSync(outCssDir)) fs.mkdirSync(outCssDir, { recursive: true });
    fs.copyFileSync(cssFile, outCssFile);
  }

  console.log(`Build ${targetName} finished → ${outDir}/manifest.json`);
}

if (target === "all") {
  buildTarget("chrome");
  buildTarget("firefox");
} else {
  buildTarget(target);
}
