import React from "react";
import { SchoolSettingsForm } from "./_components/school-settings-form";

const SystemSettingsPage = () => {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="max-w-3xl w-full">
        <SchoolSettingsForm />
      </div>
    </div>
  );
};

export default SystemSettingsPage;
