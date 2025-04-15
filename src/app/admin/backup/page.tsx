import { BackupCard } from "./_components/backup-card";

const BackupPage = () => {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Data Export</h1>
        <p className="text-muted-foreground">
          Manually export system data for auditing, backup, or offline use.
          Exports are generated on demand.
        </p>
      </div>

      <BackupCard />
    </div>
  );
};

export default BackupPage;
