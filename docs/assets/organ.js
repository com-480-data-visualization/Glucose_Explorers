const csvPath = 'dataset.csv';
const diagnosisVar = 'diagnosed_diabetes';
const imageWidth = 241;
const imageHeight = 410;
const overlayScale = 0.70;
const overlayOffsetX = 42;
const overlayOffsetY = 75;

const organMapping = {
    lungs: ['smoking_status', 'physical_activity_minutes_per_week', 'sleep_hours_per_day'],
    heart: ['systolic_bp', 'diastolic_bp', 'heart_rate', 'cholesterol_total', 'hdl_cholesterol', 'ldl_cholesterol', 'triglycerides', 'cardiovascular_history'],
    liver: ['triglycerides', 'cholesterol_total', 'bmi', 'waist_to_hip_ratio'],
    pancreas: ['insulin_level', 'glucose_fasting', 'glucose_postprandial', 'hba1c'],
    intestines: ['diet_score', 'glucose_postprandial', 'bmi', 'screen_time_hours_per_day']
};

function parseCSVLine(line) {
    const cells = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === ',' && !inQuotes) {
            cells.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    cells.push(current.trim());
    return cells;
}

function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => {
        const parts = parseCSVLine(line);
        const obj = {};
        headers.forEach((h, i) => { obj[h] = parts[i] === undefined ? '' : parts[i]; });
        return obj;
    });
    return { headers, rows };
}

function numeric(v) {
    if (v === '' || v === undefined) return NaN;
    const n = Number(v);
    if (!isFinite(n)) return NaN;
    return n;
}

function mean(values) {
    const vs = values.filter(v => !Number.isNaN(v));
    if (vs.length === 0) return NaN;
    return vs.reduce((a, b) => a + b, 0) / vs.length;
}

function pearson(xs, ys) {
    const n = Math.min(xs.length, ys.length);
    let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, count = 0;
    for (let i = 0; i < n; i++) {
        const x = xs[i], y = ys[i];
        if (Number.isNaN(x) || Number.isNaN(y)) continue;
        sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; count++;
    }
    if (count === 0) return NaN;
    const num = sxy - (sx * sy) / count;
    const den = Math.sqrt((sxx - (sx * sx) / count) * (syy - (sy * sy) / count));
    if (den === 0) return 0;
    return num / den;
}

function formatLabel(value) {
    return value
        .split('_')
        .map(part => part.toUpperCase() === 'BMI' ? 'BMI' : part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function formatNumber(value) {
    if (Number.isNaN(value)) return 'n/a';
    const abs = Math.abs(value);
    if (abs >= 100) return value.toFixed(0);
    if (abs >= 10) return value.toFixed(1);
    return value.toFixed(2);
}

function formatSignedNumber(value) {
    if (Number.isNaN(value)) return 'n/a';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;
}

function formatPercent(value) {
    if (Number.isNaN(value)) return 'n/a';
    return `${(value * 100).toFixed(1)}%`;
}

function formatCount(value) {
    return new Intl.NumberFormat('en-US').format(value);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function nonEmptyValues(rows, key) {
    return rows
        .map(row => row[key])
        .filter(value => value !== '' && value !== undefined);
}

function isNumericColumn(rows, key) {
    const values = nonEmptyValues(rows, key);
    if (!values.length) return false;

    const numericCount = values.filter(value => !Number.isNaN(numeric(value))).length;
    return numericCount / values.length >= 0.95;
}

function isBinaryColumn(rows, key) {
    const values = nonEmptyValues(rows, key)
        .map(value => numeric(value))
        .filter(value => !Number.isNaN(value));

    return values.length > 0 && values.every(value => value === 0 || value === 1);
}

function analyzeNumericColumn(rows, key, diagnosis) {
    const values = rows.map(row => numeric(row[key]));
    const diagnosedValues = [];
    const nonDiagnosedValues = [];

    values.forEach((value, index) => {
        const diagnosisValue = diagnosis[index];
        if (Number.isNaN(value) || Number.isNaN(diagnosisValue)) return;

        if (diagnosisValue === 1) {
            diagnosedValues.push(value);
        } else if (diagnosisValue === 0) {
            nonDiagnosedValues.push(value);
        }
    });

    return {
        type: 'numeric',
        isBinary: isBinaryColumn(rows, key),
        diagnosedMean: mean(diagnosedValues),
        nonDiagnosedMean: mean(nonDiagnosedValues),
        association: pearson(values, diagnosis)
    };
}

function analyzeCategoricalColumn(rows, key, diagnosis, overallDiagnosisRate) {
    const groups = [];
    const seenGroups = new Map();

    rows.forEach((row, index) => {
        const label = (row[key] || '').trim();
        const diagnosisValue = diagnosis[index];
        if (!label || Number.isNaN(diagnosisValue)) return;

        let group = seenGroups.get(label);
        if (!group) {
            group = { label, count: 0, diagnosedCount: 0 };
            seenGroups.set(label, group);
            groups.push(group);
        }

        group.count += 1;
        if (diagnosisValue === 1) group.diagnosedCount += 1;
    });

    const categories = groups.map(group => ({
        label: group.label,
        count: group.count,
        rate: group.count ? group.diagnosedCount / group.count : NaN
    }));

    return {
        type: 'categorical',
        association: categories.reduce((maxGap, category) => {
            if (Number.isNaN(category.rate)) return maxGap;
            return Math.max(maxGap, Math.abs(category.rate - overallDiagnosisRate));
        }, 0),
        categories
    };
}

function buildVariableStats(rows) {
    const usedVariables = [...new Set(Object.values(organMapping).flat())];
    const diagnosis = rows.map(row => numeric(row[diagnosisVar]));
    const overallDiagnosisRate = mean(diagnosis);
    const stats = {};

    usedVariables.forEach(key => {
        stats[key] = isNumericColumn(rows, key)
            ? analyzeNumericColumn(rows, key, diagnosis)
            : analyzeCategoricalColumn(rows, key, diagnosis, overallDiagnosisRate);
    });

    return stats;
}

function buildMetricMarkup(metric) {
    if (!metric) {
        return '<span class="var-stat">No analysis available for this variable.</span>';
    }

    if (metric.type === 'categorical') {
        return metric.categories.map(category => `
            <span class="var-stat">${escapeHtml(category.label)}: ${formatPercent(category.rate)} diagnosed (${formatCount(category.count)} people)</span>
        `).join('');
    }

    const comparisonLine = metric.isBinary
        ? `Positive rate in diagnosed group: ${formatPercent(metric.diagnosedMean)} | non-diagnosed group: ${formatPercent(metric.nonDiagnosedMean)}`
        : `Diagnosed avg: ${formatNumber(metric.diagnosedMean)} | non-diagnosed avg: ${formatNumber(metric.nonDiagnosedMean)}`;

    return `
        <span class="var-stat">${comparisonLine}</span>
        <span class="var-stat">Association with diagnosed diabetes: ${formatSignedNumber(metric.association)}</span>
    `;
}

function buildOverlay() {
    return `
        <svg id="organ-overlay" viewBox="0 0 ${imageWidth} ${imageHeight}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <g transform="translate(${overlayOffsetX} ${overlayOffsetY})">
                <g transform="scale(${overlayScale})">
                    <g class="organ-visual" data-organ="lungs" fill="#7f9fc3" stroke="#5f83ad" stroke-width="2">
                        <path d="M75 102 C80 79,92 70,108 76 C113 95,112 120,109 145 C106 157,97 167,86 170 C72 158,68 124,75 102 Z"></path>
                        <path d="M166 102 C161 79,149 70,133 76 C128 95,129 120,132 145 C135 157,144 167,155 170 C169 158,173 124,166 102 Z"></path>
                    </g>
                    <g class="organ-visual" data-organ="heart" fill="#9ec1d4" stroke="#6c96ae" stroke-width="2">
                        <path d="M122 120 C112 107,99 112,99 127 C99 147,116 164,122 172 C128 164,145 147,145 127 C145 112,132 107,122 120 Z"></path>
                    </g>
                    <g class="organ-visual" data-organ="liver" fill="#5f86b6" stroke="#476d98" stroke-width="2">
                        <path d="M82 166 C93 159,111 158,125 164 C125 180,118 198,102 206 C87 210,74 204,71 189 C71 180,75 172,82 166 Z"></path>
                    </g>
                    <g class="organ-visual" data-organ="pancreas" fill="#86b1cf" stroke="#5d88a8" stroke-width="2">
                        <path d="M132 185 C148 179,163 183,171 195 C169 207,159 217,146 219 C133 219,123 212,120 201 C121 193,126 188,132 185 Z"></path>
                    </g>
                    <g class="organ-visual" data-organ="intestines" fill="#6f96c0" stroke="#5279a4" stroke-width="2">
                        <rect x="82" y="233" width="84" height="104" rx="16" ry="16"></rect>
                    </g>

                    <g class="organ-region" data-organ="lungs">
                        <path class="organ-hit-area" d="M71 100 C76 74,92 63,111 70 C116 93,115 123,112 148 C108 163,96 175,82 177 C66 162,61 124,71 100 Z"></path>
                        <path class="organ-hit-area" d="M170 100 C165 74,149 63,130 70 C125 93,126 123,129 148 C133 163,145 175,159 177 C175 162,180 124,170 100 Z"></path>
                    </g>
                    <g class="organ-region" data-organ="heart">
                        <path class="organ-hit-area" d="M122 115 C108 102,91 108,91 128 C91 150,111 168,122 181 C133 168,153 150,153 128 C153 108,136 102,122 115 Z"></path>
                    </g>
                    <g class="organ-region" data-organ="liver">
                        <path class="organ-hit-area" d="M77 163 C90 153,113 152,131 160 C133 182,123 203,104 212 C84 217,68 208,63 189 C63 178,68 169,77 163 Z"></path>
                    </g>
                    <g class="organ-region" data-organ="pancreas">
                        <path class="organ-hit-area" d="M130 178 C150 170,170 175,181 191 C179 210,164 223,146 226 C127 225,113 215,111 200 C113 189,120 182,130 178 Z"></path>
                    </g>
                    <g class="organ-region" data-organ="intestines">
                        <rect class="organ-hit-area" x="78" y="228" width="92" height="114" rx="20" ry="20"></rect>
                    </g>
                </g>
            </g>
        </svg>
    `;
}

async function init() {
    const container = document.getElementById('about-silhouette');
    const aboutInfo = document.getElementById('about-info');
    if (!container || !aboutInfo) return;

    container.querySelector('#organ-overlay')?.remove();
    container.insertAdjacentHTML('beforeend', buildOverlay());

    let dataset;
    try {
        const resp = await fetch(csvPath);
        const txt = await resp.text();
        dataset = parseCSV(txt);
    } catch (e) {
        console.warn('Could not load dataset', e);
        dataset = { headers: [], rows: [] };
    }

    const headers = dataset.headers;
    const rows = dataset.rows;
    const varStats = buildVariableStats(rows);

    const organDetails = {
        lungs: {
            title: 'Lungs',
            description: 'These metrics compare diagnosed and non-diagnosed people in the dataset, using smoking as a categorical breakdown and the rest as simple numeric associations.'
        },
        heart: {
            title: 'Heart',
            description: 'Cardiovascular variables are shown as simple associations with diagnosed diabetes, not as proof of causality. They help compare how the two groups differ in this dataset.'
        },
        liver: {
            title: 'Liver',
            description: 'This panel focuses on liver-related metabolic markers such as triglycerides, cholesterol, BMI, and waist-to-hip ratio, comparing the diagnosed and non-diagnosed groups.'
        },
        pancreas: {
            title: 'Pancreas',
            description: 'Pancreas-linked markers are the strongest ones in the file. The values below now compare diagnosed and non-diagnosed groups directly, without reusing the risk score as a target.'
        },
        intestines: {
            title: 'Intestines',
            description: 'Digestive and lifestyle variables are shown as group comparisons and simple associations with diagnosed diabetes. These are descriptive signals from the dataset.'
        }
    };

    let lockedOrgan = null;

    renderDefault();

    container.querySelectorAll('.organ-region').forEach(region => {
        const orgKey = region.dataset.organ;

        region.addEventListener('mouseenter', () => {
            if (lockedOrgan) return;
            setActiveOrgan(orgKey);
        });

        region.addEventListener('mouseleave', () => {
            if (lockedOrgan) return;
            setActiveOrgan(null);
        });

        region.addEventListener('click', event => {
            event.preventDefault();
            lockedOrgan = lockedOrgan === orgKey ? null : orgKey;
            setActiveOrgan(lockedOrgan);
        });
    });

    document.addEventListener('click', event => {
        if (!lockedOrgan) return;
        if (container.contains(event.target)) return;
        lockedOrgan = null;
        setActiveOrgan(null);
    });

    function setActiveOrgan(orgKey) {
        container.querySelectorAll('.organ-visual, .organ-region').forEach(element => {
            element.classList.toggle('is-active', element.dataset.organ === orgKey);
        });

        if (!orgKey) {
            renderDefault();
            return;
        }

        const meta = organDetails[orgKey];
        const vars = organMapping[orgKey].filter(v => headers.includes(v));
        const enriched = vars.map(v => ({
            name: v,
            metric: varStats[v]
        })).sort((a, b) => Math.abs(b.metric?.association || 0) - Math.abs(a.metric?.association || 0));

        const metricMarkup = enriched.length
            ? enriched.map(item => `
                <div class="organ-variable">
                    <span class="var-name">${formatLabel(item.name)}</span>
                    ${buildMetricMarkup(item.metric)}
                </div>
            `).join('')
            : '<div class="organ-variable"><span class="var-stat">No linked variables were found for this organ in the dataset.</span></div>';

        aboutInfo.innerHTML = `
            <div class="about-info-kicker">Interactive Anatomy</div>
            <h3 class="about-info-title">${meta.title}</h3>
            <p class="about-info-copy">${meta.description}</p>
            <div class="organ-metrics">${metricMarkup}</div>
        `;
    }

    function renderDefault() {
        aboutInfo.innerHTML = `
            <div class="about-info-kicker">Interactive Anatomy</div>
            <h3 class="about-info-title">Hover an organ</h3>
            <p class="about-info-copy">Move across the body to compare diagnosed and non-diagnosed people in the dataset. On mobile, tap an organ to keep its information open.</p>
        `;
    }
}

// Wait for DOM
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
