'use client'
import React from 'react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis } from "recharts"
import { Id } from '../../../../../convex/_generated/dataModel'

// Define the props for the Chart component
interface ChartProps {
    classRecords: {
        chartData: {
            type: string; // Type of score (e.g., Written, Performance, Major Exam)
            aveScores: number;
        }[];
        _id: Id<"classRecords">;
        _creationTime: number;
        teachingLoadId: Id<"teachingLoad">;
        studentId: Id<"students">;
    }[];
    label: string;
    subComponent?: string;
}

// Chart component to display a bar chart of average scores
function Chart({
    classRecords,
    label,
    subComponent
}: ChartProps) {
    // Format the label based on whether it's MAPEH
    const formattedLabel = label.toLowerCase() === 'mapeh' && subComponent
        ? `MAPEH - ${subComponent}`
        : label;

    // Prepare the chart data by calculating the average scores for each type
    const chartData = [
        {
            type: "written",
            average: classRecords.reduce((sum, record) => {
                const writtenScore = record.chartData.find(data => data.type === "Written")?.aveScores || 0;
                return sum + writtenScore;
            }, 0) / classRecords.length, // Calculate average for Written Works
            fill: "#FF6384" // Fill color for Written Works
        },
        {
            type: "performance",
            average: classRecords.reduce((sum, record) => {
                const performanceScore = record.chartData.find(data => data.type === "Performance")?.aveScores || 0;
                return sum + performanceScore;
            }, 0) / classRecords.length, // Calculate average for Performance Tasks
            fill: "#36A2EB" // Fill color for Performance Tasks
        },
        {
            type: "exam",
            average: classRecords.reduce((sum, record) => {
                const majorExamScore = record.chartData.find(data => data.type === "Major Exam")?.aveScores || 0;
                return sum + majorExamScore;
            }, 0) / classRecords.length, // Calculate average for Major Exam
            fill: "#FFCE56" // Fill color for Major Exam
        },
    ];

    // Configuration for chart labels and colors
    const chartConfig = {
        average: {
            label: "Average Scores: "
        },
        written: {
            label: "Written Works",
            color: "hsl(var(--chart-1))", // Dynamic color for Written Works
        },
        performance: {
            label: "Performance Tasks",
            color: "hsl(var(--chart-2))", // Dynamic color for Performance Tasks
        },
        exam: {
            label: "Major Exam",
            color: "hsl(var(--chart-3))", // Dynamic color for Major Exam
        },
    }

    return (
        <div>
            {/* Title of the chart */}
            <h1 className='text-center text-xs md:text-sm uppercase font-bold tracking-widest'>{formattedLabel}</h1>

            {/* Chart container with configuration */}
            <ChartContainer config={chartConfig} >
                <BarChart accessibilityLayer data={chartData} className='bg-gray-50 p-0'>
                    {/* X-axis configuration */}
                    <XAxis
                        dataKey="type" // Key to determine the type of score
                        tickLine={false} // Hide tick lines
                        axisLine={false} // Hide axis line
                        tickMargin={10} // Margin for ticks
                        stroke="hsl(142, 76%, 36%)" // Color of the ticks
                        className='text-xs'
                        tickFormatter={(value) => {
                            // Format the tick labels
                            if (value === "written") return "Written Works";
                            if (value === "performance") return "Performance Tasks";
                            if (value === "exam") return "Major Exams";
                            return value;
                        }}
                    />

                    {/* Tooltip for the chart */}
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                    />

                    {/* Bar configuration */}
                    <Bar
                        dataKey="average"
                        fill="var(--color-score)"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ChartContainer>
        </div>
    )
}

export default Chart