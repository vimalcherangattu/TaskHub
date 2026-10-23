export type Board = {
  project: string
  about: string
  stage: string
  done: string[]
  next: string[]
  waiting: string[]
  headsUp: string[]
}

declare module 'claude-code' {
  interface PluginState {
    'plain-talk': { board: Shaped<Board>; activity: string }
  }
}
