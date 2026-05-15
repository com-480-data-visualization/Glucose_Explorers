let fullDataset = [];
let diabetics = [];
let nonDiabetics = [];

const relevantVariables = [
    "age", "bmi", "glucose_fasting", "glucose_postprandial", "hba1c",
    "insulin_level", "cholesterol_total", "hdl_cholesterol", "ldl_cholesterol",
    "triglycerides", "systolic_bp", "diastolic_bp",
    "physical_activity_minutes_per_week", "sleep_hours_per_day",
    "alcohol_consumption_per_week",
    "diabetes_risk_score"
];

const factorExplanations = {
    "age": "Age is a significant risk factor. Metabolism slows down and insulin resistance increases as we get older.",
    "bmi": "Body Mass Index is a key indicator. Higher BMI often leads to increased insulin resistance.",
    "glucose_fasting": "Fasting glucose measures sugar levels after 8 hours of rest. High values are a primary diagnostic sign.",
    "glucose_postprandial": "This measures how the body handles sugar after a meal, indicating pancreatic efficiency.",
    "hba1c": "Average blood sugar over 3 months. It provides a long-term view of glucose management.",
    "insulin_level": "High levels often mean the body is struggling with insulin resistance, while low levels suggest Type 1.",
    "cholesterol_total": "Total blood fats. High levels increase cardiovascular risks associated with diabetes.",
    "hdl_cholesterol": "The 'good' cholesterol. Higher levels help protect the heart from metabolic damage.",
    "ldl_cholesterol": "The 'bad' cholesterol. High levels contribute to artery hardening in diabetic patients.",
    "triglycerides": "Fats in the blood often elevated by high sugar intake and insulin resistance.",
    "systolic_bp": "Top blood pressure number. Hypertension and diabetes together damage blood vessels rapidly.",
    "diastolic_bp": "Bottom pressure number. High resting pressure increases stress on the cardiovascular system.",
    "physical_activity_minutes_per_week": "Activity helps muscles absorb glucose without needing extra insulin.",
    "sleep_hours_per_day": "Lack of sleep disrupts hormones that regulate blood sugar and hunger.",
    "alcohol_consumption_per_week": "Excessive alcohol can cause pancreatic inflammation and weight gain.",
    "diabetes_risk_score": "A composite score calculating the statistical likelihood of diabetes based on all factors."
};

async function loadData() {
    try {
        fullDataset = await d3.csv("dataset.csv", d3.autoType);
        diabetics = fullDataset.filter(d => d.diagnosed_diabetes === 1);
        nonDiabetics = fullDataset.filter(d => d.diagnosed_diabetes === 0);
        populateSelect();
        updateDensityChart(relevantVariables[0]);
        updateGlossary(relevantVariables[0]);
    } catch (error) { console.error(error); }
}

function populateSelect() {
    const select = d3.select("#risk-category");
    select.selectAll("option").data(relevantVariables).enter().append("option")
        .text(d => d.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()))
        .attr("value", d => d);

    select.on("change", () => {
        const val = select.property("value");
        updateDensityChart(val);
        updateGlossary(val);
    });
}

function updateGlossary(variable) {
    const title = variable.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    d3.select("#glossary-title").text(title);
    d3.select("#glossary-text").text(factorExplanations[variable]);
}

function updateDensityChart(variable) {
    const svg = d3.select("#risks-chart");
    svg.selectAll("*").remove();

    let width = svg.node().parentNode.clientWidth || 900;
    if (width > 920) width = 920;
    const isMobile = width < 600;
    const height = isMobile ? 380 : 460;
    const margin = isMobile ? {top: 30, right: 20, bottom: 110, left: 55} : {top: 40, right: 70, bottom: 70, left: 80};

    const diabValues = diabetics.map(d => d[variable]).filter(v => !isNaN(v) && v !== null);
    const nonDiabValues = nonDiabetics.map(d => d[variable]).filter(v => !isNaN(v) && v !== null);

    const xScale = d3.scaleLinear().domain(d3.extent([...diabValues, ...nonDiabValues])).range([margin.left, width - margin.right]).nice();
    const bandwidth = getBandwidth(diabValues);
    const kde = kernelDensityEstimator(kernelEpanechnikov(bandwidth), xScale.ticks(80));

    const densityDiab = kde(diabValues);
    const densityNon = kde(nonDiabValues);
    const yMax = d3.max([...densityDiab, ...densityNon], d => d[1]) * 1.25;
    const yScale = d3.scaleLinear().domain([0, yMax]).range([height - margin.bottom, margin.top]);

    const line = d3.line().x(d => xScale(d[0])).y(d => yScale(d[1])).curve(d3.curveBasis);
    const area = d3.area().x(d => xScale(d[0])).y0(height - margin.bottom).y1(d => yScale(d[1])).curve(d3.curveBasis);

    svg.append("path").datum(densityDiab).attr("fill", "#e74c3c").attr("opacity", 0.14).attr("d", area);
    svg.append("path").datum(densityNon).attr("fill", "#3498db").attr("opacity", 0.14).attr("d", area);
   
    svg.append("path").datum(densityDiab).attr("fill", "none").attr("stroke", "#e74c3c").attr("stroke-width", 3).attr("d", line);
    svg.append("path").datum(densityNon).attr("fill", "none").attr("stroke", "#3498db").attr("stroke-width", 3).attr("d", line);
    svg.append("text").attr("x", width / 2).attr("y", height - (isMobile ? 80 : 20)).attr("text-anchor", "middle").attr("fill", "white").attr("font-size", isMobile ? "13px" : "15px").text(variable.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()));

    svg.append("text").attr("transform", "rotate(-90)").attr("x", -(height / 2)).attr("y", isMobile ? 22 : 32).attr("text-anchor", "middle").attr("fill", "white").attr("font-size", isMobile ? "13px" : "15px").text("Density");
    svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).call(d3.axisBottom(xScale).ticks(isMobile ? 5 : 8));
    svg.append("g").attr("transform", `translate(${margin.left}, 0)`).call(d3.axisLeft(yScale).ticks(5));

    if (isMobile) {
        svg.append("text").attr("x", 20).attr("y", height - 75).text("Diabetics").attr("fill", "#e74c3c");
        svg.append("text").attr("x", 20).attr("y", height - 55).text("Non-Diabetics").attr("fill", "#3498db");

    } else {
        svg.append("text").attr("x", width - 220).attr("y", 45).text("Diabetics").attr("fill", "#e74c3c");
        svg.append("text").attr("x", width - 220).attr("y", 70).text("Non-Diabetics").attr("fill", "#3498db");
    }
}

function getBandwidth(values) {
    const iqr = d3.quantile(values, 0.75) - d3.quantile(values, 0.25) || 1;
    return 1.06 * Math.min(d3.deviation(values) || 1, iqr / 1.34) * Math.pow(values.length, -0.2);
}
function kernelDensityEstimator(kernel, X) { return V => X.map(x => [x, d3.mean(V, v => kernel(x - v))]); }
function kernelEpanechnikov(k) { return v => Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) : 0; }

document.addEventListener("DOMContentLoaded", loadData);