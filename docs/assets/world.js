// Regional values are based on IDF Diabetes Atlas 2024 pages.
// Type 2 is rendered as a proxy from regional diabetes prevalence because IDF states that over 90% of diabetes is type 2.
const worldModes = {
    type2: {
        label: 'Type 2',
        intro: 'Type 2 dominates the global burden of diabetes. This view estimates its regional footprint by applying IDF\'s "over 90%" type 2 share to 2024 regional adult diabetes prevalence.',
        method: 'Estimated adult prevalence, used as a proxy for type 2 burden',
        legendLabel: 'Estimated adult prevalence (%)',
        palette: ['#2f3f45', '#7a5740', '#cf9a5d'],
        defaultRegion: 'mena',
        summaryLabel: 'Estimated type 2 burden'
    },
    type1: {
        label: 'Type 1',
        intro: 'Type 1 is far less common than type 2, but the regional pattern is different. This view uses IDF 2024 type 1 counts and divides them by each region\'s 0-79 population to show an approximate footprint.',
        method: 'Approximate share of the 0-79 population living with type 1 diabetes',
        legendLabel: 'Approximate prevalence (%)',
        palette: ['#243b40', '#3f7c74', '#87c2b6'],
        defaultRegion: 'nac',
        summaryLabel: 'Approximate type 1 footprint'
    }
};

const worldGlobalStats = [
    { value: '589M', label: 'Adults living with diabetes', detail: 'IDF global estimate for 2024' },
    { value: '9.2M', label: 'People living with type 1', detail: 'All ages, global estimate' },
    { value: '43%', label: 'Adults undiagnosed', detail: 'Share of adults with diabetes worldwide' },
    { value: '>90%', label: 'Cases that are type 2', detail: 'Global share stated by IDF' }
];

const worldRegions = [
    {
        id: 'nac',
        name: 'North America & Caribbean',
        code: 'NAC',
        labelX: 172,
        labelY: 112,
        highlight: 'Second-highest adult diabetes prevalence among the IDF regions.',
        shapes: [
            'M90 72 L146 54 L210 60 L268 94 L256 128 L220 146 L188 140 L162 164 L122 154 L90 122 Z',
            'M250 148 L274 154 L290 174 L276 188 L252 182 Z'
        ],
        diabetesAdults2024: 56.1964,
        diabetesAdults2050: 68.1029,
        ageStandardisedPrevalence: 13.8,
        type1PeopleAllAges: 1.85331,
        population0To79: 514.1753225
    },
    {
        id: 'saca',
        name: 'South & Central America',
        code: 'SACA',
        labelX: 254,
        labelY: 285,
        highlight: 'Regional prevalence is lower than in North America, but the absolute burden still exceeds 35 million adults.',
        shapes: [
            'M244 186 L274 202 L288 242 L284 286 L268 338 L236 380 L214 358 L222 312 L208 262 L220 222 Z'
        ],
        diabetesAdults2024: 35.3669,
        diabetesAdults2050: 51.4998,
        ageStandardisedPrevalence: 10.1,
        type1PeopleAllAges: 0.797112,
        population0To79: 505.8606865
    },
    {
        id: 'eur',
        name: 'Europe',
        code: 'EUR',
        labelX: 414,
        labelY: 98,
        highlight: 'Europe has the largest total number of people living with type 1 diabetes in the IDF regional data.',
        shapes: [
            'M360 84 L402 74 L452 84 L454 108 L416 120 L378 114 L360 98 Z'
        ],
        diabetesAdults2024: 65.5671,
        diabetesAdults2050: 72.4071,
        ageStandardisedPrevalence: 8.0,
        type1PeopleAllAges: 2.740885,
        population0To79: 892.272404
    },
    {
        id: 'afr',
        name: 'Africa',
        code: 'AFR',
        labelX: 414,
        labelY: 242,
        highlight: 'Africa has the lowest current adult prevalence in the IDF regional table, but the fastest projected increase by 2050.',
        shapes: [
            'M376 138 L428 148 L458 196 L452 258 L428 314 L392 344 L372 304 L364 246 L368 184 Z'
        ],
        diabetesAdults2024: 24.5856,
        diabetesAdults2050: 59.5265,
        ageStandardisedPrevalence: 5.0,
        type1PeopleAllAges: 0.351955,
        population0To79: 1221.972263
    },
    {
        id: 'mena',
        name: 'Middle East & North Africa',
        code: 'MENA',
        labelX: 532,
        labelY: 160,
        highlight: 'This region has the highest adult diabetes prevalence in the current IDF regional estimates.',
        shapes: [
            'M448 118 L538 120 L590 154 L578 206 L518 218 L468 192 L442 154 Z'
        ],
        diabetesAdults2024: 84.6887,
        diabetesAdults2050: 162.6165,
        ageStandardisedPrevalence: 19.9,
        type1PeopleAllAges: 1.410471,
        population0To79: 838.6703885
    },
    {
        id: 'sea',
        name: 'South-East Asia',
        code: 'SEA',
        labelX: 602,
        labelY: 252,
        highlight: 'The region combines a large population base with a rapidly growing diabetes burden.',
        shapes: [
            'M558 210 L610 214 L648 244 L640 292 L586 300 L548 268 L546 232 Z'
        ],
        diabetesAdults2024: 106.8702,
        diabetesAdults2050: 184.5094,
        ageStandardisedPrevalence: 10.8,
        type1PeopleAllAges: 1.005022,
        population0To79: 1665.5651975
    },
    {
        id: 'wp',
        name: 'Western Pacific',
        code: 'WP',
        labelX: 682,
        labelY: 174,
        highlight: 'The Western Pacific carries the largest absolute number of adults living with diabetes.',
        shapes: [
            'M628 112 L706 124 L734 168 L718 226 L676 256 L634 230 L614 190 L614 148 Z',
            'M654 300 L694 306 L712 336 L690 352 L650 342 L638 320 Z'
        ],
        diabetesAdults2024: 215.4407,
        diabetesAdults2050: 253.81,
        ageStandardisedPrevalence: 11.1,
        type1PeopleAllAges: 0.99099,
        population0To79: 2330.516035
    }
];

function mixHexColors(start, end, amount) {
    const startInt = Number.parseInt(start.slice(1), 16);
    const endInt = Number.parseInt(end.slice(1), 16);

    const sr = (startInt >> 16) & 255;
    const sg = (startInt >> 8) & 255;
    const sb = startInt & 255;

    const er = (endInt >> 16) & 255;
    const eg = (endInt >> 8) & 255;
    const eb = endInt & 255;

    const r = Math.round(sr + (er - sr) * amount);
    const g = Math.round(sg + (eg - sg) * amount);
    const b = Math.round(sb + (eb - sb) * amount);

    return `rgb(${r}, ${g}, ${b})`;
}

function formatMillions(value) {
    return `${value.toFixed(1)}M`;
}

function formatPercent(value, digits = 1) {
    return `${value.toFixed(digits)}%`;
}

function getRegionMetrics(region) {
    const type2Estimate = region.ageStandardisedPrevalence * 0.9;
    const type1Approx = (region.type1PeopleAllAges / region.population0To79) * 100;
    const growthTo2050 = ((region.diabetesAdults2050 - region.diabetesAdults2024) / region.diabetesAdults2024) * 100;
    const shareOfGlobalType1 = (region.type1PeopleAllAges / 9.149745) * 100;

    return {
        type2: {
            value: type2Estimate,
            display: formatPercent(type2Estimate),
            secondary: `Adult diabetes prevalence in the source table: ${formatPercent(region.ageStandardisedPrevalence)}`,
            cards: [
                { label: 'Estimated prevalence', value: formatPercent(type2Estimate) },
                { label: 'Adults with diabetes, 2024', value: formatMillions(region.diabetesAdults2024) },
                { label: 'Projected growth by 2050', value: formatPercent(growthTo2050) }
            ]
        },
        type1: {
            value: type1Approx,
            display: formatPercent(type1Approx, 2),
            secondary: `People living with type 1: ${formatMillions(region.type1PeopleAllAges)}`,
            cards: [
                { label: 'Approx. prevalence', value: formatPercent(type1Approx, 2) },
                { label: 'People with type 1, 2024', value: formatMillions(region.type1PeopleAllAges) },
                { label: 'Share of global type 1 total', value: formatPercent(shareOfGlobalType1) }
            ]
        }
    };
}

function buildRegionMarkup(region) {
    return region.shapes.map(shape => `<path d="${shape}"></path>`).join('');
}

function initWorldImpact() {
    const map = document.getElementById('world-map');
    const toggle = document.getElementById('world-toggle');
    const toolbarNote = document.getElementById('world-toolbar-note');
    const legend = document.getElementById('world-legend');
    const statStrip = document.getElementById('world-stat-strip');
    const intro = document.getElementById('world-intro');
    const focus = document.getElementById('world-focus');
    const metricList = document.getElementById('world-metric-list');
    const context = document.getElementById('world-context');

    if (!map || !toggle || !toolbarNote || !legend || !statStrip || !intro || !focus || !metricList || !context) {
        return;
    }

    map.innerHTML = `
        <defs>
            <filter id="world-shadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="rgba(0,0,0,0.28)" />
            </filter>
        </defs>
        <rect x="0" y="0" width="760" height="430" rx="28" class="world-ocean"></rect>
        <g class="world-gridlines">
            <path d="M48 96 H712"></path>
            <path d="M48 170 H712"></path>
            <path d="M48 244 H712"></path>
            <path d="M48 318 H712"></path>
            <path d="M168 52 V378"></path>
            <path d="M320 52 V378"></path>
            <path d="M472 52 V378"></path>
            <path d="M624 52 V378"></path>
        </g>
        <g class="world-region-layer">
            ${worldRegions.map(region => `
                <g class="world-region" data-region="${region.id}" tabindex="0" role="button" aria-label="${region.name}">
                    ${buildRegionMarkup(region)}
                    <text x="${region.labelX}" y="${region.labelY}" class="world-region-label">${region.code}</text>
                </g>
            `).join('')}
        </g>
    `;

    statStrip.innerHTML = worldGlobalStats.map(stat => `
        <div class="world-stat-card">
            <div class="world-stat-value">${stat.value}</div>
            <div class="world-stat-label">${stat.label}</div>
            <div class="world-stat-detail">${stat.detail}</div>
        </div>
    `).join('');

    let activeMode = 'type2';
    let activeRegionId = worldModes[activeMode].defaultRegion;

    function getActiveRegion() {
        return worldRegions.find(region => region.id === activeRegionId) || worldRegions[0];
    }

    function updateLegend(mode) {
        const values = worldRegions.map(region => getRegionMetrics(region)[mode].value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const [start, , end] = worldModes[mode].palette;

        legend.innerHTML = `
            <div class="world-legend-label">${worldModes[mode].legendLabel}</div>
            <div class="world-legend-scale" style="background: linear-gradient(90deg, ${start} 0%, ${end} 100%);"></div>
            <div class="world-legend-range">
                <span>${formatPercent(min, mode === 'type1' ? 2 : 1)}</span>
                <span>${formatPercent(max, mode === 'type1' ? 2 : 1)}</span>
            </div>
        `;
    }

    function updateMapColors(mode) {
        const values = worldRegions.map(region => getRegionMetrics(region)[mode].value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const [start, middle, end] = worldModes[mode].palette;
        const denominator = max - min || 1;

        map.querySelectorAll('.world-region').forEach(element => {
            const region = worldRegions.find(item => item.id === element.dataset.region);
            const value = getRegionMetrics(region)[mode].value;
            const normalized = (value - min) / denominator;
            const fill = normalized < 0.5
                ? mixHexColors(start, middle, normalized / 0.5)
                : mixHexColors(middle, end, (normalized - 0.5) / 0.5);

            element.style.setProperty('--region-fill', fill);
            element.classList.toggle('is-active', region.id === activeRegionId);
        });
    }

    function updateCopy(mode, region) {
        const metrics = getRegionMetrics(region)[mode];
        const modeConfig = worldModes[mode];

        intro.textContent = modeConfig.intro;
        toolbarNote.textContent = modeConfig.method;

        focus.innerHTML = `
            <div class="world-focus-kicker">${modeConfig.summaryLabel}</div>
            <h3>${region.name}</h3>
            <p>${region.highlight}</p>
            <div class="world-focus-note">${metrics.secondary}</div>
        `;

        metricList.innerHTML = metrics.cards.map(card => `
            <div class="world-metric-card">
                <span class="world-metric-value">${card.value}</span>
                <span class="world-metric-label">${card.label}</span>
            </div>
        `).join('');

        context.textContent = mode === 'type2'
            ? `${region.name} sits in a world where most diabetes is type 2. The map lets you compare where adult prevalence is densest and where absolute case counts are projected to keep rising.`
            : `${region.name} shows how different type 1 geography can look. Even when the percentage remains relatively low, the number of people who need lifelong insulin support is still substantial.`;
    }

    function render() {
        const region = getActiveRegion();

        toggle.querySelectorAll('button').forEach(button => {
            const isActive = button.dataset.mode === activeMode;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        updateMapColors(activeMode);
        updateLegend(activeMode);
        updateCopy(activeMode, region);
    }

    toggle.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            activeMode = button.dataset.mode;
            activeRegionId = worldModes[activeMode].defaultRegion;
            render();
        });
    });

    map.querySelectorAll('.world-region').forEach(element => {
        const select = () => {
            activeRegionId = element.dataset.region;
            render();
        };

        element.addEventListener('mouseenter', select);
        element.addEventListener('focus', select);
        element.addEventListener('click', select);
        element.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                select();
            }
        });
    });

    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorldImpact);
} else {
    initWorldImpact();
}
