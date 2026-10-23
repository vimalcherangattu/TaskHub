import { expect, test } from 'claude-code/testing'

import { bigMove, readStatus } from './register'

const PANE = {
  plugin: 'plain-talk',
  component: 'Pane',
  requestId: 'project-status',
  props: {
    title: 'Project status',
    isFocused: false,
    bodyColumns: 40,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 60 },
    view: {},
  },
} as const

const PANEL = 'mcp__plain-talk__update_panel'

// Stands for the engine beneath the mod: commands, the store, files, toasts.
function engine(on: Parameters<Parameters<typeof test>[1]>[1]) {
  const store = new Map<string, unknown>()
  on('command.register', (_, e) => ({ value: { command: e.name } }))
  on('tool.register', (_, e) => ({ value: { tool: `mcp__plain-talk__${e.name}` } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.root', () => ({ value: '/repo' }))
  on('fs.read', () => ({ value: '' }))
  on('store.get', (_, e) => ({ value: store.get(e.key) }))
  on('store.set', (_, e) => {
    store.set(e.key, e.value)

    return { value: undefined }
  })
  on('ui.status', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))
  on('ui.notify', () => ({ value: { isSent: true, channel: 'terminal_bell' } }))
}

test('the panel shows what Claude sends, on every surface', async ($, on) => {
  engine(on)
  on('tool.call', () => ({ result: {} }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.tool.call({
    tool: PANEL,
    project: 'School Stories',
    stage: 'Pricing is live',
    waiting: ['Approve the new price on Razorpay'],
    links: [{ label: 'Live site', url: 'https://example.com' }],
    check: ['Open the pricing page'],
    progress: { done: 3, total: 5, label: 'reel editor' },
    words: [{ term: 'branch', meaning: 'a separate copy of the project' }],
  })

  for (const surface of ['terminal', 'desktop', 'vscode', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect((await ui.find({ type: 'Text', text: /Pricing is live/ }))?.text).toBe('Pricing is live')
    expect(await ui.find({ type: 'Text', text: /Approve the new price/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /3 of 5 · reel editor/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Open the pricing page/ })).toBeDefined()
    await ui.unmount()
  }
})

test('a button asks Claude as if the person typed it', async ($, on) => {
  const sent: string[] = []
  engine(on)
  on('prompt.submit', (_, e) => {
    sent.push(e.text)

    return { text: e.text }
  })

  await $.session.start({ cwd: '/', surface: 'mobile', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'mobile' })
  await ui.press({ key: 'test' })
  expect(sent.some(text => /check or test/.test(text))).toBe(true)
  await ui.unmount()
})

test('STATUS.md fills "From last time"', () => {
  const md = '# Status\n\n## Current state\n- **Pricing** is live\n- Reel editor fits a phone\n\n## Next step\n- See `fyule` tasks\n'
  expect(readStatus(md)).toEqual({
    stage: ['Pricing is live', 'Reel editor fits a phone'],
    next: ['See fyule tasks'],
  })
  expect(readStatus('nothing here')).toBe(null)
})

test('big moves are named in plain words', () => {
  expect(bigMove('Bash', { command: 'git push -u origin main' })).toMatch(/main version/)
  expect(bigMove('Bash', { command: 'git status' })).toBe(undefined)
  expect(bigMove('mcp__github__merge_pull_request', {})).toMatch(/Merging/)
  expect(bigMove('mcp__Vercel__buy_domain', {})).toBe('Spending money')
  expect(bigMove('mcp__plain-talk__update_panel', {})).toBe(undefined)
})

test('words open and close, and a question waits on the person', async ($, on) => {
  engine(on)
  on('tool.call', ($, e) => {
    return e.tool === 'AskUserQuestion' ? { result: { answers: {} } } : { result: {} }
  })

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.tool.call({ tool: PANEL, words: [{ term: 'deploy', meaning: 'putting it live' }] })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /putting it live/ })).toBe(undefined)
  await ui.press({ key: 'words' })
  expect(await ui.find({ type: 'Text', text: /putting it live/ })).toBeDefined()
  await ui.unmount()

  await $.tool.call({
    tool: 'AskUserQuestion',
    questions: [{ question: 'Public or private?', header: 'Visibility', multiSelect: false, options: [] }],
  })
  const after = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await after.find({ type: 'Text', text: /Public or private/ })).toBe(undefined)
  await after.unmount()
})

test('a new session opens with the panel from last time', async ($, on) => {
  engine(on)
  on('tool.call', () => ({ result: {} }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.tool.call({ tool: PANEL, stage: 'Halfway through pricing' })
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ type: 'Text', text: /Halfway through pricing/ })).toBeDefined()
  await ui.unmount()
})
