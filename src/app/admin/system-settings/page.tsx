import { SchoolSettingsForm } from "./_components/school-settings-form";
import { ColorSettingsForm } from "./_components/color-settings-form";
import { InterventionsForm } from "./_components/interventions-form";

const SystemSettingsPage = () => {
  return (
    <div className="h-full flex items-center justify-center my-7 px-2 md:px-0">
      <div className="max-w-3xl w-full space-y-8">
        <SchoolSettingsForm />
        <ColorSettingsForm />
        <InterventionsForm />
      </div>
    </div>
  );
};

export default SystemSettingsPage;
