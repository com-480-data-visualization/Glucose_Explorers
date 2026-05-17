document.addEventListener("DOMContentLoaded", () => {
    const categories = [
        { name: "Screen Time", min: 0, max: 24, unit: "h/day" },
        { name: "Physical Activity", min: 0, max: 500, unit: "min/week" },
        { name: "Diet Quality", min: 0, max: 10, unit: "pts" },
        { name: "Sleep Hours", min: 0, max: 12, unit: "h/day" },
        { name: "Stress Level", min: 0, max: 100, unit: "%" },
        { name: "Hypertension", min: 0, max: 100, unit: "%" },
        { name: "Family History", min: 0, max: 100, unit: "%" }
    ];

    let userValues = [8, 150, 7, 7, 40, 20, 10];
    let populationData = [];
    const svg = d3.select("#radar-svg");

    const getDimensions = () => {
        const container = document.getElementById('radar-container');
        const width = container.getBoundingClientRect().width;
        const margin = width < 500 ? 80 : 180; 
        const radius = (width / 2) - margin;
        return { width, height: width, radius };
    };

    const numAxes = categories.length;
    const angleSlice = (Math.PI * 2) / numAxes;
    const getAngle = (i) => i * angleSlice - Math.PI / 2;

    function normalizeUserValue(val, index) {
        const cat = categories[index];
        return ((val - cat.min) / (cat.max - cat.min)) * 100;
    }

    d3.csv("dataset.csv").then(data => {
        const processData = (isDiabetic) => {
            const filtered = data.filter(d => +d.diagnosed_diabetes === (isDiabetic ? 1 : 0));
            return [
                d3.mean(filtered, d => ((12 - +d.screen_time_hours_per_day) / 12) * 100),
                d3.mean(filtered, d => Math.min((+d.physical_activity_minutes_per_week / 300) * 100, 100)),
                d3.mean(filtered, d => (+d.diet_score / 10) * 100),
                d3.mean(filtered, d => (+d.sleep_hours_per_day / 10) * 100),
                isDiabetic ? 65 : 40,
                d3.mean(filtered, d => +d.hypertension_history * 100),
                d3.mean(filtered, d => +d.family_history_diabetes * 100)
            ].map(Math.round);
        };

        populationData = [
            { name: "Non-Diabetic", values: processData(false), color: "#4e79a7" },
            { name: "Diabetic",     values: processData(true), color: "#e15759" }
        ];

        drawRadar();
        createSliders();
    });

    function drawRadar() {
        const { width, height, radius } = getDimensions();
        const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);
        
        const radarLine = d3.lineRadial()
            .angle((_, i) => getAngle(i) + Math.PI / 2)
            .radius(d => rScale(d))
            .curve(d3.curveLinearClosed);

        svg.attr("viewBox", `0 0 ${width} ${height}`).selectAll("*").remove();
        
        const startX = width - 230;
        const legendY = 45;
        svg.append("line")
        .attr("x1", startX).attr("y1", legendY)
        .attr("x2", startX + 35).attr("y2", legendY)
        .attr("stroke", "#e74c3c").attr("stroke-width", 3.5);
        svg.append("text")
        .attr("x", startX + 45).attr("y", legendY + 4)
        .text("Diabetics").attr("fill", "black").attr("font-size", "15px");

        svg.append("line")
        .attr("x1", startX).attr("y1", legendY -14)
        .attr("x2", startX + 35).attr("y2", legendY -14)
        .attr("stroke", "#3498db").attr("stroke-width", 3.5);
        svg.append("text")
        .attr("x", startX + 45).attr("y", legendY -14)
        .text("Non-Diabetics").attr("fill", "black").attr("font-size", "15px");

        svg.append("line")
        .attr("x1", startX).attr("y1", legendY-28)
        .attr("x2", startX + 35).attr("y2", legendY-28)
        .attr("stroke", "#3A9E78").attr("stroke-width", 3.5);
        svg.append("text")
        .attr("x", startX + 45).attr("y", legendY -28)
        .text("You").attr("fill", "black").attr("font-size", "15px");
        
        const g = svg.append("g").attr("transform", `translate(${width/2}, ${height/2})`);

        [20, 40, 60, 80, 100].forEach(d => {
            g.append("circle").attr("r", rScale(d)).attr("fill", "none").attr("stroke", "#e0e0e0");
        });

        categories.forEach((cat, i) => {
            const angle = getAngle(i);
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            g.append("line").attr("x1", 0).attr("y1", 0).attr("x2", x).attr("y2", y).attr("stroke", "#ccc");

            const labelOffset = 35; 
            const labelX = (radius + labelOffset) * Math.cos(angle);
            const labelY = (radius + labelOffset) * Math.sin(angle);

            g.append("text")
                .attr("x", labelX).attr("y", labelY)
                .attr("text-anchor", Math.abs(labelX) < 1 ? "middle" : (labelX > 0 ? "start" : "end"))
                .attr("dominant-baseline", "middle")
                .attr("font-size", width < 500 ? "10px" : "13px")
                .attr("font-weight", "700")
                .attr("fill", "black")
                .text(cat.name);
        });

        populationData.forEach(pop => {
            g.append("path").datum(pop.values).attr("d", radarLine)
                .attr("fill", pop.color).attr("fill-opacity", 0.12)
                .attr("stroke", pop.color).attr("stroke-width", 2);
        });

        const normalizedUser = userValues.map((v, i) => normalizeUserValue(v, i));
        g.append("path").datum(normalizedUser).attr("d", radarLine)
            .attr("fill", "#3A9E78").attr("fill-opacity", 0.35)
            .attr("stroke", "#3A9E78").attr("stroke-width", 4);

        g.selectAll(".user-dot").data(normalizedUser).join("circle")
            .attr("cx", (d, i) => rScale(d) * Math.cos(getAngle(i)))
            .attr("cy", (d, i) => rScale(d) * Math.sin(getAngle(i)))
            .attr("r", width < 500 ? 4 : 6)
            .attr("fill", "#3A9E78").attr("stroke", "white");
    }

    function createSliders() {
        const container = d3.select("#spider-info");
        container.html("");
        categories.forEach((cat, i) => {
            const div = container.append("div").attr("class", "slider-wrapper");
            const labelRow = div.append("div").attr("class", "label-row");
            labelRow.append("span").attr("class", "slider-label").text(cat.name);
            labelRow.append("span").attr("class", "slider-value").attr("id", `val-display-${i}`).text(`${userValues[i]} ${cat.unit}`);

            div.append("input")
                .attr("type", "range").attr("class", "modern-slider")
                .attr("min", cat.min).attr("max", cat.max)
                .attr("step", cat.max <= 10 ? 0.1 : 1).attr("value", userValues[i])
                .on("input", function() {
                    userValues[i] = +this.value;
                    d3.select(`#val-display-${i}`).text(`${userValues[i]} ${cat.unit}`);
                    drawRadar();
                });
        });
    }

    window.addEventListener('resize', drawRadar);
});