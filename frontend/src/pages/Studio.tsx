
import CameraStage from "../features/camera/CameraStage";

export default function Studio() {
  return (
    <main
      className="
        flex
        min-h-0
        min-w-0
        flex-1
        flex-col
        md:overflow-y-auto
      "
    >
      {/* Retain accessible heading and tagline */}
      <div className="sr-only">
        <h2>Live Studio</h2>

        <p>
          Don't just listen to music.
          Become the music.
        </p>
      </div>

      <CameraStage />
    </main>
  );
}
