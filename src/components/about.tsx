import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Award,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
  BarChart3,
  Brain,
  FileDigit,
} from "lucide-react";

interface HighlightTypes {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface AllHighlights {
  mainTitle: string;
  highlights: HighlightTypes[];
}

const highlightGroup: AllHighlights[] = [
  {
    mainTitle: "Key Features",
    highlights: [
      {
        title: "User Management (SUM - User Access Rights Module)",
        description:
          "This module manages the creation, deletion, and modification of user accounts and implements role-based access control for different user groups (e.g., System Administrator, School Head, Teacher, Adviser).",
        icon: <Users className="h-6 w-6 text-primary" />,
      },
      {
        title: "Record Management (RMM - Records Management Module)",
        description:
          "This module handles all the core records within the system, such as student profiles, teacher profiles, enrollment records, class records, and system maintenance data. It also includes a form generation sub-module.",
        icon: <FileDigit className="h-6 w-6 text-primary" />,
      },
      {
        title: "Recommendation System (RecSys - Recommender System Module)",
        description:
          "This module provides real-time recommendations to teachers based on student performance, suggesting interventions for students with grades below a certain threshold and ensuring accurate grade-level promotion.",
        icon: <Brain className="h-6 w-6 text-primary" />,
      },
      {
        title:
          "Reporting and Analytics (ERA - Enterprise Reports and Analytics Module)",
        description:
          "This module generates analytical reports and visualizes student performance trends, interventions, and post-intervention data to help teachers and administrators monitor progress",
        icon: <BarChart3 className="h-6 w-6 text-primary" />,
      },
    ],
  },
  {
    mainTitle: "Why Choose Us?",
    highlights: [
      {
        title: "Accuracy & Reliability",
        description:
          "Eliminate manual errors with automated calculations, data validation, and real-time updates.",
        icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
      },
      {
        title: "Accessibility & Convenience",
        description:
          "Access records anytime, anywhere through a secure online platform, allowing teachers and administrators to manage data with ease.",
        icon: <Clock className="h-6 w-6 text-primary" />,
      },
      {
        title: "Security & Data Protection",
        description:
          "Our system uses advanced encryption and secure cloud storage to safeguard sensitive student and school information.",
        icon: <Lock className="h-6 w-6 text-primary" />,
      },
      {
        title: "Compliance with DepEd Standards",
        description:
          "Align with DepEd guidelines and educational policies for efficient and standardized record-keeping.",
        icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      },
      {
        title: "Automated Reports & Analytics",
        description:
          "Generate detailed reports, track academic performance, and analyze student progress with data-driven insights.",
        icon: <FileText className="h-6 w-6 text-primary" />,
      },
    ],
  },
];

export function About() {
  return (
    <div className="w-full py-16 px-4 md:px-8 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-block bg-primary/10 px-4 py-2 rounded-full mb-2">
            <span className="text-primary font-medium">About ERMS</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            Simplify Your Workflow With Seamless Electronic Records Management!
          </h1>
          <div className="h-1 w-20 bg-primary mx-auto my-4 rounded-full"></div>
          <p className="text-lg md:text-xl text-muted-foreground">
            Welcome to ERMS, an innovative Electronic Records Management System
            designed to streamline and enhance the management of student,
            academic, and administrative records. Our system is built to improve
            efficiency, accuracy, and accessibility for educational
            institutions.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {highlightGroup.map((group, index) => (
            <Card
              key={index}
              className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardHeader className="bg-muted/50 rounded-t-lg pb-2">
                <CardTitle className="text-2xl flex items-center gap-2">
                  {index === 0 ? (
                    <Sparkles className="h-6 w-6 text-primary" />
                  ) : (
                    <Award className="h-6 w-6 text-primary" />
                  )}
                  {group.mainTitle}
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6 pb-4">
                <div className="space-y-6">
                  {group.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="mt-1 flex-shrink-0">{highlight.icon}</div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {highlight.title}
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          {highlight.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="bg-primary/5 rounded-2xl p-8 md:p-12 mt-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 z-0"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/10 rounded-full -ml-20 -mb-20 z-0"></div>

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center justify-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">Join Us Today</span>
            </div>

            <h2 className="text-3xl font-bold">
              Join the Digital Transformation
            </h2>

            <p className="text-lg text-muted-foreground">
              Our Electronic Records Management System is designed to help
              educational institutions transition into a paperless and more
              efficient record-keeping environment. Whether you're a teacher,
              school administrator, or student, our system is here to make
              academic management simpler, smarter, and more effective.
            </p>

            <blockquote className="italic font-semibold text-xl text-primary mt-6 border-l-4 border-primary pl-4 py-2">
              Let's build a future-ready education system together!
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}
