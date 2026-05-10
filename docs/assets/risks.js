let fullDataset = [];
let diabetics = [];
let nonDiabetics = [];

const svg = d3.select("#risks-chart");
const relevantVariables = [
    "age", "bmi", "glucose_fasting", "glucose_postprandial", "hba1c",
    "insulin_level", "cholesterol_total", "hdl_cholesterol", "ldl_cholesterol",
    "triglycerides", "systolic_bp", "diastolic_bp", "waist_to_hip_ratio",
    "physical_activity_minutes_per_week", "sleep_hours_per_day",
    "screen_time_hours_per_day", "alcohol_consumption_per_week",
    "diabetes_risk_score"
];

function initRisksChart() {
    loadData();
}

async function loadData() {
    try {
        fullDataset = await d3.csv("dataset.csv", d3.autoType);
        diabetics = fullDataset.filter(d => d.diagnosed_diabetes === 1);
        nonDiabetics = fullDataset.filter(d => d.diagnosed_diabetes === 0);

        populateSelect();
        updateDensityChart(relevantVariables[0]);
    } catch (error) {
        console.error("Error loading dataset:", error);
        svg.append("text")
            .attr("x", "50%")
            .attr("y", "50%")
            .attr("text-anchor", "middle")
            .attr("fill", "#ff6b6b")
            .text("Dataset not found");
    }
}

function populateSelect() {
    const select = d3.select("#risk-category");
    select.selectAll("option").remove();

    select.selectAll("option")
        .data(relevantVariables)
        .enter()
        .append("option")
        .text(d => d.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()))
        .attr("value", d => d);

    select.on("change", () => updateDensityChart(select.property("value")));
}

function updateDensityChart(variable) {
    svg.selectAll("*").remove();

    let width = svg.node().parentNode.clientWidth || 900;
    if (width > 920) width = 920;
    
    const isMobile = width < 600;
    const height = isMobile ? 380 : 460;
    
    const margin = isMobile 
        ? { top: 30, right: 20, bottom: 110, left: 55 } 
        : { top: 40, right: 70, bottom: 70, left: 80 };

    const diabValues = diabetics.map(d => d[variable]).filter(v => !isNaN(v) && v !== null);
    const nonDiabValues = nonDiabetics.map(d => d[variable]).filter(v => !isNaN(v) && v !== null);

    if (diabValues.length < 10 || nonDiabValues.length < 10) {
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("fill", "#ff6b6b")
            .text("Not sufficient amount of data");
        return;
    }

    const xScale = d3.scaleLinear()
        .domain(d3.extent([...diabValues, ...nonDiabValues]))
        .range([margin.left, width - margin.right])
        .nice();

    const bandwidth = getBandwidth(diabValues);
    const kde = kernelDensityEstimator(kernelEpanechnikov(bandwidth), xScale.ticks(80));

    const densityDiab = kde(diabValues);
    const densityNon = kde(nonDiabValues);

    const yMax = d3.max([...densityDiab, ...densityNon], d => d[1]) * 1.25;

    const yScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([height - margin.bottom, margin.top]);

    const line = d3.line().x(d => xScale(d[0])).y(d => yScale(d[1])).curve(d3.curveBasis);
    const area = d3.area().x(d => xScale(d[0])).y0(height - margin.bottom).y1(d => yScale(d[1])).curve(d3.curveBasis);

    svg.append("path").datum(densityDiab).attr("fill", "#e74c3c").attr("opacity", 0.14).attr("d", area);
    svg.append("path").datum(densityNon).attr("fill", "#3498db").attr("opacity", 0.14).attr("d", area);
    svg.append("path").datum(densityDiab).attr("fill", "none").attr("stroke", "#e74c3c").attr("stroke-width", 3).attr("d", line);
    svg.append("path").datum(densityNon).attr("fill", "none").attr("stroke", "#3498db").attr("stroke-width", 3).attr("d", line);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(isMobile ? 5 : 8));

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale).ticks(5));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - (isMobile ? 45 : 20))
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", isMobile ? "13px" : "15px")
        .text(variable.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", isMobile ? 22 : 32)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", isMobile ? "13px" : "15px")
        .text("Density");

    if (isMobile) {
        const legendY = height - 75;
        const startX = 20;

        svg.append("line")
            .attr("x1", startX).attr("y1", legendY)
            .attr("x2", startX + 35).attr("y2", legendY)
            .attr("stroke", "#e74c3c").attr("stroke-width", 3.5);
        svg.append("text")
            .attr("x", startX + 45).attr("y", legendY + 4)
            .text("Diabetics").attr("fill", "white").attr("font-size", "13px");

        svg.append("line")
            .attr("x1", startX).attr("y1", legendY + 22)
            .attr("x2", startX + 35).attr("y2", legendY + 22)
            .attr("stroke", "#3498db").attr("stroke-width", 3.5);
        svg.append("text")
            .attr("x", startX + 45).attr("y", legendY + 26)
            .text("Non-Diabetics").attr("fill", "white").attr("font-size", "13px");

    } else {
        const legendX = width - 210;
        const legendY = 45;

        svg.append("line").attr("x1", legendX).attr("y1", legendY).attr("x2", legendX + 40).attr("y2", legendY)
            .attr("stroke","#e74c3c").attr("stroke-width",3.5);
        svg.append("text").attr("x", legendX + 50).attr("y", legendY + 4)
            .text("Diabetics").attr("fill","white").attr("font-size","14px");

        svg.append("line").attr("x1", legendX).attr("y1", legendY + 25).attr("x2", legendX + 40).attr("y2", legendY + 25)
            .attr("stroke","#3498db").attr("stroke-width",3.5);
        svg.append("text").attr("x", legendX + 50).attr("y", legendY + 29)
            .text("Non-Diabetics").attr("fill","white").attr("font-size","14px");
    }
}

function getBandwidth(values) {
    const iqr = d3.quantile(values, 0.75) - d3.quantile(values, 0.25) || 1;
    return 1.06 * Math.min(d3.deviation(values) || 1, iqr / 1.34) * Math.pow(values.length, -0.2);
}

function kernelDensityEstimator(kernel, X) {
    return V => X.map(x => [x, d3.mean(V, v => kernel(x - v))]);
}

function kernelEpanechnikov(k) {
    return v => Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) : 0;
}

document.addEventListener("DOMContentLoaded", initRisksChart);