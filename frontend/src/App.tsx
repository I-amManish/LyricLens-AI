import { AudioLines } from 'lucide-react'

function App() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f]">
      <AudioLines
        size={64}
        className="text-violet-400 mb-5"
      />

      <h1 className="text-5xl font-bold text-white">
        LyricLens <span className="text-violet-400">AI</span>
      </h1>

      <p className="mt-4 text-gray-400">
        Don't just listen to music. Become the music.
      </p>

      <p className="mt-6 text-sm text-green-400">
        Development environment ready
      </p>
    </main>
  )
}

export default App