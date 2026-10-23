export type Link = { label: string; url: string }
export type Progress = { done: number; total: number; label: string }
export type Word = { term: string; meaning: string }

export type Board = {
  project: string
  about: string
  stage: string
  done: string[]
  next: string[]
  waiting: string[]
  headsUp: string[]
  links: Link[]
  check: string[]
  progress: Progress | null
}

// What STATUS.md said, shown until Claude fills the panel in.
export type LastTime = { stage: string[]; next: string[] }

declare module 'claude-code' {
  interface PluginState {
    'plain-talk': {
      board: Shaped<Board>
      activity: string
      moves: string[]
      asked: string[]
      lastTime: Shaped<LastTime | null>
      words: Word[]
      showWords: boolean
    }
  }
}
