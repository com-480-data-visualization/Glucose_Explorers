// ════════════════════════════════════════════════
//  TABLETOP.JS
//  1. Build controls (sliders)
//  2. Build SVG scene
//  3. Grab element references
//  4. Update functions
//  5. Main update loop
//  6. Initialise
// ════════════════════════════════════════════════


// ── 1. Build and inject the sliders ──────────────
function buildControls() {
  const container = document.getElementById('controls-container');

  container.innerHTML = `
    <h3>Your lifestyle</h3>

    <div class="slider-group">
      <label>Smoking status</label>
      <div class="button-group" id="smoking">
        <button class="smoke-btn active" data-value="never">Never</button>
        <button class="smoke-btn"        data-value="former">Former</button>
        <button class="smoke-btn"        data-value="current">Current</button>
      </div>
    </div>

    <div class="slider-group">
      <label for="alcohol">Alcohol (drinks per week)</label>
      <input type="range" id="alcohol" min="0" max="10" step="1" value="3" />
      <span class="slider-value" id="alcohol-val">3</span>
    </div>

    <div class="slider-group">
      <label for="activity">Physical activity (mins/week)</label>
      <input type="range" id="activity" min="0" max="800" step="10" value="150" />
      <span class="slider-value" id="activity-val">150</span>
    </div>

    <div class="slider-group">
      <label for="diet">Diet score</label>
      <input type="range" id="diet" min="0" max="10" step="1" value="5" />
      <span class="slider-value" id="diet-val">5</span>
    </div>

    <div class="slider-group">
      <label for="sleep">Sleep (hours/night)</label>
      <input type="range" id="sleep" min="0" max="10" step="0.5" value="7" />
      <span class="slider-value" id="sleep-val">7</span>
    </div>

    <div class="slider-group">
      <label for="screen">Screen time (hours/day)</label>
      <input type="range" id="screen" min="0" max="15" step="0.5" value="4" />
      <span class="slider-value" id="screen-val">4</span>
    </div>
  `;
  // note: smoking listeners are attached in initialise,
  // after el is defined
}


// ── 2. Build and inject the SVG ──────────────────
function buildScene() {
  const container = document.getElementById('scene-container');

  container.innerHTML = `
    <svg id="scene" viewBox="0 0 500 350" xmlns="http://www.w3.org/2000/svg">

      <line x1="0" y1="280" x2="500" y2="280"
        stroke="#2a2a2a" stroke-width="1" />

      <!-- Wine glass -->
      <g id="glass" transform="translate(80, 140)">
        <path d="M -25 0 L -18 80 L 18 80 L 25 0 Z"
          fill="none" stroke="#888" stroke-width="1.5" />
        <line x1="0" y1="80" x2="0" y2="110"
          stroke="#888" stroke-width="1.5" />
        <line x1="-15" y1="110" x2="15" y2="110"
          stroke="#888" stroke-width="1.5" />
        <defs>
          <clipPath id="glass-clip">
            <path d="M -25 0 L -18 80 L 18 80 L 25 0 Z" />
          </clipPath>
        </defs>
        <rect id="wine-liquid"
          x="-25" y="40" width="50" height="40"
          fill="#8b0000" opacity="0.75"
          clip-path="url(#glass-clip)" />
      </g>

      <!-- Plate -->
      <g id="plate" transform="translate(230, 220)">
        <ellipse cx="0" cy="0" rx="65" ry="20"
          fill="#1e1e1e" stroke="#555" stroke-width="1.5" />
        <ellipse cx="0" cy="0" rx="50" ry="14"
          fill="#252525" />
        <g id="food-healthy">
          <ellipse cx="-15" cy="-2" rx="12" ry="7"
            fill="#2d6a2d" opacity="0.9" />
          <ellipse cx="10"  cy="2"  rx="14" ry="6"
            fill="#c8602a" opacity="0.9" />
          <ellipse cx="0"   cy="-4" rx="8"  ry="5"
            fill="#4a7c2f" opacity="0.9" />
        </g>
        <g id="food-processed" style="display:none">
          <rect x="-20" y="-6" width="40" height="12"
            rx="3" fill="#c8a020" opacity="0.9" />
          <rect x="-12" y="-8" width="24" height="6"
            rx="2" fill="#a05020" opacity="0.85" />
        </g>
      </g>

      <!-- Shoes -->
      <g id="shoes" transform="translate(390, 230)">
        <ellipse cx="0" cy="10" rx="40" ry="8"
          fill="#333" />
        <path d="M -38 10 Q -20 -20 10 -15 Q 35 -10 40 5 Q 20 8 -38 10 Z"
          id="shoe-upper" fill="#555" />
        <path d="M -10 -10 Q 10 -16 28 -8"
          fill="none" stroke="#888" stroke-width="1.5"
          id="shoe-laces" />
      </g>

      <!-- Thermometer -->
      <g id="thermometer" transform="translate(470, 60)">
        <rect x="-8" y="0" width="16" height="180"
          rx="8" fill="#1a1a1a" stroke="#444" stroke-width="1" />
        <circle cx="0" cy="188" r="12"
          id="thermo-bulb" fill="#22c55e" />
        <rect id="mercury"
          x="-5" y="170" width="10" height="10"
          rx="4" fill="#22c55e" />
        <line x1="8" y1="40"  x2="14" y2="40"
          stroke="#444" stroke-width="1" />
        <line x1="8" y1="90"  x2="14" y2="90"
          stroke="#444" stroke-width="1" />
        <line x1="8" y1="140" x2="14" y2="140"
          stroke="#444" stroke-width="1" />
        <text x="18" y="44"  fill="#555" font-size="9"
          font-family="sans-serif">Low</text>
        <text x="18" y="94"  fill="#555" font-size="9"
          font-family="sans-serif">Mid</text>
        <text x="18" y="144" fill="#555" font-size="9"
          font-family="sans-serif">High</text>
      </g>

    </svg>
  `;
}


// ── 3. Grab element references ────────────────────
function getElements() {
  return {
    alcoholSlider:  document.getElementById('alcohol'),
    activitySlider: document.getElementById('activity'),
    dietSlider:     document.getElementById('diet'),
    sleepSlider:    document.getElementById('sleep'),
    screenSlider:   document.getElementById('screen'),
    alcoholVal:     document.getElementById('alcohol-val'),
    activityVal:    document.getElementById('activity-val'),
    dietVal:        document.getElementById('diet-val'),
    sleepVal:       document.getElementById('sleep-val'),
    screenVal:      document.getElementById('screen-val'),
    wineLiquid:     document.getElementById('wine-liquid'),
    foodHealthy:    document.getElementById('food-healthy'),
    foodProcessed:  document.getElementById('food-processed'),
    shoeUpper:      document.getElementById('shoe-upper'),
    shoeLaces:      document.getElementById('shoe-laces'),
    mercury:        document.getElementById('mercury'),
    thermoBulb:     document.getElementById('thermo-bulb'),
  };
}

function getSmokingStatus() {
  const active = document.querySelector('.smoke-btn.active');
  return active ? active.dataset.value : 'never';
}


// ── 4. Update functions ───────────────────────────

function updateGlass(el, alcohol) {
  // alcohol 0–30 maps to fill height 0–70
  const maxFill = 70;
  const fillH   = (alcohol / 10) * maxFill;
  const topY    = 80 - fillH;

  el.wineLiquid.setAttribute('y',      topY);
  el.wineLiquid.setAttribute('height', fillH);

  const r = Math.round(80 + (alcohol / 10) * 60);
  el.wineLiquid.setAttribute('fill', `rgb(${r},0,0)`);
}

function updatePlate(el, diet) {
  if (diet >= 5) {
    el.foodHealthy.style.display   = 'block';
    el.foodProcessed.style.display = 'none';
  } else {
    el.foodHealthy.style.display   = 'none';
    el.foodProcessed.style.display = 'block';
  }
}

function updateShoes(el, activity) {
  // activity 0–800 mins/week
  const t = activity / 800;
  const r = Math.round(80  + t * 100);
  const g = Math.round(80  + t * 80);
  const b = Math.round(180 + t * 75);

  el.shoeUpper.setAttribute('fill', `rgb(${r},${g},${b})`);
  el.shoeLaces.setAttribute('stroke', t > 0.3 ? '#fff' : '#666');
}

function updateThermometer(el, risk) {
  // risk is 0–100
  const maxH  = 100;
  const fillH = (risk / 100) * maxH;
  const topY  = 170 - fillH;

  el.mercury.setAttribute('height', fillH);
  el.mercury.setAttribute('y',      topY);

  const color = risk < 33 ? '#22c55e'
              : risk < 66 ? '#f59e0b'
              :              '#ef4444';

  el.mercury.setAttribute('fill',    color);
  el.thermoBulb.setAttribute('fill', color);
}


// ── 5. Main update loop ───────────────────────────
function update(el) {
  const smoking  = getSmokingStatus();
  const alcohol  = parseFloat(el.alcoholSlider.value);
  const activity = parseFloat(el.activitySlider.value);
  const diet     = parseFloat(el.dietSlider.value);
  const sleep    = parseFloat(el.sleepSlider.value);
  const screen   = parseFloat(el.screenSlider.value);

  el.alcoholVal.textContent  = alcohol;
  el.activityVal.textContent = activity;
  el.dietVal.textContent     = diet;
  el.sleepVal.textContent    = sleep;
  el.screenVal.textContent   = screen;

  updateGlass(el, alcohol);
  updatePlate(el, diet);
  updateShoes(el, activity);

  // predictRisk comes from model.js
  const normalised = predictRisk(smoking, alcohol, activity, diet, sleep, screen) * 100;

  updateThermometer(el, normalised);
}


// ── 6. Initialise ─────────────────────────────────
buildControls();
buildScene();

const el = getElements();

// slider listeners
el.alcoholSlider.addEventListener('input',  () => update(el));
el.activitySlider.addEventListener('input', () => update(el));
el.dietSlider.addEventListener('input',     () => update(el));
el.sleepSlider.addEventListener('input',    () => update(el));
el.screenSlider.addEventListener('input',   () => update(el));

// smoking buttons — attached here so el is already defined
document.querySelectorAll('.smoke-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.smoke-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    update(el);
  });
});

update(el);