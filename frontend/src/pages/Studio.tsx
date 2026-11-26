
import CameraStage from "../features/camera/CameraStage";

export default function Studio() {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-3 md:overflow-y-auto">
      <div className="shrink-0 px-2">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Live Studio
        </h2>

        <p className="mt-1 text-sm text-studio-muted">
          Don't just listen to music. Become the music.
        </p>
      </div>

      <CameraStage />
    </main>
  );
}
