import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawn } from "node:child_process";
import * as THREE from "three";
import React from "react";
import ReactDOMServer from "react-dom/server";

const PROJECT_ROOT = process.cwd();

console.log("===================================================================");
console.log(" CHALLENGER 2: EMPIRICAL SSR & BUILD INTEGRITY STRESS HARNESS");
console.log("===================================================================");

let passCount = 0;
let failCount = 0;

async function runTest(name, fn) {
  process.stdout.write(`Testing [${name}] ... `);
  const t0 = performance.now();
  try {
    await fn();
    const dt = (performance.now() - t0).toFixed(2);
    console.log(`PASS (${dt}ms)`);
    passCount++;
  } catch (err) {
    const dt = (performance.now() - t0).toFixed(2);
    console.log(`FAIL (${dt}ms)`);
    console.error(`  -> Error: ${err.message}`);
    if (err.stack) console.error(`  ${err.stack.split("\n")[1]?.trim()}`);
    failCount++;
  }
}

// --------------------------------------------------------------------------
// TEST 1: Server-Side Rendering (SSR) Boundary Evaluation
// --------------------------------------------------------------------------
await runTest("SSR: React 19 useSyncExternalStore SSR fallback in Node.js", async () => {
  // Simulate RooftopCanvasInner client guard logic in pure Node.js (no window, no document)
  const emptySubscribe = () => () => {};
  
  function MockRooftopCanvasInner({ children }) {
    const isClient = React.useSyncExternalStore(
      emptySubscribe,
      () => true,
      () => false // getServerSnapshot returns false on SSR
    );

    if (!isClient) {
      return React.createElement("div", { "data-ssr-fallback": "true" }, null);
    }
    return React.createElement("div", { "data-client-canvas": "true" }, children);
  }

  const html = ReactDOMServer.renderToString(
    React.createElement(MockRooftopCanvasInner, null, "Canvas Child")
  );

  assert.match(html, /data-ssr-fallback="true"/, "SSR snapshot must render fallback null/empty on server");
  assert.doesNotMatch(html, /data-client-canvas/, "Client canvas must NOT render during SSR");
});

await runTest("SSR: CoupleSilhouette document check safety in SSR environment", async () => {
  // Verify CoupleSilhouette logic when typeof document === 'undefined'
  // In Node.js without jsdom, document is undefined
  assert.equal(typeof document, "undefined", "document must be undefined in pure Node.js");

  function MockCoupleSilhouette() {
    const texture = typeof document === "undefined" ? null : "CANVAS_TEXTURE";
    if (!texture) {
      return React.createElement("div", { "data-silhouette": "ssr-placeholder" });
    }
    return React.createElement("div", { "data-silhouette": "rendered" });
  }

  const html = ReactDOMServer.renderToString(React.createElement(MockCoupleSilhouette));
  assert.match(html, /ssr-placeholder/, "Must safely fall back when document is undefined");
});

await runTest("SSR: RooftopRailing stanchion and baluster coordinate purity", async () => {
  // Pure math test of RooftopRailing's positions calculation
  const stanchionCount = 11;
  const minX = -6.0;
  const maxX = 6.0;
  const step = (maxX - minX) / (stanchionCount - 1);
  const stanchions = [];
  for (let i = 0; i < stanchionCount; i++) {
    stanchions.push(minX + i * step);
  }
  assert.equal(stanchions.length, 11);
  assert.equal(stanchions[0], -6.0);
  assert.equal(stanchions[10], 6.0);
  assert.equal(stanchions[5], 0.0);

  const balusterMinX = -5.8;
  const balusterMaxX = 5.8;
  const balusterStep = 0.20;
  const balusters = [];
  for (let x = balusterMinX; x <= balusterMaxX; x += balusterStep) {
    if (Math.abs(x) > 0.75) {
      balusters.push(Number(x.toFixed(2)));
    }
  }
  assert.ok(balusters.length >= 40, `Expected >= 40 balusters, got ${balusters.length}`);
  // Verify center gap exists: no balusters between -0.75 and 0.75
  const centerBalusters = balusters.filter((x) => x > -0.75 && x < 0.75);
  assert.equal(centerBalusters.length, 0, "Center railing gap for couple silhouette must be completely clear");
});

// --------------------------------------------------------------------------
// TEST 2: Component Rapid Lifecycle & Memory Stress Test (100 Cycles)
// --------------------------------------------------------------------------
await runTest("LIFECYCLE: 100 rapid mount/unmount and disposal cycles of Three.js assets", async () => {
  const initialMem = process.memoryUsage().heapUsed;

  for (let cycle = 0; cycle < 100; cycle++) {
    // 1. SkyDome geometry & material
    const skyGeom = new THREE.SphereGeometry(450, 64, 32);
    const skyMat = new THREE.ShaderMaterial({
      vertexShader: "void main() { gl_Position = vec4(0.0); }",
      fragmentShader: "void main() { gl_FragColor = vec4(1.0); }",
    });

    // 2. Moon geometry & materials
    const moonGeom = new THREE.CircleGeometry(14, 64);
    const haloGeom = new THREE.PlaneGeometry(54, 54);
    const moonMat = new THREE.ShaderMaterial({
      vertexShader: "void main() { gl_Position = vec4(0.0); }",
      fragmentShader: "void main() { gl_FragColor = vec4(1.0); }",
    });
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: "void main() { gl_Position = vec4(0.0); }",
      fragmentShader: "void main() { gl_FragColor = vec4(1.0); }",
    });

    // 3. Skyline InstancedMesh
    const boxGeom = new THREE.BoxGeometry(1, 1, 1);
    const skylineMat = new THREE.ShaderMaterial({
      vertexShader: "void main() { gl_Position = vec4(0.0); }",
      fragmentShader: "void main() { gl_FragColor = vec4(1.0); }",
    });
    const instMesh = new THREE.InstancedMesh(boxGeom, skylineMat, 120);
    const tierArr = new Float32Array(120);
    const seedArr = new Float32Array(120);
    boxGeom.setAttribute("aTier", new THREE.InstancedBufferAttribute(tierArr, 1));
    boxGeom.setAttribute("aBuildingSeed", new THREE.InstancedBufferAttribute(seedArr, 1));

    // 4. Sakura Trees Cel Gradient Texture & TubeGeometries
    const palette = new Uint8Array([133, 45, 78, 255, 217, 78, 120, 255, 255, 133, 162, 255, 255, 235, 238, 255]);
    const celTexture = new THREE.DataTexture(palette, 4, 1, THREE.RGBAFormat);
    celTexture.needsUpdate = true;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.5, -0.8, 3.0),
      new THREE.Vector3(-3.8, 0.6, 2.4),
      new THREE.Vector3(-2.9, 1.9, 1.8),
    ]);
    const tubeGeom = new THREE.TubeGeometry(curve, 32, 0.22, 8, false);

    const icoGeom = new THREE.IcosahedronGeometry(1.0, 2);
    const toonMat = new THREE.MeshToonMaterial({
      color: "#ff85a2",
      gradientMap: celTexture,
    });

    // Perform explicit disposal
    skyGeom.dispose();
    skyMat.dispose();
    moonGeom.dispose();
    haloGeom.dispose();
    moonMat.dispose();
    glowMat.dispose();
    boxGeom.dispose();
    skylineMat.dispose();
    instMesh.dispose();
    celTexture.dispose();
    tubeGeom.dispose();
    icoGeom.dispose();
    toonMat.dispose();
  }

  // Force GC if available or check that heap growth is reasonable (< 35MB)
  if (global.gc) global.gc();
  const finalMem = process.memoryUsage().heapUsed;
  const growthMB = (finalMem - initialMem) / (1024 * 1024);
  assert.ok(growthMB < 35, `Heap grew by ${growthMB.toFixed(2)} MB over 100 cycles, exceeding 35MB ceiling`);
});

// --------------------------------------------------------------------------
// TEST 3: Static Pre-render Artifacts & Production Chunks Integrity
// --------------------------------------------------------------------------
await runTest("BUILD ARTIFACTS: .next/server/app/index.html structure & chunks", async () => {
  const indexPath = path.join(PROJECT_ROOT, ".next", "server", "app", "index.html");
  assert.ok(fs.existsSync(indexPath), `Missing ${indexPath}`);

  const html = fs.readFileSync(indexPath, "utf8");

  // Verify DOCTYPE and HTML structure
  assert.match(html, /^<!DOCTYPE html>/, "Must begin with standard HTML5 DOCTYPE");
  assert.match(html, /<html lang="en"/, "Must declare lang='en'");
  assert.match(html, /<body/, "Must have body tag");
  assert.match(html, /KOISTORY/, "Must contain KOISTORY branding");
  assert.match(html, /恋の物語/, "Must contain Japanese subtitle");
  assert.match(html, /Under the/, "Must contain hero heading");
  assert.match(html, /Luminous Moon/, "Must contain luminous moon title");
  assert.match(html, /Loading Atmosphere/, "Must contain atmospheric loading state for dynamic canvas");
  assert.match(html, /aria-hidden="true"/, "Loading atmosphere overlay must be aria-hidden");

  // Extract all chunk files mentioned in index.html and verify they exist on disk
  const chunkMatches = [...html.matchAll(/\/(_next\/static\/chunks\/[a-zA-Z0-9_\-\.]+)/g)];
  assert.ok(chunkMatches.length > 0, "Production HTML must link static JS chunks");

  for (const match of chunkMatches) {
    const relUrl = match[1];
    const diskPath = path.join(PROJECT_ROOT, ".next", relUrl.replace(/^_next\//, ""));
    assert.ok(fs.existsSync(diskPath), `Linked chunk not found on disk: ${diskPath}`);
    const stat = fs.statSync(diskPath);
    assert.ok(stat.size > 0, `Linked chunk is empty: ${diskPath}`);
  }
});

await runTest("SECURITY: Client bundles contain zero Node native modules or secrets", async () => {
  const chunksDir = path.join(PROJECT_ROOT, ".next", "static", "chunks");
  assert.ok(fs.existsSync(chunksDir), "Static chunks directory must exist");

  const files = fs.readdirSync(chunksDir).filter((f) => f.endsWith(".js"));
  assert.ok(files.length > 0, "Must have generated client JS chunks");

  for (const file of files) {
    const content = fs.readFileSync(path.join(chunksDir, file), "utf8");
    // Ensure no server native bindings or private key patterns leaked
    assert.doesNotMatch(content, /require\(['"]child_process['"]\)/, `${file} leaks child_process`);
    assert.doesNotMatch(content, /BEGIN RSA PRIVATE KEY/, `${file} leaks private keys`);
    assert.doesNotMatch(content, /DATABASE_URL=/, `${file} leaks database url`);
  }
});

// --------------------------------------------------------------------------
// TEST 4: Live HTTP Server Test (`next start` on custom port)
// --------------------------------------------------------------------------
await runTest("PRODUCTION SERVER: Live HTTP 200 response & header validation", async () => {
  const TEST_PORT = 3456;
  
  // Spawn `npx next start -p 3456`
  const serverProcess = spawn("npx.cmd", ["next", "start", "-p", String(TEST_PORT)], {
    cwd: PROJECT_ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });

  let serverStarted = false;

  const waitForServer = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timeout waiting for `next start` server to bind port"));
    }, 15000);

    serverProcess.stdout.on("data", (data) => {
      const msg = data.toString();
      if (msg.includes("Ready") || msg.includes("http://") || msg.includes("3456")) {
        clearTimeout(timeout);
        serverStarted = true;
        resolve();
      }
    });

    serverProcess.stderr.on("data", (data) => {
      // console.error(`[Server stderr]: ${data}`);
    });

    serverProcess.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    serverProcess.on("exit", (code) => {
      if (!serverStarted) {
        clearTimeout(timeout);
        reject(new Error(`Server exited prematurely with code ${code}`));
      }
    });
  });

  try {
    await waitForServer;

    // Make HTTP GET request to localhost:3456/
    const responseData = await new Promise((resolve, reject) => {
      const req = http.get(`http://127.0.0.1:${TEST_PORT}/`, (res) => {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
          });
        });
      });
      req.on("error", reject);
    });

    assert.equal(responseData.statusCode, 200, `Expected HTTP 200, got ${responseData.statusCode}`);
    assert.match(responseData.headers["content-type"], /text\/html/, "Content-Type must be text/html");
    assert.match(responseData.body, /KOISTORY/, "Response body must contain KOISTORY");
    assert.match(responseData.body, /Loading Atmosphere/, "Response body must contain atmospheric loading fallback");
    assert.doesNotMatch(responseData.body, /Internal Server Error/, "Must not contain server error");

    // Make HTTP GET request to /nonexistent-path for 404 test
    const notFoundData = await new Promise((resolve, reject) => {
      const req = http.get(`http://127.0.0.1:${TEST_PORT}/nonexistent-path-for-test`, (res) => {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            body,
          });
        });
      });
      req.on("error", reject);
    });

    assert.equal(notFoundData.statusCode, 404, `Expected HTTP 404 for invalid route, got ${notFoundData.statusCode}`);
    assert.match(notFoundData.body, /404/, "Response body must contain 404 error indicator");

  } finally {
    // Terminate server process cleanly
    serverProcess.kill("SIGTERM");
  }
});

// --------------------------------------------------------------------------
// TEST 5: Camera Frustum & Extreme Aspect Ratio Boundary Math
// --------------------------------------------------------------------------
await runTest("CAMERA BOUNDS: Frustum & projection matrix across extreme aspect ratios", async () => {
  const camera = new THREE.PerspectiveCamera(46, 16 / 9, 0.1, 1000);
  camera.position.set(0, 2.4, 9.0);
  camera.lookAt(0, 1.9, 0);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();

  const aspectRatios = [
    { name: "32:9 Ultra-Wide", aspect: 32 / 9 },
    { name: "21:9 Cinema", aspect: 21 / 9 },
    { name: "16:9 Standard Desktop", aspect: 16 / 9 },
    { name: "4:3 Classic", aspect: 4 / 3 },
    { name: "1:1 Square", aspect: 1.0 },
    { name: "9:16 Mobile Portrait", aspect: 9 / 16 },
    { name: "9:21 Ultra-tall Mobile", aspect: 9 / 21 },
  ];

  for (const { name, aspect } of aspectRatios) {
    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    // Verify matrix elements are finite numbers
    for (const el of camera.projectionMatrix.elements) {
      assert.ok(Number.isFinite(el), `Camera projection matrix element is not finite for ${name}: ${el}`);
      assert.ok(!Number.isNaN(el), `Camera projection matrix element is NaN for ${name}`);
    }

    // Verify moon visibility in frustum
    const frustum = new THREE.Frustum();
    const projScreenMatrix = new THREE.Matrix4();
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreenMatrix);

    const moonSphere = new THREE.Sphere(new THREE.Vector3(22.0, 26.0, -135.0), 14.0);
    const moonInFrustum = frustum.intersectsSphere(moonSphere);
    assert.ok(moonInFrustum, `Moon must be visible within camera frustum for ${name} (aspect: ${aspect.toFixed(2)})`);

    // Verify couple silhouette visibility in frustum
    const coupleSphere = new THREE.Sphere(new THREE.Vector3(0.0, 1.15, 0.08), 1.5);
    const coupleInFrustum = frustum.intersectsSphere(coupleSphere);
    assert.ok(coupleInFrustum, `Couple silhouette must be visible within camera frustum for ${name}`);
  }
});

// --------------------------------------------------------------------------
// SUMMARY REPORT
// --------------------------------------------------------------------------
console.log("\n===================================================================");
console.log(` CHALLENGER 2 STRESS HARNESS SUMMARY:`);
console.log(` Passed: ${passCount} | Failed: ${failCount} | Total: ${passCount + failCount}`);
console.log("===================================================================");

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
