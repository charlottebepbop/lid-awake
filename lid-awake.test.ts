import { describe as group, expect, test } from 'claude-code/testing'

import { describe, parseAwake, wantedFrom } from './hooks/lib'

const out = (flag: string) => ({
  exitCode: 0, stdout: ` SleepDisabled\t\t${flag}\n sleep 1\n`, stderr: '',
  isStdoutTruncated: false, isStderrTruncated: false,
})

group('parseAwake', () => {
  test('reads the flag', () => {
    expect(parseAwake(out('1').stdout)).toBe(true)
    expect(parseAwake(out('0').stdout)).toBe(false)
    expect(parseAwake('sleep 1')).toBeUndefined()
  })
})

group('wantedFrom', () => {
  test('no argument toggles', () => {
    expect(wantedFrom('', false)).toEqual({ set: true })
    expect(wantedFrom('', true)).toEqual({ set: false })
    expect(wantedFrom('', undefined)).toEqual({ show: true })
  })
  test('words', () => {
    expect(wantedFrom(' ON ', true)).toEqual({ set: true })
    expect(wantedFrom('off', true)).toEqual({ set: false })
    expect(wantedFrom('status', true)).toEqual({ show: true })
    expect(wantedFrom('nope', true)).toEqual({ unknown: 'nope' })
  })
})

test('/awake on runs sudo pmset and reports the state it re-read', async ($, on) => {
  let flag = '0'
  const calls: string[] = []
  on('command.register', () => ({ value: { command: 'awake' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('process.run', (_, e) => {
    calls.push(e.argv.join(' '))
    if (e.argv[0] === '/usr/bin/sudo') flag = String(e.argv.at(-1))

    return { value: out(flag) }
  })

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  const ran = await $.command.run({ command: 'awake', args: 'on' })

  expect(calls).toContain('/usr/bin/sudo -n /usr/bin/pmset -a disablesleep 1')
  expect(ran.text).toBe(describe(true))
})

test('a sudo password prompt gives the setup text and changes nothing', async ($, on) => {
  on('command.register', () => ({ value: { command: 'awake' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('process.run', (_, e) => ({
    value: e.argv[0] === '/usr/bin/sudo'
      ? { ...out('0'), exitCode: 1, stdout: '', stderr: 'sudo: a password is required' }
      : out('0'),
  }))

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  const ran = await $.command.run({ command: 'awake', args: 'on' })

  expect(ran.text).toMatch(/One-time setup/)
})
