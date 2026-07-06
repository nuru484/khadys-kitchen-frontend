"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { TrainingForm } from "@/components/admin/training-form";
import { RippleLoader } from "@/components/ui/Loader";
import { ErrorState } from "@/components/ui/ErrorState";
import { useGetTrainingByIdQuery } from "@/redux/trainings/trainings-api";

export default function EditTrainingPage() {
  const { id } = useParams<{ id: string }>();
  const { data: training, isLoading, isError, error, refetch } =
    useGetTrainingByIdQuery(id);

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <RippleLoader />
      </div>
    );
  }
  if (isError || !training) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <ErrorState error={error} onRetry={() => void refetch()} />
        <Link href="/admin/classes" className="mt-3 inline-block font-semibold text-accent">
          ← All trainings
        </Link>
      </div>
    );
  }

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <Link
        href={`/admin/classes/${id}`}
        className="mb-4 inline-block text-[13.5px] font-semibold text-accent"
      >
        ← Back to training
      </Link>
      <h1 className="mb-6 font-serif text-[26px] font-normal text-ink">
        Edit training
      </h1>
      <TrainingForm training={training} />
    </div>
  );
}
