// assets/risks-chart.js

let fullDataset = [];
const svg = d3.select("#risks-chart");

const relevantVariables = [
    "age",
    "bmi",
    "glucose_fasting",
    "glucose_postprandial",
    "hba1c",
    "insulin_level",
    "cholesterol_total",
    "hdl_cholesterol",
    "ldl_cholesterol",
    "triglycerides",
    "systolic_bp",
    "diastolic_bp",
    "waist_to_hip_ratio",
    "physical_activity_minutes_per_week",
    "sleep_hours_per_day",
    "screen_time_hours_per_day",
    "alcohol_consumption_per_week",
    "diabetes_risk_score"
];

function initRisksChart() {
    async function loadAndInit() {
        try {
            fullDataset = await d3.csv("dataset.csv", d3.autoType);
            const select = d3.select("#risk-category");
            select.selectAll("option").remove();

            select.selectAll("option")
                .data(relevantVariables)
                .enter()
                .append("option")
                .text(d => d.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()))
                .attr("value", d => d);

            updateDensityChart(relevantVariables[0]);
            select.on("change", () => {
                updateDensityChart(select.property("value"));
            });

        } catch (error) {
            document.getElementById("risk-explanation").innerHTML = 
                `<p style="color:red;">Dataset not loaded</p>`;
        }
    }

    loadAndInit();
}

function updateDensityChart(variable) {
    svg.selectAll("*").remove();

    const diabetics = fullDataset.filter(d => d.diagnosed_diabetes === 1)
                                 .map(d => d[variable])
                                 .filter(v => !isNaN(v) && v !== null);

    const nonDiabetics = fullDataset.filter(d => d.diagnosed_diabetes === 0)
                                    .map(d => d[variable])
                                    .filter(v => !isNaN(v) && v !== null);

    if (diabetics.length < 10 || nonDiabetics.length < 10) {
        svg.append("text")
            .attr("x", 460)
            .attr("y", 220)
            .attr("text-anchor", "middle")
            .text("Dati insufficienti per questa variabile");
        return;
    }

    const width = 920;
    const height = 420;
    const margin = { top: 40, right: 50, bottom: 70, left: 80 };

    const xScale = d3.scaleLinear()
        .domain(d3.extent([...diabetics, ...nonDiabetics]))
        .range([margin.left, width - margin.right])
        .nice();

    const kde = kernelDensityEstimator(kernelEpanechnikov(8), xScale.ticks(120));

    const densityDiab = kde(diabetics);
    const densityNon = kde(nonDiabetics);

    const yMax = d3.max([...densityDiab, ...densityNon], d => d[1]) * 1.15;

    const yScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([height - margin.bottom, margin.top]);

    const line = d3.line()
        .x(d => xScale(d[0]))
        .y(d => yScale(d[1]))
        .curve(d3.curveBasis);

    const area = d3.area()
        .x(d => xScale(d[0]))
        .y0(height - margin.bottom)
        .y1(d => yScale(d[1]))
        .curve(d3.curveBasis);

    svg.append("path").datum(densityDiab).attr("fill", "#e74c3c").attr("opacity", 0.13).attr("d", area);
    svg.append("path").datum(densityNon).attr("fill", "#3498db").attr("opacity", 0.13).attr("d", area);

    svg.append("path").datum(densityDiab).attr("fill", "none").attr("stroke", "#e74c3c").attr("stroke-width", 3.5).attr("d", line);
    svg.append("path").datum(densityNon).attr("fill", "none").attr("stroke", "#3498db").attr("stroke-width", 3.5).attr("d", line);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(8));

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale).ticks(6));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 25)
        .attr("text-anchor", "middle")
        .attr("font-size", "15px")
        .attr("fill","white")
        .text(variable.replace(/_/g, " ").replace(/^./, str => str.toUpperCase()))
        ;

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", 35)
        .attr("text-anchor", "middle")
        .attr("font-size", "15px")
        .attr("fill","white")
        .text("Density");

    const ly = 60;
    svg.append("line").attr("x1", width-190).attr("y1", ly).attr("x2", width-150).attr("y2", ly).attr("stroke","#e74c3c").attr("stroke-width",4);
    svg.append("text").attr("x", width-140).attr("y", ly+4).text("Diabetics").attr("font-size","14px").attr("fill","white");

    svg.append("line").attr("x1", width-190).attr("y1", ly+25).attr("x2", width-150).attr("y2", ly+25).attr("stroke","#3498db").attr("stroke-width",4);
    svg.append("text").attr("x", width-140).attr("y", ly+29).text("Non Diabetic").attr("font-size","14px").attr("fill","white");

}

function kernelDensityEstimator(kernel, X) {
    return function(V) {
        return X.map(x => [x, d3.mean(V, v => kernel(x - v))]);
    };
}

function kernelEpanechnikov(k) {
    return function(v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) : 0;
    };
}

document.addEventListener("DOMContentLoaded", initRisksChart);