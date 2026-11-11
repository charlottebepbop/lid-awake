import type { EngineInterface, Register } from 'claude-code'

import { SETUP, describe, parseAwake, wantedFrom } from './lib'
import type { Awake } from './lib'

const PMSET = '/usr/bin/pmset'
const STATUS = 'awake: lid close will not sleep'

async function readAwake($: EngineInterface): Promise<Awake> {
  const got = await $.process.run([PMSET, '-g'])
  const now = got.exitCode === 0 ? parseAwake(got.stdout) : undefined
  $.ui.status(now ? STATUS : undefined)

  return now
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'awake',
      description: 'Switch sleep on lid close: /awake toggles, or on | off | status',
    })
    void readAwake($).catch(() => undefined)

    return next(e)
  })

  // Another session can flip the setting, so the status line is re-read here.
  on('prompt.submit', ($, e, next) => {
    void readAwake($).catch(() => undefined)

    return next(e)
  })

  on('command.run', { command: 'awake' }, async ($, e) => {
    const wanted = wantedFrom(e.args, await readAwake($))

    if ('unknown' in wanted) {
      return { text: `Unknown option "${wanted.unknown}". Use /awake, /awake on, /awake off or /awake status.` }
    }
    if ('show' in wanted) return { text: describe(await readAwake($)) }

    const ran = await $.process.run([
      '/usr/bin/sudo', '-n', PMSET, '-a', 'disablesleep', wanted.set ? '1' : '0',
    ])
    const now = await readAwake($)

    if (now === wanted.set) return { text: describe(now) }
    if (/password/i.test(ran.stderr)) return { text: SETUP }

    return { text: `pmset failed (exit ${ran.exitCode}): ${ran.stderr.trim()}\n${describe(now)}` }
  })
}
