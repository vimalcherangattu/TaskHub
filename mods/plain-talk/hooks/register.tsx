import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Board } from '../types'

// Stored across sessions, so the choice sticks until changed.
const MODE_KEY = 'mode'
const PANE = 'project-status'
const PANEL_TOOL = 'update_panel'

const EMPTY: Board = {
  project: '',
  about: '',
  stage: '',
  done: [],
  next: [],
  waiting: [],
  headsUp: [],
}
// Change the tag when Board's fields change: it declines what an earlier
// version stored, which outlives a reload.
const board = atom({ plugin: 'plain-talk', key: 'board' } as const, EMPTY, {
  shape: 'board-1',
})
const activity = atom({ plugin: 'plain-talk', key: 'activity' } as const, '')

const PANEL_GUIDE = `
## The side panel
The person has a "Project status" panel beside the chat. Keep it current with the ${PANEL_TOOL} tool, in the same plain words:
- Early in a session, once you understand the project, fill in project (its name), about (what it is, one sentence) and stage (where it stands overall, one sentence, e.g. "Working app, adding sign-in before launch").
- After each meaningful step, update done, next, waiting (things only the person can do) and headsUp. Each item is one short line. Keep done to the last few items of this session.
- Each list you send replaces the old one; leave a field out to keep it as is. The panel does not replace the sections at the end of your reply.`

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
${PANEL_GUIDE}`

const TECHNICAL = `# Talking with this person
The person is not a developer but has asked to see technical details for now.
Keep the plain-language summary first, ending with these sections (leave out empty ones): **✅ Done**, **🔜 Next**, **🙋 Waiting on you**, **⚠️ Heads up**.
Then add a **🔧 Technical details** section with the files changed, key code, commands run and test results, and explain any term a non-developer wouldn't know.
${PANEL_GUIDE}`

const LIST = { type: 'array', items: { type: 'string' } }

// What each kind of step looks like to someone watching, in plain words.
function describe(tool: string): string | undefined {
  if (tool === `mcp__plain-talk__${PANEL_TOOL}`) return undefined
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

function asList(value: unknown): string[] | undefined {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : undefined
}

function asText(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

export const register: Register = on => {
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
        'Update the Project status panel the person sees beside the chat. Plain language only. Every field is optional; a field left out keeps its value, a list sent replaces the old list.',
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
        },
      },
      isDeferred: false,
    })
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

  on('tool.call', { tool: `mcp__plain-talk__${PANEL_TOOL}` }, async ($, e) => {
    const input = e as unknown as Record<string, unknown>
    await update($, board, old => ({
      project: asText(input.project) ?? old.project,
      about: asText(input.about) ?? old.about,
      stage: asText(input.stage) ?? old.stage,
      done: (asList(input.done) ?? old.done).slice(-8),
      next: asList(input.next) ?? old.next,
      waiting: asList(input.waiting) ?? old.waiting,
      headsUp: asList(input.headsUp) ?? old.headsUp,
    }))

    return { result: 'Panel updated.' }
  })

  on('tool.call', async ($, e, next) => {
    const doing = describe(e.tool)
    if (doing !== undefined) await update($, activity, () => doing)

    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    await update($, activity, () => 'Reading your message')

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    await update($, activity, () => 'Done for now, waiting for you')

    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const b = await read($, board)
    const now = await read($, activity)
    const mode = (await $.store.get(MODE_KEY)) === 'technical' ? 'Technical' : 'Plain'
    const isEmpty =
      b.project === '' && b.done.length + b.next.length + b.waiting.length === 0

    const section = (title: string, items: string[], color?: 'yellow' | 'red') =>
      items.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold color={color}>{title}</Text>
          {items.map(item => (
            <Text>• {item}</Text>
          ))}
        </Box>
      )

    return (
      <Box flexDirection="column">
        {b.project !== '' && <Text bold>{b.project}</Text>}
        {b.about !== '' && <Text dimColor>{b.about}</Text>}
        {b.stage !== '' && (
          <Box marginTop={1} flexDirection="column">
            <Text bold>📍 Where it stands</Text>
            <Text>{b.stage}</Text>
          </Box>
        )}
        {now !== '' && (
          <Box marginTop={1} flexDirection="column">
            <Text bold>⏳ Right now</Text>
            <Text>{now}</Text>
          </Box>
        )}
        {section('🙋 Waiting on you', b.waiting, 'yellow')}
        {section('✅ Done', b.done)}
        {section('🔜 Next', b.next)}
        {section('⚠️ Heads up', b.headsUp, 'red')}
        {isEmpty && (
          <Box marginTop={1}>
            <Text dimColor>This fills in as Claude works on your project.</Text>
          </Box>
        )}
        <Box marginTop={1}>
          <Text dimColor>Replies: {mode} · /technical or /plain to switch</Text>
        </Box>
      </Box>
    )
  })
}
