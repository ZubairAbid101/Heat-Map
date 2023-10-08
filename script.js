document.addEventListener("DOMContentLoaded", () => {
    const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"

    const request = new XMLHttpRequest
    request.open("GET", url, true)
    request.send()
    request.onload = () => {
        const jsonObject = JSON.parse(request.response)
        const rawData = jsonObject
        const baseTemp = rawData["baseTemperature"]
        const monthlyVariance = rawData["monthlyVariance"]

        const yearArray = monthlyVariance.map((item) => {
            return item["year"]
        })

        const variance = monthlyVariance.map((item) => {
            return item["variance"]
        })

        const numberOfMonths = 12

        const outerContainer = d3.select("body").append("div");
        outerContainer.attr("id", "outer-container");

        /* Creating the title and description*/
        const title = outerContainer.append("h1").text("Monthly Global Land-Surface Temperature");
        title.attr("id", "title");

        const description = outerContainer.append("h3")
        description.text("1753 - 2015: base temperature 8.66℃")
        description.attr("id", "description")

        /* Creating the svg Element*/
        const svgWidth = 1400;
        const svgHeight = 500;

        const svg = outerContainer.append("svg")
        svg.attr("class", "svg")
        svg.attr("width", svgWidth)
        svg.attr("height", svgHeight)

        /* Creating the x and y axis scales*/
        const dateObject = new Date()
        const padding = 50

        const xAxisScale = d3.scaleLinear()
                                .domain([d3.min(yearArray), d3.max(yearArray)])
                                .range([padding, svgWidth - padding])

        const yAxisScale = d3.scaleTime()
                                .domain([dateObject.setMonth(0), dateObject.setMonth(11)])
                                .range([padding, svgHeight - padding])

        /* Creating the x and y scales*/
        const xScale = d3.scaleLinear()
                                .domain([d3.min(yearArray), d3.max(yearArray)])
                                .range([padding, svgWidth - padding])

        const yScale = d3.scaleTime()
                            .domain([dateObject.setMonth(0), dateObject.setMonth(11)])
                            .range([padding, svgHeight - padding])

        /* Creating the x and y axis */
        const xAxis = d3.axisBottom(xAxisScale)
        xAxis.tickFormat(d3.format("d"))
        svg.append("g")
            .attr("id", "x-axis")    
            .attr("transform", `translate(0, ${svgHeight - padding})`)    
            .call(xAxis);

        const yAxis = d3.axisLeft(yAxisScale)
        yAxis.tickFormat(d3.timeFormat("%B"))
        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", `translate(${padding}, ${-(svgHeight - (2 * padding))/ numberOfMonths})`)
            .call(yAxis)
        
        /* Creating the Tooltip*/
        outerContainer.append("div")
                        .attr("id", "tooltip")

        console.log(d3.min(variance))
        console.log(d3.max(variance))

        /* Setting up the rect elements */
        svg.selectAll("rect")
            .data(monthlyVariance)
            .enter()
            .append("rect")
            .attr("class", "cell")
            .attr("fill", (d) => {
                if (d["variance"] <= -6) {
                    return "darkblue"
                }else if (d["variance"] <= -4) {
                    return "steelblue"
                }else if(d["variance"] <= -2) {
                    return "lightblue"
                }
                else if (d["variance"] <= 0) {
                    return "lightsteelblue"
                }
                else if (d["variance"] <= 2) {
                    return "orange"
                } else if(d["variance"] <= 4) {
                    return "red"
                } 
                else {
                    return "Crimson"
                }
            })
            .attr("data-year", (d) => {
                return d["year"]
            })
            .attr("data-month", (d) => {
                return d["month"] - 1
            })
            .attr("data-temp", (d) => {
                return baseTemp + d["variance"]
            })
            .attr("height", (svgHeight - (2 * padding))/ numberOfMonths)
            .attr("transform", `translate(0, ${-(svgHeight - (2 * padding))/ numberOfMonths})`)
            .attr("width", (svgWidth - (2 * padding)) / (d3.max(yearArray) - d3.min(yearArray)))
            .attr("y", (d) => {
                return yScale(dateObject.setMonth(d["month"] - 1))
            })
            .attr("x", (d) => {
                return xScale(d["year"])
            })
            .on("mouseover", (d) => {
                const tooltip = d3.select("#tooltip")

                tooltip.style("display", "block")
                        .style("left", `${d3.event.pageX}px`)
                        .style("top", `${d3.event.pageY - 50}px`)

                tooltip.html(`Year: ${d["year"]} <br> Temperature: ${(d["variance"] + baseTemp).toFixed(2)} &deg;C`)
                tooltip.attr("data-year", d["year"])
            })
            .on("mousemove", (d) => {
                const tooltip = d3.select("#tooltip");
                tooltip.style("left", `${d3.event.pageX}px`);
                tooltip.style("top", `${d3.event.pageY - 40}px`);
            })
            .on("mouseout", (event, d) => {
                d3.select("#tooltip").style("display", "none")
            })

            tempArray = []
            const minTemperature = d3.min(variance) + baseTemp
            const maxTemperature = d3.max(variance) + baseTemp

            const minApproxTemperature = Math.round(minTemperature)
            const maxApproxTemperature = Math.round(maxTemperature)

            for (let i = minApproxTemperature; i <= maxApproxTemperature; i = i + 1) {
                tempArray.push(i)
            }

        /* Creating the legend */
        const legendSvgWidth = 500
        const legendSvgHeight = 70

        const legendPadding = 25

        const legendSvg = outerContainer.append("svg")
        legendSvg.attr("id", "legend")
        legendSvg.attr("width", legendSvgWidth)
        legendSvg.attr("height", legendSvgHeight)

        const legendXAxisScale = d3.scaleLinear()
                                        .domain([minApproxTemperature, maxApproxTemperature])
                                        .range([legendPadding, legendSvgWidth - legendPadding])

        const legendXScale = d3.scaleLinear()
                                    .domain([minApproxTemperature, maxApproxTemperature + 1])
                                    .range([legendPadding, legendSvgWidth - legendPadding])

        const legendXAxis = d3.axisBottom(legendXAxisScale)
        legendSvg.append("g")
                    .attr("transform", `translate(0, ${legendSvgHeight - legendPadding})`)    
                    .call(legendXAxis)

        legendSvg.selectAll("rect")
                    .data(tempArray)
                    .enter()
                    .append("rect")
                    .attr("width", (legendSvgWidth - (2 * legendPadding)) / (maxApproxTemperature - minApproxTemperature))
                    .attr("height", legendSvgHeight - (2 * legendPadding))
                    .attr("x", (d) => {
                        return legendXScale(d)
                    })
                    .attr("y", legendSvgHeight - (2 * legendPadding))
                    .attr("fill", (d) => {
                        if (d <= -6 + baseTemp) {
                            return "darkblue"
                        }else if (d <= -4 + baseTemp) {
                            return "steelblue"
                        } else if (d <= -2 + baseTemp) {
                            return "lightblue"
                        } else if(d <= 0 + baseTemp) {
                            return "lightblue"
                        }
                        else if (d < 2 + baseTemp) {
                            return "orange"
                        } else if(d <= 4 + baseTemp) {
                            return "red"
                        }
                        else {
                            return "Crimson"
                        }
                    })
    }
})