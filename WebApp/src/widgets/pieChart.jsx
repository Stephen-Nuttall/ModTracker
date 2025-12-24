import React from "react";
import '../styles/pieChart.css'

function polarToCartesian(cx, cy, r, angleDeg) {
    const angleRad = (angleDeg - 90) * Math.PI / 180.0;
    return {
        x: cx + (r * Math.cos(angleRad)),
        y: cy + (r * Math.sin(angleRad))
    };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
        `M ${cx} ${cy}`,
        `L ${start.x} ${start.y}`,
        `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
        "Z"
    ].join(" ");
}

function PieChart({ data: dataArray = [], size = 200, innerRadius = 0 }) {
    const total = dataArray.reduce((s, d) => s + (d.value || 0), 0) || 1;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2;
    let angle = 0;

    return (
        <div className='chartContainer'>
            <svg className='chartSVG' viewBox={`0 0 ${size} ${size}`}>
                {dataArray.map((data, i) => {
                    const startAngle = angle;
                    const sliceAngle = (data.value / total) * 360;
                    let endAngle = angle + sliceAngle;
                    angle = endAngle;

                    // prevents pie chart from not rendering if there's only one element to show
                    if (sliceAngle == 360) {
                        endAngle = endAngle - 0.0001
                    }

                    const slicePath = describeArc(cx, cy, radius, startAngle, endAngle);
                    return (
                        <path key={i} d={slicePath} fill={data.color || `hsl(${(i * 70) % 360} 70% 50%)`} />
                    );

                    /* OLD INNER RADIUS/DONUT CODE FROM MR. GPT
                    if (innerRadius <= 0) {
                        return (
                            <path key={i} d={path} fill={data.color || `hsl(${(i * 70) % 360} 70% 50%)`} />
                        );
                    }
                    For donut: draw outer arc then inner reversed arc to create donut ring using path+clip
                    const innerStart = polarToCartesian(cx, cy, innerRadius, endAngle);
                    const innerEnd = polarToCartesian(cx, cy, innerRadius, startAngle);
                    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
                    const donutPath = [
                        `M ${polarToCartesian(cx, cy, r, startAngle).x} ${polarToCartesian(cx, cy, r, startAngle).y}`,
                        `A ${r} ${r} 0 ${largeArcFlag} 1 ${polarToCartesian(cx, cy, r, endAngle).x} ${polarToCartesian(cx, cy, r, endAngle).y}`,
                        `L ${innerStart.x} ${innerStart.y}`,
                        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerEnd.x} ${innerEnd.y}`,
                        "Z"
                    ].join(" ");
                    return (
                        <path key={i} d={donutPath} fill={data.color || `hsl(${(i * 70) % 360} 70% 50%)`} />
                    );
                    */
                })}
            </svg>

            <div className='legend'>
                {dataArray.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 20, height: 20, background: d.color || `hsl(${(i * 70) % 360} 70% 50%)` }} />
                        <div>{d.label}: {d.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PieChart