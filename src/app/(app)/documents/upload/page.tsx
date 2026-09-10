import { PageHeader } from "@/components/shared/page-header";
import { UploadManager } from "@/components/upload/upload-manager";

export default function UploadPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 md:p-8">
      <PageHeader
        title="Upload documents"
        description="Add one or more PDFs to your library. Processing runs automatically once upload completes."
      />
      <UploadManager />
    </div>
  );
}
