
import {
  AudioLines,
  Music,
  Mic,
  SlidersHorizontal,
  Images,
} from "lucide-react";

const navigation = [
  { label: "Studio", icon: AudioLines },
  { label: "Library", icon: Music },
  { label: "Karaoke", icon: Mic },
  { label: "Remix", icon: SlidersHorizontal },
  { label: "Artwork", icon: Images },
];

export default function Navigation() {
  return (
    <aside className="flex shrink-0 items-center justify-center">
      <nav
        aria-label="Studio navigation"
        className="glass-panel flex flex-wrap justify-center gap-2 rounded-3xl p-2 md:flex-col md:rounded-full"
      >
        {navigation.map(({ label, icon: Icon }, index) => (
          <button
            key={label}
            type="button"
            disabled={index !== 0}
            aria-current={
              index === 0 ? "page" : undefined
            }
            aria-label={label}
            title={label}
            className={`grid size-12 place-items-center rounded-full ${
              index === 0
                ? "bg-studio-accent text-studio-bg"
                : "text-studio-muted"
            }`}
          >
            <Icon size={21} />
          </button>
        ))}
      </nav>
    </aside>
  );
}
