import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Board, LastTime, Link, Progress, Word } from '../types'

// Stored across sessions, so the choice sticks until changed.
const MODE_KEY = 'mode'
const PANE = 'project-status'
const PANEL_TOOL = 'update_panel'
const PANEL_TOOL_FULL = `mcp__plain-talk__${PANEL_TOOL}`

const EMPTY: Board = {
  project: '',
  about: '',
  stage: '',
  done: [],
  next: [],
  waiting: [],
  headsUp: [],
  links: [],
  check: [],
  progress: null,
}
// Change the tag when Board's fields change: it declines what an earlier
// version stored, which outlives a reload.
const board = atom({ plugin: 'plain-talk', key: 'board' } as const, EMPTY, {
  shape: 'board-2',
})
const activity = atom({ plugin: 'plain-talk', key: 'activity' } as const, '')
const moves = atom({ plugin: 'plain-talk', key: 'moves' } as const, [])
const asked = atom({ plugin: 'plain-talk', key: 'asked' } as const, [])
const lastTime = atom({ plugin: 'plain-talk', key: 'lastTime' } as const, null, {
  shape: 'last-1',
})
const words = atom({ plugin: 'plain-talk', key: 'words' } as const, [])
const showWords = atom({ plugin: 'plain-talk', key: 'showWords' } as const, false)

const PANEL_GUIDE = `
## The side panel
The person has a "Project status" panel beside the chat, often on their phone. Keep it current with the ${PANEL_TOOL} tool, in the same plain words:
- In your first reply of a session, fill in project (its name), about (what it is, one sentence) and stage (where it stands overall, one sentence). Read STATUS.md and CLAUDE.md first when the repo has them.
- After each meaningful step, update done, next, waiting (things only the person can do, with where to do them) and headsUp. Each item is one short line. Keep done to the last few items of this session.
- For work with several steps, set progress (done, total and a short label) and keep it moving.
- After a change the person can see, set links (the live site, a preview, the change on GitHub) and check: two or three steps to see it themselves ("Open the pricing page, tap Pay, you should see...").
- When a technical word can't be avoided, add it to words with a one-line meaning. Words build up per project; send only new ones.
- Each list you send replaces the old one (words is the exception); leave a field out to keep it as is. The panel does not replace the sections at the end of your reply.`

const PLAIN = `# Talking with this person
The person is not a developer. Write every reply for a smart reader with no coding background.

- Plain words. No jargon, file paths, code, command names or error text in the main reply. When a technical term can't be avoided, explain it in a few words the first time ("a branch, a separate copy of the project where changes are kept until approved").
- Describe changes by what the person or a user of the app will notice, not by how the code works.
- End every reply that involves work with these sections, leaving out any that would be empty:
  **✅ Done**: what was finished, in a line each.
  **🔜 Next**: what Claude will do next, or suggests doing.
  **🙋 Waiting on you**: decisions, approvals, logins, keys or checks only the person can do, each with exactly what to do and where.
  **⚠️ Heads up**: risks, things that didn't work, or anything uncertain, said honestly.
- Short replies to short questions; skip the sections when nothing was worked on.
- After the sections, add one dim line: "_Say “technical details” to see how this was done._"
- When the person asks for technical details (or says "technical", "show me the code", "what changed exactly"), give them fully: files, code, commands, test output. Then return to plain style.
- Before anything that publishes live, deletes, overwrites or spends money, say so in plain words first.
${PANEL_GUIDE}`

const TECHNICAL = `# Talking with this person
The person is not a developer but has asked to see technical details for now.
Keep the plain-language summary first, ending with these sections (leave out empty ones): **✅ Done**, **🔜 Next**, **🙋 Waiting on you**, **⚠️ Heads up**.
Then add a **🔧 Technical details** section with the files changed, key code, commands run and test results, and explain any term a non-developer wouldn't know.
${PANEL_GUIDE}`

const NUDGE =
  '[plain-talk] Last turn changed things but the Project status panel was not updated. Update it with update_panel in this reply.'

// The panel's buttons, each sent as if the person typed it.
const ASKS = [
  { key: 'simpler', label: 'Explain simpler', text: 'Explain that again more simply, with an everyday example.' },
  { key: 'technical', label: 'Technical details', text: 'Show me the technical details of what you just did.' },
  { key: 'test', label: 'What should I test?', text: 'What should I check or test myself right now? Give me the steps.' },
  { key: 'wrap', label: 'Wrap up', text: 'wrap up' },
]

const LIST = { type: 'array', items: { type: 'string' } }

// What each kind of step looks like to someone watching, in plain words.
function describe(tool: string): string | undefined {
  if (tool === PANEL_TOOL_FULL) return undefined
  if (['Read', 'Grep', 'Glob'].includes(tool)) return "Reading the project's files"
  if (['Edit', 'Write', 'NotebookEdit'].includes(tool)) return 'Making changes'
  if (tool === 'Bash') return 'Running a check or command'
  if (tool === 'WebSearch' || tool === 'WebFetch') return 'Looking things up online'
  if (tool === 'Agent') return 'A helper is working on part of the task'
  if (tool === 'Skill') return 'Loading know-how for this task'
  if (tool === 'AskUserQuestion') return 'Waiting for your answer'
  if (tool.startsWith('mcp__github__')) return 'Working on GitHub'
  if (tool.startsWith('Task') || tool === 'ToolSearch') return undefined
  if (tool.startsWith('mcp__')) return `Using ${tool.split('__')[1].replace(/_/g, ' ')}`

  return 'Working'
}

// Steps that change something, after which the panel should be updated.
const CHANGES = /^(Edit|Write|NotebookEdit|Bash)$|^mcp__(?!plain-talk).*(create|update|push|merge|delete|write|apply|deploy|send)/

// Steps that publish, delete, overwrite or spend, named so a non-developer
// knows what is about to happen.
export function bigMove(tool: string, input: Record<string, unknown>): string | undefined {
  const text = (key: string) => String(input[key] ?? '')
  if (tool === 'Bash') {
    const cmd = text('command')
    if (/git push\b.*(--force|\s-f\b)/.test(cmd)) return 'Overwriting history on GitHub'
    if (/git push\b.*\b(main|master)\b/.test(cmd)) return 'Publishing changes to the main version (it may go live)'
    if (/git push\b/.test(cmd)) return 'Publishing changes to GitHub'
    if (/vercel\b.*(deploy|--prod)|netlify deploy/.test(cmd)) return 'Putting the site live'
    if (/npm publish/.test(cmd)) return 'Publishing a package for others to install'
    if (/rm -rf|git reset --hard|git clean -f/.test(cmd)) return 'Deleting or throwing away files'
    if (/\b(drop table|delete from|truncate)\b/i.test(cmd)) return 'Deleting data from a database'
    if (/supabase (db push|migration up)/.test(cmd)) return 'Changing the database structure'

    return undefined
  }
  if (!tool.startsWith('mcp__') || tool === PANEL_TOOL_FULL) return undefined
  if (/buy|purchase|payment|charge|checkout/.test(tool)) return 'Spending money'
  if (/merge_pull_request|merge_branch/.test(tool)) return 'Merging a change into the main version'
  if (/create_deployment|request_promote/.test(tool)) return 'Putting the site live'
  if (/delete|trash/.test(tool)) return 'Deleting something'
  if (/apply_migration/.test(tool)) return 'Changing the database structure'
  if (/execute_sql/.test(tool) && /\b(drop|delete|truncate)\b/i.test(text('query'))) return 'Deleting data from a database'
  if (/__(send_message|send_email|reply|forward)$/.test(tool)) return 'Sending a message for you'
  if (/(create_or_update_file|push_files)$/.test(tool) && /^(main|master)$/.test(text('branch'))) return 'Changing files on the main version on GitHub'

  return undefined
}

function asList(value: unknown): string[] | undefined {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : undefined
}

function asText(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function asLinks(value: unknown): Link[] | undefined {
  if (!Array.isArray(value)) return undefined

  return value
    .filter((one): one is Record<string, unknown> => typeof one === 'object' && one !== null)
    .map(one => ({ label: String(one.label ?? one.url ?? ''), url: String(one.url ?? '') }))
    .filter(one => /^https?:\/\//.test(one.url))
}

function asProgress(value: unknown): Progress | null | undefined {
  if (value === null) return null
  if (typeof value !== 'object' || value === undefined) return undefined
  const one = value as Record<string, unknown>
  const total = Number(one.total)
  if (!(total > 0)) return null

  return { done: Math.min(total, Math.max(0, Number(one.done) || 0)), total, label: String(one.label ?? '') }
}

function asWords(value: unknown): Word[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((one): one is Record<string, unknown> => typeof one === 'object' && one !== null)
    .map(one => ({ term: String(one.term ?? ''), meaning: String(one.meaning ?? '') }))
    .filter(one => one.term !== '' && one.meaning !== '')
}

// The bullets under STATUS.md's state and next-step headings, markdown
// stripped, so a new session shows where things were before Claude speaks.
export function readStatus(md: string): LastTime | null {
  const stage: string[] = []
  const next: string[] = []
  let into: string[] | undefined
  for (const line of md.split('\n')) {
    const heading = /^#{2,3}\s+(.*)/.exec(line)
    if (heading) {
      const title = heading[1].toLowerCase()
      into = /next|in progress/.test(title) ? next : /state|status|where/.test(title) ? stage : undefined
      continue
    }
    const bullet = /^\s{0,2}[-*]\s+(.*)/.exec(line)
    if (into && bullet && into.length < 3) {
      const plain = bullet[1].replace(/\*\*|`/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
      into.push(plain.length > 140 ? `${plain.slice(0, 137)}...` : plain)
    }
  }

  return stage.length + next.length > 0 ? { stage, next } : null
}

async function showCount($: EngineInterface) {
  const n = (await read($, board)).waiting.length + (await read($, asked)).length
  $.ui.status(n > 0 ? `🙋 ${n} waiting on you` : undefined)
}

// A toast where the person is looking, and a phone or desktop notification
// where they are not.
async function alert($: EngineInterface, title: string, text: string) {
  $.ui.toast(`${title}: ${text}`)
  await $.ui.notify(text, { title }).catch(() => undefined)
}

export const register: Register = on => {
  // The project's folder, which keys what is remembered between sessions.
  let root = ''
  let hasChanged = false
  let hasUpdatedPanel = false

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'technical',
      description: 'Add a technical-details section to every reply',
    })
    await $.command.register({
      name: 'plain',
      description: 'Plain-language replies only (the default)',
    })
    await $.command.register({
      name: 'project',
      description: 'Open the Project status panel',
    })
    await $.tool.register({
      name: PANEL_TOOL,
      description:
        'Update the Project status panel the person sees beside the chat. Plain language only. Every field is optional; a field left out keeps its value, a list sent replaces the old list (words adds to the old list).',
      inputSchema: {
        type: 'object',
        properties: {
          project: { type: 'string', description: "The project's name" },
          about: { type: 'string', description: 'What the project is, one sentence' },
          stage: { type: 'string', description: 'Where it stands overall, one sentence' },
          done: { ...LIST, description: 'Finished this session, newest last' },
          next: { ...LIST, description: 'What Claude will do next or suggests' },
          waiting: { ...LIST, description: 'What only the person can do, and where' },
          headsUp: { ...LIST, description: 'Risks or anything uncertain' },
          links: {
            type: 'array',
            description: 'Where to look: live site, preview, the change on GitHub',
            items: {
              type: 'object',
              properties: { label: { type: 'string' }, url: { type: 'string' } },
              required: ['label', 'url'],
            },
          },
          check: { ...LIST, description: 'Two or three steps for the person to see the change themselves' },
          progress: {
            type: ['object', 'null'],
            description: 'Steps done of the total for multi-step work; null clears it',
            properties: {
              done: { type: 'number' },
              total: { type: 'number' },
              label: { type: 'string' },
            },
          },
          words: {
            type: 'array',
            description: 'New technical words with a one-line plain meaning; added to the project list',
            items: {
              type: 'object',
              properties: { term: { type: 'string' }, meaning: { type: 'string' } },
              required: ['term', 'meaning'],
            },
          },
        },
      },
      isDeferred: false,
    })

    root = await $.session.root().catch(() => '')
    const saved = (await $.store.get(`board:${root}`)) as Board | undefined
    if (saved && typeof saved === 'object' && Array.isArray(saved.done)) {
      await update($, board, () => ({ ...EMPTY, ...saved }))
    } else {
      const md = await $.fs.read(`${root}/STATUS.md`).catch(() => '')
      await update($, lastTime, () => readStatus(md))
    }
    const known = await $.store.get(`words:${root}`)
    if (Array.isArray(known)) await update($, words, () => asWords(known))
    await showCount($)
    void $.ui.open({ id: PANE, title: 'Project status' })

    return next(e)
  })

  on('command.run', { command: 'technical' }, async $ => {
    await $.store.set(MODE_KEY, 'technical')

    return { text: 'Technical details are on. Every reply will end with a 🔧 Technical details section. Type /plain to switch back.' }
  })

  on('command.run', { command: 'plain' }, async $ => {
    await $.store.set(MODE_KEY, 'plain')

    return { text: 'Plain-language replies are on. Ask for “technical details” any time, or type /technical to always see them.' }
  })

  on('command.run', { command: 'project' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Project status' })

    return { text: 'Project status panel opened.' }
  })

  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)
    const mode = await $.store.get(MODE_KEY)
    const text = mode === 'technical' ? TECHNICAL : PLAIN

    return {
      sections: [
        ...composed.sections,
        { id: 'plain-talk:style', text, scope: 'session' },
      ],
    }
  })

  on('tool.call', { tool: PANEL_TOOL_FULL }, async ($, e) => {
    const input = e as unknown as Record<string, unknown>
    const before = await read($, board)
    const progress = asProgress(input.progress)
    const after: Board = {
      project: asText(input.project) ?? before.project,
      about: asText(input.about) ?? before.about,
      stage: asText(input.stage) ?? before.stage,
      done: (asList(input.done) ?? before.done).slice(-8),
      next: asList(input.next) ?? before.next,
      waiting: asList(input.waiting) ?? before.waiting,
      headsUp: asList(input.headsUp) ?? before.headsUp,
      links: asLinks(input.links) ?? before.links,
      check: asList(input.check) ?? before.check,
      progress: progress === undefined ? before.progress : progress,
    }
    await update($, board, () => after)
    await $.store.set(`board:${root}`, after)
    if (after.stage !== '') await update($, lastTime, () => null)

    const added = asWords(input.words)
    if (added.length > 0) {
      const all = await update($, words, old => [
        ...old.filter(one => !added.some(a => a.term.toLowerCase() === one.term.toLowerCase())),
        ...added,
      ])
      await $.store.set(`words:${root}`, all)
    }

    const fresh = after.waiting.filter(item => !before.waiting.includes(item))
    if (fresh.length > 0) await alert($, 'Waiting on you', fresh.join(' · '))
    await showCount($)
    hasUpdatedPanel = true

    return { result: 'Panel updated.' }
  })

  on('tool.call', { tool: 'AskUserQuestion' }, async ($, e, next) => {
    const questions = e.questions.map(q => q.question)
    await update($, asked, old => [...old, ...questions])
    await showCount($)
    await alert($, 'Claude has a question', questions.join(' · '))
    try {
      return await next(e)
    } finally {
      await update($, asked, old => old.filter(q => !questions.includes(q)))
      await showCount($)
    }
  })

  on('tool.call', async ($, e, next) => {
    const move = bigMove(e.tool, e as unknown as Record<string, unknown>)
    if (move !== undefined) {
      await update($, moves, old => [move, ...old].slice(0, 4))
      $.ui.toast(`About to: ${move}`)
    }
    const doing = move ?? describe(e.tool)
    if (doing !== undefined) await update($, activity, () => doing)
    if (CHANGES.test(e.tool)) hasChanged = true

    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    hasChanged = false
    hasUpdatedPanel = false
    await update($, activity, () => 'Reading your message')

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    await update($, activity, () => 'Done for now, waiting for you')
    if (hasChanged && !hasUpdatedPanel) {
      await $.session
        .append({ message: { type: 'user', content: [{ type: 'text', text: NUDGE }] } })
        .catch(() => undefined)
    }
    hasChanged = false

    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Link } = $.ui.resolve(e)
    const b = await read($, board)
    const now = await read($, activity)
    const recent = await read($, moves)
    const questions = await read($, asked)
    const before = await read($, lastTime)
    const glossary = await read($, words)
    const isShowingWords = await read($, showWords)
    const mode = (await $.store.get(MODE_KEY)) === 'technical' ? 'Technical' : 'Plain'
    const waiting = [...questions.map(q => `Answer: ${q}`), ...b.waiting]
    const isEmpty =
      b.project === '' && b.stage === '' && b.done.length + b.next.length + waiting.length === 0

    const heading = (title: string, color?: 'yellow' | 'red' | 'cyan') => (
      <Text bold color={color}>{title}</Text>
    )
    const section = (title: string, items: string[], color?: 'yellow' | 'red' | 'cyan') =>
      items.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          {heading(title, color)}
          {items.map(item => (
            <Text>• {item}</Text>
          ))}
        </Box>
      )
    const bar = (p: Progress) => {
      const filled = Math.round((p.done / p.total) * 10)

      return `${'▓'.repeat(filled)}${'░'.repeat(10 - filled)} ${p.done} of ${p.total}${p.label ? ` · ${p.label}` : ''}`
    }

    return (
      <Box flexDirection="column">
        {b.project !== '' && <Text bold>{b.project}</Text>}
        {b.about !== '' && <Text dimColor>{b.about}</Text>}
        {(b.stage !== '' || b.progress !== null) && (
          <Box marginTop={1} flexDirection="column">
            {heading('📍 Where it stands')}
            {b.stage !== '' && <Text>{b.stage}</Text>}
            {b.progress !== null && <Text>{bar(b.progress)}</Text>}
          </Box>
        )}
        {now !== '' && (
          <Box marginTop={1} flexDirection="column">
            {heading('⏳ Right now')}
            <Text>{now}</Text>
          </Box>
        )}
        {section('🙋 Waiting on you', waiting, 'yellow')}
        {section('📣 Big moves this session', recent, 'red')}
        {b.links.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            {heading('🔗 Where to look', 'cyan')}
            {b.links.map(link => (
              <Link href={link.url} label={link.label} />
            ))}
          </Box>
        )}
        {section('🔍 How to check it yourself', b.check)}
        {section('✅ Done', b.done)}
        {section('🔜 Next', b.next)}
        {section('⚠️ Heads up', b.headsUp, 'red')}
        {before !== null && (
          <Box flexDirection="column" marginTop={1}>
            {heading('📒 From last time')}
            {[...before.stage, ...before.next.map(item => `Next: ${item}`)].map(item => (
              <Text dimColor>• {item}</Text>
            ))}
          </Box>
        )}
        {isEmpty && before === null && (
          <Box marginTop={1}>
            <Text dimColor>This fills in as Claude works on your project.</Text>
          </Box>
        )}
        {glossary.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Button key="words" plain dimColor onPress={() => update($, showWords, shown => !shown)}>
              {isShowingWords ? '📖 Hide words' : `📖 Words explained (${glossary.length})`}
            </Button>
            {isShowingWords &&
              glossary.map(word => (
                <Text>
                  <Text bold>{word.term}</Text>: {word.meaning}
                </Text>
              ))}
          </Box>
        )}
        <Box flexDirection="column" marginTop={1}>
          {heading('Ask Claude')}
          <Box flexDirection="row" flexWrap="wrap" gap={1}>
            {ASKS.map(ask => (
              <Button key={ask.key} onPress={() => $.prompt.submit({ text: ask.text, asUser: true })}>
                {ask.label}
              </Button>
            ))}
          </Box>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Replies: {mode} · /technical or /plain to switch</Text>
        </Box>
      </Box>
    )
  })
}
