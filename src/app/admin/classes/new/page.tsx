import { BackLink } from "@/components/admin/back-link";
import { TrainingForm } from "@/components/admin/training-form";

export default function NewTrainingPage() {
  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <BackLink href="/admin/classes">
        ← All trainings
      </BackLink>
      <div className="mb-6">
        <h1 className="font-serif text-[26px] font-normal text-ink">New training</h1>
        <p className="mt-1 text-[14px] text-ink/55">
          Configure a training class. It stays a draft until you publish it.
        </p>
      </div>
      <TrainingForm />
    </div>
  );
}
