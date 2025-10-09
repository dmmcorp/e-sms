"use client";
import React from "react";
import {
  SemesterType,
  StudentWithSectionStudent,
  ShsSubject,
  QuarterGrades,
} from "@/lib/types";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import CustomTooltip from "./custom-tooltip";

function SrGradesTemplate({
  student,
  sf9,
  sf10,
  sem,
}: {
  student: StudentWithSectionStudent;
  sf10?: boolean;
  sem: SemesterType;
  sf9?: boolean;
}) {
  // Query to fetch subjects for the student in the current section
  const subjects = useQuery(api.students.getSubjects, {
    sectionSubjects: student.sectionDoc.subjects,
    studentId: student._id,
  }) as ShsSubject[] | undefined;

  // Filter core subjects based on category and semester
  const coreSubjects = subjects?.filter(
    (s) => s.category === "core" && s.semester.includes(sem)
  );

  // Filter applied and specialized subjects based on category and semester
  const appliedAndSpecialized = subjects?.filter(
    (s) => s.category === "specialized" && s.semester.includes(sem)
  );

  // Combine all subjects into a single array
  const allSubjects = [
    ...(coreSubjects || []),
    ...(appliedAndSpecialized || []),
  ];

  // Function to calculate the average of quarterly grades
  function calculateQuarterlyAverage(
    grades: { "1st": number | undefined; "2nd": number | undefined } | undefined
  ): number | null {
    if (!grades) return null;
    const gradeValues = Object.values(grades);
    if (gradeValues.length !== 2 || gradeValues.some((g) => g === undefined))
      return null;
    const sum = (gradeValues[0] as number) + (gradeValues[1] as number);
    return Number(Math.round(sum / 2).toFixed(0));
  }

  function calculateGeneralAverage(): number | null {
    if (!allSubjects || allSubjects.length === 0) return null;

    let total = 0;
    let count = 0;
    let numberOfSubjects = 0;
    console.log(allSubjects);
    allSubjects.forEach((subject) => {
      let modifiedGrades:
        | { "1st": number | undefined; "2nd": number | undefined }
        | undefined;

      if (sem === "1st semester") {
        modifiedGrades = {
          "1st":
            subject?.interventions?.["1st"]?.grade !== undefined &&
            subject?.interventions?.["1st"]?.grade !== 0
              ? subject?.interventions?.["1st"]?.grade
              : subject?.grades?.["1st"],
          "2nd":
            subject?.interventions?.["2nd"]?.grade !== undefined &&
            subject?.interventions?.["2nd"]?.grade !== 0
              ? subject?.interventions?.["2nd"]?.grade
              : subject?.grades?.["2nd"],
        };
      } else {
        modifiedGrades = {
          "1st":
            subject?.interventions?.["3rd"]?.grade !== undefined &&
            subject?.interventions?.["3rd"]?.grade !== 0
              ? subject?.interventions?.["3rd"]?.grade
              : subject?.grades?.["3rd"],
          "2nd":
            subject?.interventions?.["4th"]?.grade !== undefined &&
            subject?.interventions?.["4th"]?.grade !== 0
              ? subject?.interventions?.["4th"]?.grade
              : subject?.grades?.["4th"],
        };
      }

      console.log(modifiedGrades);
      numberOfSubjects += allSubjects.length;
      const subjectAvg = calculateQuarterlyAverage(modifiedGrades);

      if (subjectAvg !== null) {
        total += subjectAvg;
        count += 1;
      }
    });

    const hasCompleteFinalGrades = count === numberOfSubjects;
    if (!hasCompleteFinalGrades) return null;
    return count > 0 ? Math.round(total / count) : null;
  }

  const generalAverage = calculateGeneralAverage();
  console.log(generalAverage);
  if (sf10) {
    return (
      <>
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-12 border-b-black border-b  text-[0.6rem] h-[0.95rem]"
          >
            <div className="col-span-2 bg-transparent text-center border-l-black border-l   uppercase">
              {allSubjects[index]?.category}
            </div>
            <div className="col-span-6 bg-transparent border-x-black border-x uppercase px-1">
              {allSubjects[index]?.subjectName}
            </div>

            <div className="col-span-1 h-[0.95rem] bg-transparent border-none text-center ">
              {sem === "1st semester" ? (
                allSubjects[index]?.interventions?.["1st"]?.grade ? (
                  <CustomTooltip
                    trigger={
                      <span className="text-black">
                        {Math.round(
                          allSubjects[index]?.interventions?.["1st"]?.grade
                        )}
                      </span>
                    }
                    interventionRemarks={
                      allSubjects[index]?.interventions?.["1st"]?.remarks || ""
                    }
                    interventionUsed={
                      allSubjects[index]?.interventions?.["1st"]?.used || []
                    }
                    initialGrade={
                      allSubjects[index]?.grades["1st"]?.toString() ?? ""
                    }
                  />
                ) : allSubjects[index]?.grades["1st"] !== undefined ? (
                  Math.round(allSubjects[index]?.grades["1st"])
                ) : (
                  ""
                )
              ) : allSubjects[index]?.interventions?.["3rd"]?.grade ? (
                <CustomTooltip
                  trigger={
                    <span className="text-black">
                      {Math.round(
                        allSubjects[index]?.interventions?.["3rd"]?.grade
                      )}
                    </span>
                  }
                  interventionRemarks={
                    allSubjects[index]?.interventions?.["3rd"]?.remarks || ""
                  }
                  interventionUsed={
                    allSubjects[index]?.interventions?.["3rd"]?.used || []
                  }
                  initialGrade={
                    allSubjects[index]?.grades["3rd"]?.toString() ?? ""
                  }
                />
              ) : allSubjects[index]?.grades["3rd"] !== undefined ? (
                Math.round(allSubjects[index]?.grades["3rd"])
              ) : (
                ""
              )}
            </div>
            <div className="col-span-1 h-[0.95rem] bg-transparent border-l-black border-l text-center">
              {sem === "1st semester" ? (
                allSubjects[index]?.interventions?.["2nd"]?.grade ? (
                  <CustomTooltip
                    trigger={
                      <span className="text-black">
                        {Math.round(
                          allSubjects[index]?.interventions?.["2nd"]?.grade
                        )}
                      </span>
                    }
                    interventionRemarks={
                      allSubjects[index]?.interventions?.["2nd"]?.remarks || ""
                    }
                    interventionUsed={
                      allSubjects[index]?.interventions?.["2nd"]?.used || []
                    }
                    initialGrade={
                      allSubjects[index]?.grades["2nd"]?.toString() ?? ""
                    }
                  />
                ) : allSubjects[index]?.grades["2nd"] !== undefined ? (
                  Math.round(allSubjects[index]?.grades["2nd"])
                ) : (
                  ""
                )
              ) : allSubjects[index]?.interventions?.["4th"]?.grade ? (
                <CustomTooltip
                  trigger={
                    <span className="text-black">
                      {Math.round(
                        allSubjects[index]?.interventions?.["4th"]?.grade
                      )}
                    </span>
                  }
                  interventionRemarks={
                    allSubjects[index]?.interventions?.["4th"]?.remarks || ""
                  }
                  interventionUsed={
                    allSubjects[index]?.interventions?.["4th"]?.used || []
                  }
                  initialGrade={
                    allSubjects[index]?.grades["4th"]?.toString() ?? ""
                  }
                />
              ) : allSubjects[index]?.grades["4th"] !== undefined ? (
                Math.round(allSubjects[index]?.grades["4th"])
              ) : (
                ""
              )}
            </div>

            <div className="col-span-1 text-center border-l-black border-l h-full">
              <p className="">
                {allSubjects[index]?.grades && sem === "1st semester"
                  ? calculateQuarterlyAverage({
                      "1st": allSubjects[index].interventions
                        ? allSubjects[index]?.interventions?.["1st"]?.grade
                          ? allSubjects[index]?.interventions["1st"].grade
                          : allSubjects[index]?.grades["1st"]
                        : allSubjects[index]?.grades["1st"],
                      "2nd": allSubjects[index].interventions
                        ? allSubjects[index]?.interventions?.["2nd"]?.grade
                          ? allSubjects[index]?.interventions["2nd"].grade
                          : allSubjects[index]?.grades["2nd"]
                        : allSubjects[index]?.grades["2nd"],
                    })
                  : calculateQuarterlyAverage({
                      "1st": allSubjects[index].interventions
                        ? allSubjects[index]?.interventions?.["3rd"]?.grade
                          ? allSubjects[index]?.interventions["3rd"].grade
                          : allSubjects[index]?.grades["3rd"]
                        : allSubjects[index]?.grades["3rd"],
                      "2nd": allSubjects[index].interventions
                        ? allSubjects[index]?.interventions?.["4th"]?.grade
                          ? allSubjects[index]?.interventions["4th"].grade
                          : allSubjects[index]?.grades["4th"]
                        : allSubjects[index]?.grades["4th"],
                    })}
              </p>
            </div>
            <div className="col-span-1 text-center border-l-black border-l border-r border-r-black h-full">
              <p className="">
                {allSubjects[index]?.grades && sem === "1st semester"
                  ? (() => {
                      const grades = {
                        "1st": allSubjects[index]?.interventions
                          ? allSubjects[index]?.interventions?.["1st"]?.grade
                            ? allSubjects[index]?.interventions["1st"].grade
                            : allSubjects[index]?.grades["1st"]
                          : allSubjects[index]?.grades["1st"],
                        "2nd": allSubjects[index]?.interventions
                          ? allSubjects[index]?.interventions?.["2nd"]?.grade
                            ? allSubjects[index]?.interventions["2nd"].grade
                            : allSubjects[index]?.grades["2nd"]
                          : allSubjects[index]?.grades["2nd"],
                      };
                      if (
                        grades["1st"] === undefined ||
                        grades["2nd"] === undefined
                      )
                        return null;
                      const average = calculateQuarterlyAverage(grades);
                      return average !== null
                        ? average <= 74
                          ? "Failed"
                          : "Passed"
                        : "";
                    })()
                  : (() => {
                      const grades = {
                        "1st": allSubjects[index]?.interventions
                          ? allSubjects[index]?.interventions?.["3rd"]?.grade
                            ? allSubjects[index]?.interventions["3rd"].grade
                            : allSubjects[index]?.grades["3rd"]
                          : allSubjects[index]?.grades["3rd"],
                        "2nd": allSubjects[index]?.interventions
                          ? allSubjects[index]?.interventions?.["4th"]?.grade
                            ? allSubjects[index]?.interventions["4th"].grade
                            : allSubjects[index]?.grades["4th"]
                          : allSubjects[index]?.grades["4th"],
                      };
                      if (
                        grades["1st"] === undefined ||
                        grades["2nd"] === undefined
                      )
                        return null;
                      const average = calculateQuarterlyAverage(grades);
                      return average !== null
                        ? average <= 74
                          ? "Failed"
                          : "Passed"
                        : "";
                    })()}
              </p>
            </div>
          </div>
        ))}
      </>
    );
  }
  return (
    <div className="max-w-full">
      {!sf9 ? (
        <h1 className="text-xs font-semibold capitalize">
          LEARNER&apos;S PROGRESS REPORT CARD
        </h1>
      ) : (
        <h1 className="text-left text-xs font-semibold capitalize">{sem}</h1>
      )}
      <div
        className={`max-w-full flex ${sf9 ? "text-[0.6rem]" : "text-lg"} bg-gray-200 border border-black`}
      >
        <div className="w-[60%] font-bold flex items-center justify-center">
          <h1>Subject</h1>
        </div>
        <div className="w-[25%] font-bold border-x border-x-black">
          <h1 className="text-center border-b border-b-black">Quarter</h1>
          <div className="grid grid-cols-2 text-center">
            <h1 className="h-full">{sem === "1st semester" ? "1" : "3"}</h1>
            <h1 className="border-l h-full border-l-black">
              {sem === "1st semester" ? "2" : "4"}
            </h1>
          </div>
        </div>
        <div className="w-[15%] font-bold text-center">
          <h1>Semester</h1>
          <h1>Final Grade</h1>
        </div>
      </div>
      <div
        className={`max-w-full flex ${sf9 ? "text-[0.6rem]" : "text-lg"} font-bold bg-gray-200 border border-black`}
      >
        <div className="w-[60%] flex items-center justify-start px-2 py-1">
          <h1>Core Subjects</h1>
        </div>
      </div>
      {coreSubjects &&
        Array.from({ length: 6 }).map((_, index) => (
          <div
            key={coreSubjects[index]?._id}
            className={`max-w-full flex ${sf9 ? "text-[0.6rem] leading-[0.65rem] h-5" : "text-lg"} border border-black`}
          >
            <div className="w-[60%] font-bold flex items-center justify-start py-1 px-2 border-r-black border-r">
              <h1>{coreSubjects[index]?.subjectName}</h1>
            </div>
            <div className="w-[25%] grid grid-cols-2 items-center font-bold border-r-black border-r">
              <h1 className="text-center my-auto h-full content-center border-r-black border-r">
                {sem === "1st semester" ? (
                  coreSubjects[index]?.interventions?.["1st"]?.grade ? (
                    <CustomTooltip
                      trigger={
                        <span className="text-black">
                          {Math.round(
                            coreSubjects[index]?.interventions?.["1st"]?.grade
                          )}
                        </span>
                      }
                      interventionRemarks={
                        coreSubjects[index]?.interventions?.["1st"]?.remarks ||
                        ""
                      }
                      interventionUsed={
                        coreSubjects[index]?.interventions?.["1st"]?.used || []
                      }
                      initialGrade={
                        coreSubjects[index]?.grades["1st"]?.toString() ?? ""
                      }
                    />
                  ) : coreSubjects[index]?.grades["1st"] !== undefined ? (
                    Math.round(coreSubjects[index]?.grades["1st"])
                  ) : (
                    ""
                  )
                ) : coreSubjects[index]?.interventions?.["3rd"]?.grade ? (
                  <CustomTooltip
                    trigger={
                      <span className="text-black">
                        {Math.round(
                          coreSubjects[index]?.interventions?.["3rd"]?.grade
                        )}
                      </span>
                    }
                    interventionRemarks={
                      coreSubjects[index]?.interventions?.["3rd"]?.remarks || ""
                    }
                    interventionUsed={
                      coreSubjects[index]?.interventions?.["3rd"]?.used || []
                    }
                    initialGrade={
                      coreSubjects[index]?.grades["3rd"]?.toString() ?? ""
                    }
                  />
                ) : coreSubjects[index]?.grades["3rd"] !== undefined ? (
                  Math.round(coreSubjects[index]?.grades["3rd"])
                ) : (
                  ""
                )}
              </h1>
              <h1 className="text-center my-auto h-full content-center">
                {sem === "1st semester" ? (
                  coreSubjects[index]?.interventions?.["2nd"]?.grade ? (
                    <CustomTooltip
                      trigger={
                        <span className="text-black">
                          {Math.round(
                            coreSubjects[index]?.interventions?.["2nd"]?.grade
                          )}
                        </span>
                      }
                      interventionRemarks={
                        coreSubjects[index]?.interventions?.["2nd"]?.remarks ||
                        ""
                      }
                      interventionUsed={
                        coreSubjects[index]?.interventions?.["2nd"]?.used || []
                      }
                      initialGrade={
                        coreSubjects[index]?.grades["2nd"]?.toString() ?? ""
                      }
                    />
                  ) : coreSubjects[index]?.grades["2nd"] !== undefined ? (
                    Math.round(coreSubjects[index]?.grades["2nd"])
                  ) : (
                    ""
                  )
                ) : coreSubjects[index]?.interventions?.["4th"]?.grade ? (
                  <CustomTooltip
                    trigger={
                      <span className="text-black">
                        {Math.round(
                          coreSubjects[index]?.interventions?.["4th"]?.grade
                        )}
                      </span>
                    }
                    interventionRemarks={
                      coreSubjects[index]?.interventions?.["4th"]?.remarks || ""
                    }
                    interventionUsed={
                      coreSubjects[index]?.interventions?.["4th"]?.used || []
                    }
                    initialGrade={
                      coreSubjects[index]?.grades["4th"]?.toString() ?? ""
                    }
                  />
                ) : coreSubjects[index]?.grades["4th"] !== undefined ? (
                  Math.round(coreSubjects[index]?.grades["4th"])
                ) : (
                  ""
                )}
              </h1>
            </div>
            <div className="w-[15%] font-bold text-center ">
              <h1 className="text-center my-auto h-full content-center">
                {coreSubjects[index]?.grades && sem === "1st semester"
                  ? calculateQuarterlyAverage({
                      "1st": coreSubjects[index]?.interventions?.["1st"]
                        ? coreSubjects[index]?.interventions["1st"].grade
                        : coreSubjects[index]?.grades["1st"],
                      "2nd": coreSubjects[index]?.interventions?.["2nd"]
                        ? coreSubjects[index]?.interventions["2nd"].grade
                        : coreSubjects[index]?.grades["2nd"],
                    })
                  : calculateQuarterlyAverage({
                      "1st": coreSubjects[index]?.interventions?.["3rd"]
                        ? coreSubjects[index]?.interventions["3rd"].grade
                        : coreSubjects[index]?.grades["3rd"],
                      "2nd": coreSubjects[index]?.interventions?.["4th"]
                        ? coreSubjects[index]?.interventions["4th"].grade
                        : coreSubjects[index]?.grades["4th"],
                    })}
              </h1>
            </div>
          </div>
        ))}

      <div
        className={`max-w-full flex ${sf9 ? "text-[0.6rem]" : "text-lg"} font-bold bg-gray-200 border border-black`}
      >
        <div className="w-[60%] flex items-center justify-start px-2 py-1">
          <h1>Applied & Specialized Subjects</h1>
        </div>
      </div>
      {appliedAndSpecialized &&
        Array.from({ length: 5 }).map((_, index) => (
          <div
            key={appliedAndSpecialized[index]?._id}
            className={`max-w-full flex ${sf9 ? "text-[0.6rem] leading-[0.65rem] h-5" : "text-lg"} border border-black`}
          >
            <div className="w-[60%] font-bold flex items-center justify-start py-1 px-2 border-r-black border-r">
              <h1>{appliedAndSpecialized[index]?.subjectName}</h1>
            </div>
            <div className="w-[25%] grid grid-cols-2 items-center font-bold border-r-black border-r">
              <h1 className="text-center my-auto h-full content-center border-r-black border-r">
                {sem === "1st semester" ? (
                  appliedAndSpecialized[index]?.interventions?.["1st"]
                    ?.grade ? (
                    <CustomTooltip
                      trigger={
                        <span className="text-black">
                          {Math.round(
                            appliedAndSpecialized[index]?.interventions?.["1st"]
                              ?.grade
                          )}
                        </span>
                      }
                      interventionRemarks={
                        appliedAndSpecialized[index]?.interventions?.["1st"]
                          ?.remarks || ""
                      }
                      interventionUsed={
                        appliedAndSpecialized[index]?.interventions?.["1st"]
                          ?.used || []
                      }
                      initialGrade={
                        appliedAndSpecialized[index]?.grades[
                          "1st"
                        ]?.toString() ?? ""
                      }
                    />
                  ) : appliedAndSpecialized[index]?.grades["1st"] !==
                    undefined ? (
                    Math.round(appliedAndSpecialized[index]?.grades["1st"])
                  ) : (
                    ""
                  )
                ) : appliedAndSpecialized[index]?.interventions?.["3rd"]
                    ?.grade ? (
                  <CustomTooltip
                    trigger={
                      <span className="text-black">
                        {Math.round(
                          appliedAndSpecialized[index]?.interventions?.["3rd"]
                            ?.grade
                        )}
                      </span>
                    }
                    interventionRemarks={
                      appliedAndSpecialized[index]?.interventions?.["3rd"]
                        ?.remarks || ""
                    }
                    interventionUsed={
                      appliedAndSpecialized[index]?.interventions?.["3rd"]
                        ?.used || []
                    }
                    initialGrade={
                      appliedAndSpecialized[index]?.grades["3rd"]?.toString() ??
                      ""
                    }
                  />
                ) : appliedAndSpecialized[index]?.grades["3rd"] !==
                  undefined ? (
                  Math.round(appliedAndSpecialized[index]?.grades["3rd"])
                ) : (
                  ""
                )}
              </h1>
              <h1 className="text-center my-auto h-full content-center">
                {sem === "1st semester" ? (
                  appliedAndSpecialized[index]?.interventions?.["2nd"]
                    ?.grade ? (
                    <CustomTooltip
                      trigger={
                        <span className="text-black">
                          {Math.round(
                            appliedAndSpecialized[index]?.interventions?.["2nd"]
                              ?.grade
                          )}
                        </span>
                      }
                      interventionRemarks={
                        appliedAndSpecialized[index]?.interventions?.["2nd"]
                          ?.remarks || ""
                      }
                      interventionUsed={
                        appliedAndSpecialized[index]?.interventions?.["2nd"]
                          ?.used || []
                      }
                      initialGrade={
                        appliedAndSpecialized[index]?.grades[
                          "2nd"
                        ]?.toString() ?? ""
                      }
                    />
                  ) : appliedAndSpecialized[index]?.grades["2nd"] !==
                    undefined ? (
                    Math.round(appliedAndSpecialized[index]?.grades["2nd"])
                  ) : (
                    ""
                  )
                ) : appliedAndSpecialized[index]?.interventions?.["4th"]
                    ?.grade ? (
                  <CustomTooltip
                    trigger={
                      <span className="text-black">
                        {Math.round(
                          appliedAndSpecialized[index]?.interventions?.["4th"]
                            ?.grade
                        )}
                      </span>
                    }
                    interventionRemarks={
                      appliedAndSpecialized[index]?.interventions?.["4th"]
                        ?.remarks || ""
                    }
                    interventionUsed={
                      appliedAndSpecialized[index]?.interventions?.["4th"]
                        ?.used || []
                    }
                    initialGrade={
                      appliedAndSpecialized[index]?.grades["4th"]?.toString() ??
                      ""
                    }
                  />
                ) : appliedAndSpecialized[index]?.grades["4th"] !==
                  undefined ? (
                  Math.round(appliedAndSpecialized[index]?.grades["4th"])
                ) : (
                  ""
                )}
              </h1>
            </div>
            <div className="w-[15%] font-bold text-center ">
              <h1 className="text-center my-auto h-full content-center">
                {appliedAndSpecialized[index]?.grades && sem === "1st semester"
                  ? calculateQuarterlyAverage({
                      "1st": appliedAndSpecialized[index]?.interventions?.[
                        "1st"
                      ]?.grade
                        ? appliedAndSpecialized[index]?.interventions["1st"]
                            .grade
                        : appliedAndSpecialized[index]?.grades["1st"],
                      "2nd": appliedAndSpecialized[index]?.interventions?.[
                        "2nd"
                      ]?.grade
                        ? appliedAndSpecialized[index]?.interventions["2nd"]
                            .grade
                        : appliedAndSpecialized[index]?.grades["2nd"],
                    })
                  : calculateQuarterlyAverage({
                      "1st": appliedAndSpecialized[index]?.interventions?.[
                        "3rd"
                      ]?.grade
                        ? appliedAndSpecialized[index]?.interventions["3rd"]
                            .grade
                        : appliedAndSpecialized[index]?.grades["3rd"],
                      "2nd": appliedAndSpecialized[index]?.interventions?.[
                        "4th"
                      ]?.grade
                        ? appliedAndSpecialized[index]?.interventions["4th"]
                            .grade
                        : appliedAndSpecialized[index]?.grades["4th"],
                    })}
              </h1>
            </div>
          </div>
        ))}

      <div
        className={`max-w-full flex ${sf9 ? "text-[0.6rem]" : "text-lg"} font-bold border border-black `}
      >
        <div
          className={`w-[85%] text-right tracking-widest ${sf9 ? "text-[0.6rem]" : "text-xl"} border-r border-r-black px-2 py-1`}
        >
          General Average for this Semester
        </div>
        <div className="w-[15%] content-center text-center">
          {generalAverage}
        </div>
      </div>
    </div>
  );
}

export default SrGradesTemplate;
