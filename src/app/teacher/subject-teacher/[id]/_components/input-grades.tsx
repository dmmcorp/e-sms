"use client";
import { StudentScoresType, TeachingLoadType } from "@/lib/types";
import {
  calculateInitialGrade,
  calculatePercentageScore,
  calculateTotalScore,
  calculateWeightedScore,
  cn,
  convertToTransmutedGrade,
  getTotalScore,
} from "@/lib/utils";
import React, { useState } from "react";
import InputDialog from "./input-dialog";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

export type DialogType = "highest scores" | string;

interface ClassRecordTemplateProps {
  teachingLoad: TeachingLoadType;
}

function ClassRecordTemplate({ teachingLoad }: ClassRecordTemplateProps) {
  const highestScores = useQuery(api.highestScores.getScores, {
    loadId: teachingLoad._id,
  });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [type, setType] = useState<DialogType | undefined>();
  const [studentScores, setStudentScores] = useState<StudentScoresType | undefined>();

  const section = teachingLoad.section;
  const subjectThought = teachingLoad.subjectTaught;
  const gradeWeights = subjectThought.gradeWeights;
  const learningMode = gradeWeights.type;
  const OthersExam =
    gradeWeights.other?.some((weight) => weight.component === "Major Exam") ??
    false;

  const students = useQuery(api.students.sectionStudents,{
    sectionId:section._id,
    teachingLoadId: teachingLoad._id
  })

  let wwGradeWeights: number | undefined;
  switch (learningMode) {
    case "Face to face":
      wwGradeWeights = gradeWeights.faceToFace?.ww;
      break;
    case "Modular":
      wwGradeWeights = gradeWeights.modular?.ww;
      break;
    case "Other":
      wwGradeWeights = gradeWeights.other?.find(
        (weight) => weight.component === "Written Works"
      )?.percentage;
      break;
    default:
      wwGradeWeights = undefined;
      break;
  }
  let ptGradeWeights: number | undefined;
  switch (learningMode) {
    case "Face to face":
      ptGradeWeights = gradeWeights.faceToFace?.pt;
      break;
    case "Modular":
      ptGradeWeights = gradeWeights.modular?.pt;
      break;
    case "Other":
      ptGradeWeights = gradeWeights.other?.find(
        (weight) => weight.component === "Performance Tasks"
      )?.percentage;
      break;
    default:
      ptGradeWeights = 0;
      break;
  }
  let meGradeWeights: number | undefined;
  switch (learningMode) {
    case "Face to face":
      meGradeWeights = gradeWeights.faceToFace?.majorExam;
      break;
    case "Modular":
      meGradeWeights = 0;
      break;
    case "Other":
      meGradeWeights = gradeWeights.other?.find(
        (weight) => weight.component === "Major Exam"
      )?.percentage;
      break;
    default:
      meGradeWeights = 0;
      break;
  }

  const wwhighestScores = highestScores
    ? highestScores.find((score) => score.componentType === "Written Works")
        ?.scores
    : undefined;

  const pthighestScores = highestScores
    ? highestScores.find((score) => score.componentType === "Performance Tasks")
        ?.scores
    : undefined;

  const mehighestScores = highestScores
    ? highestScores.find((score) => score.componentType === "Major Exam")
        ?.scores
    : undefined;

  const wwTotal = getTotalScore(wwhighestScores);
  const ptTotal = getTotalScore(pthighestScores);
  const meTotal = getTotalScore(mehighestScores);

  const males = !students ? [] : students.filter(student=> student !== null)
    .filter((student) => student.sex.toLowerCase() === "male")
    .sort((a, b) => a.lastName.localeCompare(b.lastName));

  const females = !students ? [] : students.filter(student=> student !== null)
    .filter((student) => student.sex.toLowerCase() === "female")
    .sort((a, b) => a.lastName.localeCompare(b.lastName));

  const handleDialogOpen = (type: DialogType) => {
    setType(type);
    setDialogOpen(true);
  };

  return (
    <div className="min-w-6xl text-primary">
      <div className="flex w-full ">
        <h1 className="border w-[25%] px-3 py-1 uppercase border-y-black border-l-black text-[0.6rem] font-semibold text-center">
          {teachingLoad.quarter}
        </h1>
        <h1 className="border w-[25%] px-3 py-1 uppercase border-x-black border-l-2 border-y-black text-[0.6rem] font-semibold text-left">
          Grade & Section: {section.gradeLevel} - {section.name}{" "}
        </h1>
        <h1 className="border w-[25%] px-3 py-1 uppercase border-black  text-[0.6rem] font-semibold text-left">
          Teacher: {subjectThought.teacher?.fullName}
        </h1>
        <h1 className="border w-[25%] px-3 py-1 uppercase border-black  text-[0.6rem] font-semibold text-center">
          {subjectThought.subjectName}
        </h1>
      </div>
      <div className="flex max-w-full">
        <h1 className="w-[3%] uppercase border-x-black border-x border-y-black border-b-black border-b text-sm font-semibold text-center"></h1>
        <h1 className="w-[22%] uppercase border-b-black border-b text-sm flex justify-center items-center font-semibold text-center">
          Learner&apos; Names
        </h1>
        <h1 className="w-[27%] uppercase border-x-black border-l-2 text-sm flex justify-center items-center font-semibold text-center">
          Written Works ({wwGradeWeights}%)
        </h1>
        <h1 className="w-[28%] uppercase border border-black  border-l-2 text-sm flex justify-center items-center font-semibold text-center">
          Performance Task ({ptGradeWeights}%)
        </h1>

        <h1 className="w-[8%] uppercase border border-black  text-[0.6rem] leading-relaxed flex justify-center items-center font-semibold text-center">
          Quarterly Assessment ({meGradeWeights}%)
        </h1>

        <h1
          className={cn(
            learningMode === "Face to face" ? "w-[6%]" : "w-[10%]",
            "uppercase border border-black border-b-0  text-[0.6rem] flex justify-center items-center  font-semibold text-center"
          )}
        >
          Initial
        </h1>
        <h1
          className={cn(
            learningMode === "Face to face" ? "w-[6%]" : "w-[10%]",
            "uppercase border border-black border-b-0   text-[0.55rem] flex justify-center items-center font-semibold text-center"
          )}
        >
          Quarterly
        </h1>
      </div>
      <div className="flex max-w-full">
        <h1 className="w-[3%] uppercase border-x-black border-x border-b-black border-b text-sm font-semibold text-center"></h1>
        <h1 className="w-[22%] uppercase border-b-black border-b text-sm flex justify-center items-center font-semibold text-center"></h1>
        <div className="w-[27%] uppercase  text-sm flex justify-center items-center font-semibold text-center">
          {Array.from({ length: 10 }, (_, index) => (
            <h1
              key={index}
              className="w-[7%] uppercase text-[0.6rem] first:border-l-2  h-full border border-black flex justify-center items-center font-semibold text-center"
            >
              {index + 1}
            </h1>
          ))}
          {["Total", "PS", "WS"].map((label, index) => (
            <h1
              key={`label-${index}`}
              className="w-[10%] uppercase h-full border border-black text-[0.6rem] flex justify-center items-center font-semibold text-center"
            >
              {label}
            </h1>
          ))}
        </div>
        <div className="w-[28%] uppercase  text-sm flex justify-center items-center font-semibold text-center">
          {Array.from({ length: 10 }).map((_, index) => (
            <h1
              key={index}
              className="w-[7%] uppercase h-full border border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center"
            >
              {index + 1}
            </h1>
          ))}
          {["Total", "PS", "WS"].map((label, index) => (
            <h1
              key={`label-${index}`}
              className="w-[10%] uppercase h-full border border-black text-[0.6rem] flex justify-center items-center font-semibold text-center"
            >
              {label}
            </h1>
          ))}
        </div>
        {(learningMode?.toLowerCase() === "face to face" ||
          (learningMode?.toLowerCase() === "other" && OthersExam)) && (
          <div className="w-[8%] uppercase border border-x-0 border-black  text-sm leading-relaxed grid grid-cols-3 justify-center items-center font-semibold text-center">
            <h1 className=" h-full uppercase border border-black border-b-0 border-t-0  text-[0.6rem]flex justify-center items-center  font-semibold text-center">
              1
            </h1>
            <h1 className=" h-full uppercase border border-black border-b-0 border-t-0  text-[0.6rem] flex justify-center items-center  font-semibold text-center">
              PS
            </h1>
            <h1 className=" h-full uppercase border border-black border-b-0 border-t-0  text-[0.6rem] flex justify-center items-center  font-semibold text-center">
              WS
            </h1>
          </div>
        )}
        <h1
          className={cn(
            learningMode === "Face to face" ||
              (learningMode?.toLowerCase() === "other" && OthersExam)
              ? "w-[6%]"
              : "w-[10%]",
            " uppercase border border-black border-t-0 border-b   text-[0.6rem] flex justify-center items-start  font-semibold text-center"
          )}
        >
          Grade
        </h1>
        <h1
          className={cn(
            learningMode === "Face to face" ||
              (learningMode?.toLowerCase() === "other" && OthersExam)
              ? "w-[6%]"
              : "w-[10%]",
            "uppercase border border-black border-t-0 border-b   text-[0.6rem] flex justify-center items-start font-semibold text-center"
          )}
        >
          Grade
        </h1>
      </div>
      <div
        className="flex max-w-full hover:bg-gray-200 "
        onClick={() => handleDialogOpen("highest scores")}
      >
        <h1 className="w-[3%] uppercase border-x border-x-black border-b-black border-b text-sm font-semibold text-center"></h1>
        <h1 className="w-[22%] uppercase  border-b-black border-b  text-[0.6rem] flex justify-end items-center font-semibold text-right">
          Highest possible score
        </h1>
        <div className="w-[27%] uppercase border border-x-0 border-black  text-sm flex justify-center items-center font-semibold text-center">
          {Array.from({ length: 10 }).map((_, index) => (
            <h1
              key={index}
              className="w-[7%] h-full uppercase border-x first:border-l-2 border-x-black text-[0.6rem] flex justify-center items-center font-semibold text-center"
            >
              {wwhighestScores
                ? wwhighestScores.find((ww) => ww.assessmentNo === index + 1)
                    ?.score === 0
                  ? ""
                  : wwhighestScores.find((ww) => ww.assessmentNo === index + 1)
                      ?.score
                : ""}
            </h1>
          ))}
          <h1 className="w-[10%]  h-full border-x border-x-black text-[0.6rem] flex justify-center items-center font-semibold text-center">
            {wwTotal}
          </h1>
          <h1 className="w-[10%]  h-full uppercase border-x border-x-black text-[0.5rem] flex justify-center items-center font-semibold text-center">
            {calculatePercentageScore(wwTotal, wwTotal)}
          </h1>
          <h1 className="w-[10%] h-full uppercase border border-b-0 border-black  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center font-semibold text-center">
            {calculateWeightedScore(
              calculatePercentageScore(wwTotal, wwTotal),
              wwGradeWeights ?? 0
            )}
            %
          </h1>
        </div>
        <div className="w-[28%] hover:bg-gray-200  uppercase border border-black border-x-0  text-sm flex justify-center items-center font-semibold text-center">
          {Array.from({ length: 10 }).map((_, index) => (
            <h1
              key={index}
              className="w-[7%] h-full uppercase border border-b-0 border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center"
            >
              {pthighestScores
                ? pthighestScores.find((pt) => pt.assessmentNo === index + 1)
                    ?.score === 0
                  ? ""
                  : pthighestScores.find((pt) => pt.assessmentNo === index + 1)
                      ?.score
                : ""}
            </h1>
          ))}
          <h1 className="w-[10%]  h-full border-x border-x-black text-[0.6rem] flex justify-center items-center font-semibold text-center">
            {ptTotal}
          </h1>
          <h1 className="w-[10%]  h-full uppercase border-x border-x-black text-[0.5rem] flex justify-center items-center font-semibold text-center">
            {calculatePercentageScore(ptTotal, ptTotal)}
          </h1>
          <h1 className="w-[10%] h-full uppercase border border-b-0 border-black  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center font-semibold text-center">
            {calculateWeightedScore(
              calculatePercentageScore(ptTotal, ptTotal),
              ptGradeWeights ?? 0
            )}
            %
          </h1>
        </div>
        {learningMode?.toLowerCase() === "face to face" && (
          <div className="w-[8%] uppercase border border-x-0 border-black  text-sm leading-relaxed grid grid-cols-3 justify-center items-center font-semibold text-center">
            <h1 className="h-full uppercase border  border-black border-b-0 border-t-0  text-xs flex justify-center items-center  font-semibold text-center">
              {mehighestScores
                ? mehighestScores.find((me) => me.assessmentNo === 1)?.score ===
                  0
                  ? ""
                  : mehighestScores.find((pt) => pt.assessmentNo === 1)?.score
                : ""}
            </h1>
            <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center  font-semibold text-center">
              {calculatePercentageScore(meTotal, meTotal)}
            </h1>
            <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center  font-semibold text-center">
              {calculateWeightedScore(
                calculatePercentageScore(meTotal, meTotal),
                meGradeWeights ?? 0
              )}
              %
            </h1>
          </div>
        )}
        <h1
          className={cn(
            learningMode.toLowerCase() === "face to face"
              ? "w-[6%]"
              : "w-[10%]",
            " uppercase  border border-black border-t-0 text-xs flex justify-center items-start  font-semibold text-center"
          )}
        ></h1>
        <h1
          className={cn(
            learningMode.toLowerCase() === "face to face"
              ? "w-[6%]"
              : "w-[10%]",
            " uppercase  border border-black border-t-0  text-xs flex justify-center items-start font-semibold text-center"
          )}
        ></h1>
      </div>
      {/* Males */}
      <div className="flex max-w-full bg-gray-300 ">
        <h1 className="w-[3%] uppercase border-b-black border-b border-x border-x-black text-sm font-semibold text-center"></h1>
        <h1 className="w-[22%] px-1 uppercase  border-b-black border-b text-xs flex justify-start items-center font-semibold text-left">
          MALE
        </h1>
        {/* Written Works */}
        <div className="w-[27%] uppercase border-b-black border-b text-sm flex justify-center items-center font-semibold text-center">
          {Array.from({ length: 10 }).map((_, index) => (
            <h1
              key={index}
              className="w-[7%] h-full uppercase border border-b-0 border-black  first:border-l-2 text-[0.6rem] flex justify-center items-center font-semibold text-center"
            ></h1>
          ))}
          <h1 className="w-[10%]  h-full border border-b-0 border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center"></h1>
          <h1 className="w-[10%]  h-full uppercase border border-b-0 border-black  text-xs flex justify-center items-center font-semibold text-center"></h1>
          <h1 className="w-[10%] h-full uppercase border border-b-0 border-black  text-xs flex justify-center items-center font-semibold text-center"></h1>
        </div>
        {/* Performance Tasks */}
        <div className="w-[28%] uppercase border-b-black border-b text-sm flex justify-center items-center font-semibold text-center">
          {Array.from({ length: 10 }).map((_, index) => (
            <h1
              key={index}
              className="w-[7%] h-full uppercase border border-b-0 border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center"
            ></h1>
          ))}
          <h1 className="w-[10%] h-full uppercase border border-b-0 border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center"></h1>
          <h1 className="w-[10%] h-full uppercase border border-b-0 border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center"></h1>
          <h1 className="w-[10%] h-full uppercase border border-b-0 border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center"></h1>
        </div>
        {/* Major exam  */}
        {learningMode?.toLowerCase() === "face to face" && (
          <div className="w-[8%] uppercase border border-x-0 border-black text-sm leading-relaxed grid grid-cols-3 justify-center items-center font-semibold text-center">
            <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-xs flex justify-center items-center  font-semibold text-center"></h1>
            <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-xs flex justify-center items-center  font-semibold text-center"></h1>
            <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-xs flex justify-center items-center  font-semibold text-center"></h1>
          </div>
        )}

        <h1
          className={cn(
            learningMode.toLowerCase() === "face to face"
              ? "w-[6%]"
              : "w-[10%]",
            " uppercase  border border-black border-t-0 text-xs flex justify-center items-start  font-semibold text-center"
          )}
        ></h1>
        <h1
          className={cn(
            learningMode.toLowerCase() === "face to face"
              ? "w-[6%]"
              : "w-[10%]",
            " uppercase  border border-black border-t-0  text-xs flex justify-center items-start font-semibold text-center"
          )}
        ></h1>
      </div>
      {males.map((student, index)=>{
        const wwTotalScore =  calculateTotalScore(student.written.map(w => w.score))
        const wwPercentageScore = calculatePercentageScore(wwTotalScore, wwTotal)
        const wwWeightedScore = calculateWeightedScore(wwPercentageScore, wwGradeWeights ?? 0)

        const ptTotalScore =  calculateTotalScore(student.performance.map(p => p.score))
        const ptPercentageScore = calculatePercentageScore(ptTotalScore, ptTotal)
        const ptWeightedScore = calculateWeightedScore(ptPercentageScore, ptGradeWeights ?? 0)

        const meTotalScore =  calculateTotalScore(student.exam.map(e => e.score))
        const mePercentageScore = calculatePercentageScore(meTotalScore, meTotal)
        const meWeightedScore = calculateWeightedScore(mePercentageScore, meGradeWeights ?? 0)

        const initialGrade = calculateInitialGrade(wwWeightedScore, ptWeightedScore, meWeightedScore)
        const transmutedGrade = convertToTransmutedGrade(initialGrade, section.gradeLevel, learningMode, subjectThought.category )
        return (
          <div 
            onClick={()=> {
              setDialogOpen(true)
              setType(`${student.lastName}, ${student.firstName} ${student.middleName?.charAt(0) ?? ""}`)
              setStudentScores(student)
            }} 
            className="flex max-w-full hover:bg-gray-200 "
          >
          <h1 className="w-[3%] uppercase border-x-black border-x border-b-black border-b text-sm font-semibold text-center">
            {index + 1}
          </h1>
          <h1 className="w-[22%] px-1 uppercase  border-b-black border-b text-xs flex justify-start items-center font-semibold text-left">
            {student.lastName}, {student.firstName} {student.middleName?.charAt(0) ?? ""}
          </h1>
          <div className="w-[27%] uppercase border-b-black border-b  border-l-black text-sm flex justify-center items-center font-semibold text-center">
            {Array.from({ length: 10 }).map((_, index) => (
              <h1
                key={"ww-" + index}
                className="w-[7%] h-full uppercase border border-b-0 border-black first:border-l-2   text-[0.6rem] flex justify-center items-center font-semibold text-center"
              >
                {student.written[index]?.score === 0 ? "0" :student.written[index]?.score || "" } {/* Display score or empty string */}
              </h1>
            ))}
  
            <h1 className="w-[10%]  h-full border border-b-0 border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center">
              {wwTotalScore}
            </h1>
            <h1 className="w-[10%]  h-full uppercase border border-b-0 border-black  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center font-semibold text-center">
              {wwPercentageScore.toFixed(1)}
            </h1>
            <h1 className="w-[10%] h-full uppercase border border-b-0 border-black  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center font-semibold text-center">
              {wwWeightedScore.toFixed(1)}%
            </h1>
          </div>
          <div className="w-[28%] uppercase border-b-black border-b text-sm flex justify-center items-center font-semibold text-center">
            {Array.from({ length: 10 }).map((_, aindex) => (
              <h1
                key={"pt-" + index}
                className="w-[7%] h-full uppercase border border-b-0 border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center"
              >
                {student.performance[aindex]?.score || ""}  {/* Display score or empty string */}
              </h1>
            ))}
            <h1 className="w-[10%] h-full border border-b-0 border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center">
              {student.exam[0]?.score || ""} 
            </h1>
            <h1 className="w-[10%] h-full uppercase border border-b-0 border-black  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center font-semibold text-center">
              {ptPercentageScore.toFixed(1)}
            </h1>
            <h1 className="w-[10%] h-full uppercase border border-b-0 border-black  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center font-semibold text-center">
              {ptWeightedScore.toFixed(1)}%
            </h1>
          </div>
          {learningMode?.toLowerCase() === "face to face" && (
          <div className="w-[8%] uppercase border border-x-0 border-black  text-sm leading-relaxed grid grid-cols-3 justify-center items-center font-semibold text-center">
            <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center  font-semibold text-center">
              {meTotalScore}
            </h1>
            <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center  font-semibold text-center">
              {mePercentageScore.toFixed(1)}
            </h1>
            <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center  font-semibold text-center">
              {meWeightedScore.toFixed(1)}%
            </h1>
          </div>
          )}
          <div
            className={cn(
              learningMode === "Face to face" ? "w-[12%]": "w-[20%]" ,
              " uppercase border border-x-0 border-black  text-sm leading-relaxed grid grid-cols-2 justify-center items-center font-semibold text-center"
            )}
          >
            <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-xs flex justify-center items-center  font-semibold text-center">{initialGrade}</h1>
            <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-xs flex justify-center items-center  font-semibold text-center">{transmutedGrade}</h1>
          </div>
          </div>
      )})}
    

      {/* Females */}
      <div className="flex max-w-full bg-gray-300 ">
        <h1 className="w-[3%] uppercase border-b-black border-b border-x border-x-black text-sm font-semibold text-center"></h1>
        <h1 className="w-[22%] px-1 uppercase  border-b-black border-b text-xs flex justify-start items-center font-semibold text-left">
          FEMALE
        </h1>
        <div className="w-[27%] uppercase border-b-black border-b text-sm flex justify-center items-center font-semibold text-center">
          {Array.from({ length: 10 }).map((_, index) => (
            <h1
              key={index}
              className="w-[7%] h-full uppercase border border-b-0 border-black  first:border-l-2 text-[0.6rem] flex justify-center items-center font-semibold text-center"
            ></h1>
          ))}
          <h1 className="w-[10%]  h-full border border-b-0 border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center"></h1>
          <h1 className="w-[10%]  h-full uppercase border border-b-0 border-black  text-xs flex justify-center items-center font-semibold text-center"></h1>
          <h1 className="w-[10%] h-full uppercase border border-b-0 border-black  text-xs flex justify-center items-center font-semibold text-center"></h1>
        </div>
        <div className="w-[28%] uppercase border-b-black border-b text-sm flex justify-center items-center font-semibold text-center">
          {Array.from({ length: 10 }).map((_, index) => (
            <h1
              key={index}
              className="w-[7%] h-full uppercase border border-b-0 border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center"
            ></h1>
          ))}
          <h1 className="w-[10%] h-full uppercase border border-b-0 border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center"></h1>
          <h1 className="w-[10%] h-full uppercase border border-b-0 border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center"></h1>
          <h1 className="w-[10%] h-full uppercase border border-b-0 border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center"></h1>
        </div>
        {learningMode?.toLowerCase() === "face to face" && (
        <div className="w-[8%] uppercase border border-x-0 border-black  text-sm leading-relaxed grid grid-cols-3 justify-center items-center font-semibold text-center">
          <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-xs flex justify-center items-center  font-semibold text-center"></h1>
          <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-xs flex justify-center items-center  font-semibold text-center"></h1>
          <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-xs flex justify-center items-center  font-semibold text-center"></h1>
        </div>
        )}

        <h1
          className={cn(
            learningMode === "Face to face" ? "w-[6%] ": "w-[10%] ",
            "h-full uppercase border  border-black border-b  text-xs flex justify-center items-start  font-semibold text-center"
          )}
        ></h1>
        <h1
          className={cn(
            learningMode === "Face to face" ? "w-[6%] ": "w-[10%] ",
            "h-full uppercase border  border-black border-b   text-xs flex justify-center items-start font-semibold text-center"
          )}
        ></h1>
      </div>
      {females.map((student, index)=>{
        const wwTotalScore =  calculateTotalScore(student.written.map(w => w.score))
        const wwPercentageScore = calculatePercentageScore(wwTotalScore, wwTotal)
        const wwWeightedScore = calculateWeightedScore(wwPercentageScore, wwGradeWeights ?? 0)

        const ptTotalScore =  calculateTotalScore(student.performance.map(p => p.score))
        const ptPercentageScore = calculatePercentageScore(ptTotalScore, ptTotal)
        const ptWeightedScore = calculateWeightedScore(ptPercentageScore, ptGradeWeights ?? 0)

        const meTotalScore =  calculateTotalScore(student.exam.map(e => e.score))
        const mePercentageScore = calculatePercentageScore(meTotalScore, meTotal)
        const meWeightedScore = calculateWeightedScore(mePercentageScore, meGradeWeights ?? 0)

        const initialGrade = calculateInitialGrade(wwWeightedScore, ptWeightedScore, meWeightedScore)
        const transmutedGrade = convertToTransmutedGrade(initialGrade, section.gradeLevel, learningMode, subjectThought.category )
        return (
          <div 
            onClick={()=> {
              setDialogOpen(true)
              setType(`${student.lastName}, ${student.firstName} ${student.middleName?.charAt(0) ?? ""}`)
              setStudentScores(student)
            }} 
            className="flex max-w-full hover:bg-gray-200 "
          >
          <h1 className="w-[3%] uppercase border-x-black border-x border-b-black border-b text-sm font-semibold text-center">
            {index + 1}
          </h1>
          <h1 className="w-[22%] px-1 uppercase  border-b-black border-b text-xs flex justify-start items-center font-semibold text-left">
            {student.lastName}, {student.firstName} {student.middleName?.charAt(0) ?? ""}
          </h1>
          <div className="w-[27%] uppercase border-b-black border-b  border-l-black text-sm flex justify-center items-center font-semibold text-center">
            {Array.from({ length: 10 }).map((_, index) => (
              <h1
                key={"ww-" + index}
                className="w-[7%] h-full uppercase border border-b-0 border-black first:border-l-2   text-[0.6rem] flex justify-center items-center font-semibold text-center"
              >
                {student.written[index]?.score === 0 ? "0" :student.written[index]?.score || "" } {/* Display score or empty string */}
              </h1>
            ))}
  
            <h1 className="w-[10%]  h-full border border-b-0 border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center">
              {wwTotalScore}
            </h1>
            <h1 className="w-[10%]  h-full uppercase border border-b-0 border-black  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center font-semibold text-center">
              {wwPercentageScore.toFixed(1)}
            </h1>
            <h1 className="w-[10%] h-full uppercase border border-b-0 border-black  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center font-semibold text-center">
              {wwWeightedScore.toFixed(1)}%
            </h1>
          </div>
          <div className="w-[28%] uppercase border-b-black border-b text-sm flex justify-center items-center font-semibold text-center">
            {Array.from({ length: 10 }).map((_, aindex) => (
              <h1
                key={"pt-" + index}
                className="w-[7%] h-full uppercase border border-b-0 border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center"
              >
                {student.performance[aindex]?.score || ""}  {/* Display score or empty string */}
              </h1>
            ))}
            <h1 className="w-[10%] h-full border border-b-0 border-black  text-[0.6rem] flex justify-center items-center font-semibold text-center">
              {student.exam[0]?.score || ""} 
            </h1>
            <h1 className="w-[10%] h-full uppercase border border-b-0 border-black  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center font-semibold text-center">
              {ptPercentageScore.toFixed(1)}
            </h1>
            <h1 className="w-[10%] h-full uppercase border border-b-0 border-black  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center font-semibold text-center">
              {ptWeightedScore.toFixed(1)}%
            </h1>
          </div>
          {learningMode?.toLowerCase() === "face to face" && (
          <div className="w-[8%] uppercase border border-x-0 border-black  text-sm leading-relaxed grid grid-cols-3 justify-center items-center font-semibold text-center">
            <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center  font-semibold text-center">
              {meTotalScore}
            </h1>
            <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center  font-semibold text-center">
              {mePercentageScore.toFixed(1)}
            </h1>
            <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-[0.5rem] md:text-[0.6rem] flex justify-center items-center  font-semibold text-center">
              {meWeightedScore.toFixed(1)}%
            </h1>
          </div>
          )}
          <div
            className={cn(
              learningMode === "Face to face" ? "w-[12%]": "w-[20%]" ,
              " uppercase border border-x-0 border-black  text-sm leading-relaxed grid grid-cols-2 justify-center items-center font-semibold text-center"
            )}
          >
            <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-xs flex justify-center items-center  font-semibold text-center">{initialGrade}</h1>
            <h1 className="h-full uppercase border border-black border-b-0 border-t-0  text-xs flex justify-center items-center  font-semibold text-center">{transmutedGrade}</h1>
          </div>
          </div>
      )})}
      <InputDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        title={type}
        learningMode={learningMode}
        highestScores={teachingLoad.highestScores}
        wwGradeWeights={wwGradeWeights}
        ptGradeWeights={ptGradeWeights}
        meGradeWeights={meGradeWeights}
        loadId={teachingLoad._id}
        studentScores={studentScores}
        
      />
    </div>
  );
}

export default ClassRecordTemplate;
