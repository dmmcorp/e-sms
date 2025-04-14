import { SchoolSettingsForm } from "./_components/school-settings-form";
import { ColorSettingsForm } from "./_components/color-settings-form";

const SystemSettingsPage = () => {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="max-w-3xl w-full">
        <SchoolSettingsForm />
        <ColorSettingsForm />
      </div>
    </div>
  );
};

export default SystemSettingsPage;
