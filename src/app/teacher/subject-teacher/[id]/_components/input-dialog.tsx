"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import { DialogType } from "./input-grades";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Lock, X } from "lucide-react";
import {
  calculatePercentageScore,
  calculateWeightedScore,
  cn,
} from "@/lib/utils";
import { Doc, Id } from "../../../../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { toast } from "sonner";
import { StudentScoresType } from "@/lib/types";
import SubmitDialog from "./submit-dialog";

// Define the props interface for the InputDialog component
interface InputDialogProps {
  fullName: string;
  dialogOpen: boolean;
  setDialogOpen: (value: boolean) => void;
  title: DialogType | undefined;
  learningMode: "Face to face" | "Modular" | "Other";
  highestScores: Doc<"highestScores">[];
  wwGradeWeights: number | undefined;
  ptGradeWeights: number | undefined;
  meGradeWeights: number | undefined;
  loadId: Id<"teachingLoad">;
  studentScores: StudentScoresType | undefined;
  transmutedGrade: number | undefined;
  isSubmitted: boolean | undefined;
  component: "Written Works" | "Performance Tasks" | "Major Exam";
}

function InputDialog({
  fullName,
  dialogOpen,
  setDialogOpen,
  title,
  highestScores,
  wwGradeWeights,
  ptGradeWeights,
  meGradeWeights,
  loadId,
  studentScores,
  transmutedGrade,
  isSubmitted,
  component,
  learningMode,
}: InputDialogProps) {
  // State to manage the input scores for each assessment
  const [scoresInput, setScoresInput] = useState<{ [key: number]: number }>({});
  // State to manage the maximum number of inputs allowed
  const [maxInputs, setMaxInputs] = useState<number>(0);
  // State to track if the save operation is in progress
  const [isSaving, setIsSaving] = useState<boolean>(false);
  // State to manage the open/close state of the submit dialog
  const [open, setOpen] = useState<boolean>(false);
  // Calculate the total score from the input scores
  const totalScore = Object.values(scoresInput).reduce(
    (acc, curr) => acc + curr,
    0
  );

  // Convex mutations for saving data
  const createUserLogs = useMutation(api.logs.createUserLogs);
  const saveHighestScores = useMutation(api.teachingLoad.saveHighestScores);
  const createComponentScore = useMutation(
    api.classRecords.createComponentScore
  );
  const saveQuarterlyGrades = useMutation(api.classRecords.saveQuarterlyGrades);

  // Determine the grade weight based on the component type
  let gradeWeight;
  switch (component) {
    case "Written Works":
      gradeWeight = wwGradeWeights;
      break;
    case "Performance Tasks":
      gradeWeight = ptGradeWeights;
      break;
    case "Major Exam":
      gradeWeight = meGradeWeights;
      break;
    default:
      gradeWeight = undefined;
      break;
  }

  // Effect to initialize scores and max inputs when the dialog opens
  useEffect(() => {
    if (!dialogOpen) return;

    const formattedScores: { [key: number]: number } = {};
    let currentScores;

    if (title === "highest scores") {
      // For highest scores, set fixed limits based on the component type
      if (component === "Written Works" || component === "Performance Tasks") {
        setMaxInputs(10);
      } else if (component === "Major Exam") {
        setMaxInputs(1);
      }

      currentScores =
        highestScores.find((s) => s.componentType === component)?.scores || [];
    } else {
      // For student scores, limit inputs to the number of items in highest scores
      const highest = highestScores.find((s) => s.componentType === component);
      setMaxInputs(highest?.scores.length || 0);

      if (component === "Written Works") {
        currentScores = studentScores?.written || [];
      }
      if (component === "Performance Tasks") {
        currentScores = studentScores?.performance || [];
      }
      if (component === "Major Exam") {
        currentScores = studentScores?.exam || [];
      }
    }

    // Format the current scores into the state
    if (currentScores) {
      currentScores.forEach((score) => {
        formattedScores[score.assessmentNo] = score.score;
      });
      setScoresInput(formattedScores);
    }
  }, [dialogOpen, component, highestScores, studentScores, title]);

  // Function to handle changes in input fields
  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const rawValue = parseFloat(e.target.value);
    const highestScoreObj = highestScores.find(
      (hs) => hs.componentType === component
    );
    const maxScore =
      highestScoreObj?.scores.find((s) => s.assessmentNo === index + 1)
        ?.score ?? Infinity;

    if (!isNaN(rawValue) && rawValue <= maxScore) {
      // Update the score if it's valid
      setScoresInput((prev) => ({
        ...prev,
        [index + 1]: rawValue,
      }));
    } else if (rawValue > maxScore) {
      // Show a warning if the score exceeds the maximum
      toast.warning(`Score cannot exceed the highest score (${maxScore})`);
    }
  };

  // Function to handle submitting grades
  const handleSubmitGrades = () => {
    setIsSaving(true);

    // Submit the grades
    toast.promise(
      saveQuarterlyGrades({
        loadId: loadId,
        studentId: studentScores?._id,
        wwGradeWeights: wwGradeWeights ?? 0,
        ptGradeWeights: ptGradeWeights ?? 0,
        meGradeWeights: meGradeWeights ?? 0,
        learningMode: learningMode,
      })
    );
    setOpen(false);
    setDialogOpen(false);
    setIsSaving(false);
  };

  // Function to handle saving scores
  const handleSaveScore = () => {
    setIsSaving(true);
    // Transform scores into the required format
    const transformedScores = Object.entries(scoresInput)
      .filter(([_, score]) => !isNaN(score)) // Filter out empty or invalid scores
      .map(([assessmentNo, score]) => ({
        assessmentNo: parseInt(assessmentNo),
        score: Number(score),
      }));
    if (title === "highest scores") {
      // Save highest scores
      toast.promise(
        saveHighestScores({
          loadId: loadId,
          componentType: component,
          scores: transformedScores,
        }),
        {
          loading: "Saving scores...",
          success: async (data) => {
            await createUserLogs({
              details: `Updated highest scores for ${component}`,
              action: "Update",
            });
            return "Scores saved successfully.";
          },
          error: async (error) => {
            await createUserLogs({
              details: `Failed to update highest scores for ${component}: ${error?.message || error}`,
              action: "Error",
            });
            return "Unable to save the scores";
          },
        }
      );
      setIsSaving(false);
      setDialogOpen(false);
    } else {
      // Save student scores
      toast.promise(
        createComponentScore({
          classRecordId: studentScores?.classRecord._id,
          componentType: component,
          scores: transformedScores,
          learningMode: learningMode,
        }),
        {
          loading: "Saving scores...",
          success: async (data) => {
            setIsSaving(false);
            await createUserLogs({
              details: `Saved scores for ${component} (${fullName}) - Scores: [${transformedScores.map((s) => `#${s.assessmentNo}: ${s.score}`).join(", ")}]`,
              action: "Input-Scores",
            });
            if (data.readyToSubmit) {
              handleSubmitGrades();
            }
            setDialogOpen(false);
            return "Scores saved successfully.";
          },
          error: async (error) => {
            await createUserLogs({
              details: `Failed to save scores for ${component}`,
              action: "Input-Scores",
            });
            setIsSaving(false);
            return "Unable to save the scores";
          },
        }
      );
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="md:max-w-4xl">
        <div className="flex items-center justify-between w-full ">
          <DialogTitle className="w-full capitalize flex items-center justify-between">
            <div className="">{title}</div>
            <div className="text-center">{component}</div>
          </DialogTitle>
          <SubmitDialog
            transmutedGrade={transmutedGrade}
            onOpenDialog={open}
            setOpenDialog={setOpen}
            isSaving={isSaving}
            handleSumbit={handleSubmitGrades}
          />
        </div>
        {component === "Major Exam" ? (
          <div className="space-y-2">
            <div className="">
              <Input
                id={component + "1"}
                name={component + "1"}
                placeholder={`Enter exam score`}
                value={scoresInput["1"] ?? ""}
                min={0}
                max={
                  highestScores
                    .find((hs) => hs.componentType === component)
                    ?.scores.find((s) => s.assessmentNo === 1)?.score ??
                  Infinity
                }
                onChange={(e) => {
                  const rawValue = parseFloat(e.target.value);
                  const highestScoreObj = highestScores.find(
                    (hs) => hs.componentType === component
                  );
                  const maxScore =
                    highestScoreObj?.scores.find((s) => s.assessmentNo === 1)
                      ?.score ?? Infinity;

                  if (!isNaN(rawValue) && rawValue <= maxScore) {
                    setScoresInput((prev) => ({
                      ...prev,
                      ["1"]: rawValue,
                    }));
                  } else if (rawValue > maxScore) {
                    toast.warning(
                      `Score cannot exceed the highest score (${maxScore})`
                    );
                  }
                }}
              />
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="flex items-center justify-between font-medium">
                Total:
                <span className="text-xl font-bold">{totalScore}</span>
              </h3>
              <h3 className="flex items-center justify-between font-medium">
                Percentage Score:
                <span className="text-xl font-bold">
                  {calculatePercentageScore(
                    totalScore,
                    title === "highest scores"
                      ? totalScore
                      : highestScores
                          .find((s) => s.componentType === component)
                          ?.scores.reduce(
                            (acc, score) => acc + score.score,
                            0
                          ) || 1 // prevent divide by 0
                  ).toFixed(1)}
                </span>
              </h3>
              <h3 className="flex items-center justify-between font-medium">
                Weighted Score:
                <span className="text-xl font-bold">
                  {calculateWeightedScore(
                    calculatePercentageScore(
                      totalScore,
                      title === "highest scores"
                        ? totalScore
                        : highestScores
                            .find((s) => s.componentType === component)
                            ?.scores.reduce(
                              (acc, score) => acc + score.score,
                              0
                            ) || 1
                    ),
                    gradeWeight ?? 0
                  ).toFixed(1)}
                </span>
              </h3>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: maxInputs }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Label
                    htmlFor={component + (index + 1)}
                    className="text-nowrap"
                  >
                    Score # {index + 1}{" "}
                  </Label>
                  <Input
                    id={component + (index + 1)}
                    name={component + (index + 1)}
                    placeholder={`Score`}
                    type="number"
                    min={0}
                    max={
                      title === "highest scores"
                        ? 100
                        : (highestScores.find(
                            (s) => s.componentType === component
                          )?.scores[index]?.score ?? 100)
                    }
                    value={scoresInput[index + 1] ?? ""}
                    onChange={(e) => handleOnChange(e, index)}
                  />
                </div>
              ))}
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="flex items-center justify-between font-medium">
                Total:
                <span className="text-xl font-bold">{totalScore}</span>
              </h3>
              <h3 className="flex items-center justify-between font-medium">
                Percentage Score:
                <span className="text-xl font-bold">
                  {calculatePercentageScore(
                    totalScore,
                    title === "highest scores"
                      ? totalScore
                      : highestScores
                          .find((s) => s.componentType === component)
                          ?.scores.reduce(
                            (acc, score) => acc + score.score,
                            0
                          ) || 1
                  ).toFixed(1)}
                </span>
              </h3>
              <h3 className="flex items-center justify-between font-medium">
                Weighted Score:
                <span className="text-xl font-bold">
                  {calculateWeightedScore(
                    calculatePercentageScore(
                      totalScore,
                      title === "highest scores"
                        ? totalScore
                        : highestScores
                            .find((s) => s.componentType === component)
                            ?.scores.reduce(
                              (acc, score) => acc + score.score,
                              0
                            ) || 1
                    ),
                    gradeWeight ?? 0
                  ).toFixed(1)}
                </span>
              </h3>
            </div>
          </div>
        )}
        <DialogFooter>
          <div className="flex gap-x-5">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSaveScore}>
              {isSaving ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⏳</span> Saving...
                </span>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InputDialog;
