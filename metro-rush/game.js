"use strict";
(() => {
  const canvas = document.querySelector("canvas"),
    ctx = canvas.getContext("2d");
  const $ = (s) => document.querySelector(s),
    W = 480,
    H = 760,
    horizon = 226,
    ground = 652;
  let state = "ready",
    lane = 0,
    visualLane = 0,
    jump = 0,
    velocity = 0,
    slide = 0;
  let distance = 0,
    coins = 0,
    best = 0,
    speed = 23,
    spawn = 0,
    objects = [],
    sparks = [];
  let time = 0,
    last = 0,
    messageTime = 0,
    gesture = null,
    lastSafe = 0;
  try {
    best = Math.max(0, Number(localStorage.getItem("metro-rush-best")) || 0);
  } catch {}
  $("#best").textContent = Math.floor(best);
  function rounded(x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  }
  function polygon(points, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
  }
  function circle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  function line(x, y, a, b, color, width = 2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(a, b);
    ctx.stroke();
  }
  function project(l, z) {
    const s = 10 / (Math.max(-1, z) + 10);
    return { x: W / 2 + l * 142 * s, y: horizon + (ground - horizon) * s, s };
  }
  function hud() {
    $("#distance").textContent = Math.floor(distance) + " m";
    $("#coins").textContent = coins;
  }
  function tell(text) {
    $("#status").textContent = text;
    messageTime = 1.9;
  }
  function show(title, copy, label) {
    $("#heading").textContent = title;
    $("#copy").textContent = copy;
    $("#start").textContent = label;
    $("#overlay").hidden = false;
  }
  function start() {
    state = "running";
    lane = 0;
    visualLane = 0;
    jump = 0;
    velocity = 0;
    slide = 0;
    distance = 0;
    coins = 0;
    speed = 23;
    spawn = 0;
    objects = [];
    sparks = [];
    time = 0;
    lastSafe = 0;
    gesture = null;
    $("#overlay").hidden = true;
    $("#badge").textContent = "THE CITY IS WAITING";
    $("#pause").textContent = "Ⅱ";
    $("#pause").setAttribute("aria-label", "Pause game");
    tell("Follow the coins. Find your rhythm.");
    row(100);
    hud();
    canvas.focus({ preventScroll: true });
  }
  function pause() {
    gesture = null;
    if (state === "running") {
      state = "paused";
      show(
        "A little pit stop.",
        "Your run is paused. The city will wait.",
        "Keep running →",
      );
      $("#pause").textContent = "▶";
      $("#pause").setAttribute("aria-label", "Resume game");
    } else if (state === "paused") {
      state = "running";
      $("#overlay").hidden = true;
      $("#pause").textContent = "Ⅱ";
      $("#pause").setAttribute("aria-label", "Pause game");
    }
  }
  function finish(type) {
    state = "over";
    gesture = null;
    best = Math.max(best, Math.floor(distance));
    try {
      localStorage.setItem("metro-rush-best", best);
    } catch {}
    $("#best").textContent = best;
    $("#badge").textContent = "A GOOD RUN. ANOTHER ADVENTURE.";
    show(
      "One more run?",
      Math.floor(distance) +
        " metres · " +
        coins +
        " coins. " +
        (type === "train"
          ? "Switch lanes to dodge trains."
          : type === "barrier"
            ? "Jump a little earlier to clear barriers."
            : "Slide under the overhead signs."),
      "Run it back →",
    );
  }
  function action(name) {
    if (state !== "running") return;
    if (name === "left") lane = Math.max(-1, lane - 1);
    if (name === "right") lane = Math.min(1, lane + 1);
    if (name === "jump" && jump === 0) {
      slide = 0;
      velocity = 7.4;
    }
    if (name === "slide" && jump === 0) slide = 0.85;
  }
  function row(z = 160) {
    // Keep one lane open, and move the safe route by at most one lane per row.
    const choices = [-1, 0, 1].filter((l) => Math.abs(l - lastSafe) <= 1);
    const safe = choices[Math.floor(Math.random() * choices.length)];
    lastSafe = safe;
    const blocked = [-1, 0, 1].filter((l) => l !== safe);
    const count = distance < 100 ? 1 : 2;
    for (let i = 0; i < count; i++) {
      const type =
        distance < 65
          ? "barrier"
          : ["train", "barrier", "sign"][Math.floor(Math.random() * 3)];
      objects.push({ lane: blocked[i], z, type, done: false });
    }
    for (let i = 0; i < 6; i++)
      objects.push({ lane: safe, z: z + 8 + i * 4, type: "coin", done: false });
  }
  function burst(x, y) {
    for (let i = 0; i < 9; i++)
      sparks.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 150,
        vy: -30 - Math.random() * 110,
        life: 0.5,
      });
  }
  function update(dt) {
    time += dt;
    distance += speed * dt;
    speed = Math.min(43, 23 + distance / 220);
    visualLane += (lane - visualLane) * Math.min(1, dt * 15);
    if (velocity !== 0 || jump > 0) {
      velocity -= 18 * dt;
      jump = Math.max(0, jump + velocity * dt);
      if (jump === 0) velocity = 0;
    }
    slide = Math.max(0, slide - dt);
    spawn -= dt;
    if (spawn <= 0) {
      row();
      spawn = Math.max(1.65, 2.3 - distance / 1600);
    }
    for (const o of objects) {
      o.z -= speed * dt;
      if (o.done || o.z > 2.3) continue;
      if (o.type === "coin") {
        if (o.z >= -2 && Math.abs(visualLane - o.lane) < 0.44 && jump < 1.15) {
          coins++;
          o.done = true;
          burst(project(o.lane, 0).x, ground - 45);
        }
        continue;
      }
      if (o.z >= -1.5 && Math.abs(visualLane - o.lane) < 0.44) {
        if (
          o.type === "train" ||
          (o.type === "barrier" && jump < 0.85) ||
          (o.type === "sign" && slide <= 0)
        ) {
          finish(o.type);
          return;
        }
      }
      if (o.z < -1.5) o.done = true;
    }
    objects = objects.filter((o) => o.z > -4 && !o.done);
    for (const p of sparks) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 260 * dt;
      p.life -= dt;
    }
    sparks = sparks.filter((p) => p.life > 0);
    messageTime -= dt;
    if (messageTime <= 0) $("#status").textContent = "";
    hud();
  }
  function city() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#657391");
    sky.addColorStop(0.32, "#e8ac98");
    sky.addColorStop(0.58, "#f3cfac");
    sky.addColorStop(1, "#656c8b");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    circle(338, 150, 53, "#ffd5a4");
    circle(338, 150, 68, "#ffd5a41a");
    for (let layer = 0; layer < 2; layer++)
      for (let i = 0; i < 13; i++) {
        const bw = 26 + ((i * 13) % 37),
          x = i * 43 - 25,
          hh = 45 + ((i * 37) % 110),
          y = 250 - hh + layer * 22;
        rounded(x, y, bw, hh, 2, layer ? "#77758e" : "#a18da0");
        for (let j = 0; j < 3; j++)
          for (let k = 0; k < 6; k++)
            if ((j + k + i) % 3)
              rounded(
                x + 6 + j * 10,
                y + 10 + k * 17,
                3,
                6,
                1,
                layer ? "#c5b3b7" : "#dabcb7",
              );
      }
    polygon(
      [
        [0, 220],
        [155, horizon],
        [20, H],
        [0, H],
      ],
      "#827c91",
    );
    polygon(
      [
        [480, 220],
        [325, horizon],
        [460, H],
        [480, H],
      ],
      "#77778e",
    );
    polygon(
      [
        [0, 325],
        [190, horizon],
        [290, horizon],
        [480, 325],
        [480, H],
        [0, H],
      ],
      "#454e69",
    );
    // Warm platforms, three tracks, and sleepers moving toward the camera.
    polygon(
      [
        [0, H],
        [0, 450],
        [210, horizon],
        [215, horizon],
        [48, H],
      ],
      "#cd9f86",
    );
    polygon(
      [
        [480, H],
        [480, 450],
        [270, horizon],
        [265, horizon],
        [432, H],
      ],
      "#c59682",
    );
    for (const l of [-1, 0, 1]) {
      for (const offset of [-0.3, 0.3]) {
        const a = project(l + offset, 0),
          b = project(l + offset, 175);
        line(a.x, a.y + 110, b.x, b.y, "#afaaa9", 3);
        line(a.x + 3, a.y + 110, b.x + 1, b.y, "#2d344e", 3);
      }
      for (let i = 0; i < 23; i++) {
        const z = i * 8 - (distance % 8);
        if (z < 0) continue;
        const p = project(l, z);
        rounded(p.x - 49 * p.s, p.y, 98 * p.s, 6 * p.s, 1, "#867781");
      }
    }
    // Passing walls, station lamps, and a destination sign.
    for (let i = 0; i < 9; i++) {
      const z = i * 23 - (distance % 23);
      if (z < 1) continue;
      const a = project(-1.85, z),
        b = project(1.85, z);
      for (const p of [a, b]) {
        line(p.x, p.y, p.x, p.y - 155 * p.s, "#3e465f", 5 * p.s);
        rounded(
          p.x - 13 * p.s,
          p.y - 158 * p.s,
          26 * p.s,
          8 * p.s,
          2 * p.s,
          "#ffe1ad",
        );
      }
    }
    rounded(172, 198, 136, 25, 4, "#34445b");
    ctx.fillStyle = "#e7e8da";
    ctx.font = "700 9px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("SUNSET CENTRAL  →", 240, 214);
  }
  function drawObject(o) {
    const p = project(o.lane, o.z),
      s = p.s,
      x = p.x,
      y = p.y;
    if (o.type === "coin") {
      ctx.save();
      ctx.translate(x, y - 37 * s);
      ctx.scale(s, s);
      ctx.shadowColor = "#ffdf8990";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#e4a954";
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 15, 0, 0, 7);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#ffe6a4";
      ctx.lineWidth = 3;
      ctx.stroke();
      line(0, -6, 0, 6, "#fff0c3", 3);
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    rounded(-51, -3, 102, 14, 7, "#20283d66");
    if (o.type === "train") {
      polygon(
        [
          [49, -178],
          [64, -167],
          [64, -3],
          [49, 6],
        ],
        "#367b86",
      );
      rounded(-50, -185, 100, 185, 13, "#73b8b1");
      rounded(-43, -174, 86, 55, 8, "#253e58");
      rounded(-35, -166, 30, 39, 4, "#68849b");
      rounded(5, -166, 30, 39, 4, "#68849b");
      rounded(-49, -100, 98, 15, 1, "#f0d4b4");
      rounded(-40, -76, 80, 54, 7, "#4b979b");
      rounded(-33, -68, 66, 12, 3, "#316b7e");
      circle(-30, -12, 8, "#ffe4ab");
      circle(30, -12, 8, "#ffe4ab");
      rounded(-24, -5, 48, 11, 3, "#30475e");
      ctx.fillStyle = "#e5f5e5";
      ctx.font = "700 10px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("M 08", 0, -89);
    } else if (o.type === "barrier") {
      rounded(-47, -51, 10, 51, 2, "#e5c5a5");
      rounded(37, -51, 10, 51, 2, "#e5c5a5");
      rounded(-55, -52, 110, 35, 4, "#eaa36f");
      ctx.save();
      ctx.beginPath();
      ctx.rect(-55, -52, 110, 35);
      ctx.clip();
      for (let i = -80; i < 100; i += 35)
        polygon(
          [
            [i, -52],
            [i + 14, -52],
            [i + 49, -17],
            [i + 35, -17],
          ],
          "#fff2d5",
        );
      ctx.restore();
    } else {
      rounded(-54, -150, 9, 150, 2, "#8c9caa");
      rounded(45, -150, 9, 150, 2, "#8c9caa");
      rounded(-59, -151, 118, 67, 5, "#45597d");
      rounded(-52, -143, 104, 51, 3, "#f0bb7e");
      ctx.fillStyle = "#53495b";
      ctx.font = "900 30px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("↓", 0, -105);
    }
    ctx.restore();
  }
  function runner() {
    const x = project(visualLane, 0).x,
      feet = ground - jump * 70,
      run = state === "running" ? Math.sin(time * 15) : 0;
    ctx.save();
    ctx.translate(x, feet);
    ctx.fillStyle = "#1b233c55";
    ctx.beginPath();
    ctx.ellipse(0, jump * 70 + 4, 26, 9, 0, 0, 7);
    ctx.fill();
    if (slide > 0) {
      rounded(-31, -29, 62, 25, 11, "#ee966e");
      rounded(-37, -20, 25, 15, 6, "#324058");
      rounded(19, -13, 28, 11, 4, "#8fe0c9");
      circle(29, -34, 12, "#f2c1a0");
      rounded(18, -46, 25, 12, 6, "#31394d");
      rounded(-8, -33, 28, 20, 6, "#586887");
    } else {
      line(-10, -35, -15 - run * 9, -5, "#2c3b55", 12);
      line(10, -35, 15 + run * 9, -5, "#2c3b55", 12);
      rounded(-25 - run * 8, -8, 22, 12, 5, "#91e2cc");
      rounded(3 + run * 8, -8, 22, 12, 5, "#91e2cc");
      line(-20, -65, -29 - run * 7, -39, "#f1b58f", 10);
      line(20, -65, 29 + run * 7, -39, "#f1b58f", 10);
      rounded(-24, -80, 48, 49, 13, "#ef9f75");
      rounded(-17, -71, 34, 34, 10, "#465875");
      rounded(-11, -66, 22, 24, 6, "#7585a3");
      line(-11, -48, 11, -48, "#b9bdce", 2);
      circle(0, -95, 17, "#f1bd9b");
      rounded(-19, -112, 38, 18, 8, "#303a54");
      rounded(-20, -101, 40, 7, 3, "#7284a1");
    }
    ctx.restore();
    for (const p of sparks) {
      ctx.globalAlpha = Math.max(0, p.life * 2);
      circle(p.x, p.y, 3, "#ffe09b");
    }
    ctx.globalAlpha = 1;
  }
  function draw() {
    city();
    const sorted = objects.filter((o) => !o.done).sort((a, b) => b.z - a.z);
    sorted.filter((o) => o.z >= 0).forEach(drawObject);
    runner();
    sorted.filter((o) => o.z < 0).forEach(drawObject);
  }
  function frame(now) {
    const dt = Math.min((now - last) / 1000 || 0, 0.035);
    last = now;
    if (state === "running") update(dt);
    draw();
    requestAnimationFrame(frame);
  }
  $("#start").addEventListener("click", () =>
    state === "paused" ? pause() : start(),
  );
  $("#pause").addEventListener("click", pause);
  document
    .querySelectorAll("[data-action]")
    .forEach((b) =>
      b.addEventListener("click", () => action(b.dataset.action)),
    );
  window.addEventListener("keydown", (e) => {
    if (e.target.matches("input,textarea")) return;
    const map = {
      ArrowLeft: "left",
      KeyA: "left",
      ArrowRight: "right",
      KeyD: "right",
      ArrowUp: "jump",
      KeyW: "jump",
      Space: "jump",
      ArrowDown: "slide",
      KeyS: "slide",
    };
    if (map[e.code]) {
      if (
        e.target.closest("button") &&
        (e.code === "Space" || e.code === "Enter")
      )
        return;
      e.preventDefault();
      if (!e.repeat) action(map[e.code]);
    }
    if (e.code === "KeyP" && !e.repeat) pause();
  });
  canvas.addEventListener("pointerdown", (e) => {
    if (state !== "running") return;
    e.preventDefault();
    gesture = { x: e.clientX, y: e.clientY, id: e.pointerId };
    canvas.setPointerCapture(e.pointerId);
  });
  function swipe(e) {
    if (!gesture || e.pointerId !== gesture.id) return;
    const dx = e.clientX - gesture.x,
      dy = e.clientY - gesture.y;
    if (Math.hypot(dx, dy) < 22) return;
    action(
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
          ? "slide"
          : "jump",
    );
    gesture = null;
  }
  canvas.addEventListener("pointermove", swipe);
  canvas.addEventListener("pointerup", (e) => {
    swipe(e);
    gesture = null;
  });
  canvas.addEventListener("pointercancel", () => (gesture = null));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state === "running") pause();
  });
  window.addEventListener("blur", () => {
    if (state === "running") pause();
  });
  // Keep the initial world inviting, with a clear centre lane.
  objects = [
    { lane: -1, z: 33, type: "train" },
    { lane: 1, z: 55, type: "barrier" },
    ...Array.from({ length: 7 }, (_, i) => ({
      lane: 0,
      z: 13 + i * 8,
      type: "coin",
    })),
  ];
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  requestAnimationFrame(frame);
})();
