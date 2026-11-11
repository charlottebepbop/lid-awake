export type Awake = boolean | undefined

export const SUDOERS_PATH = '/etc/sudoers.d/lid-awake'

export const parseAwake = (pmsetOutput: string): Awake => {
  const found = /SleepDisabled\s+([01])/.exec(pmsetOutput)

  return found ? found[1] === '1' : undefined
}

export type Wanted = { set: boolean } | { show: true } | { unknown: string }

export const wantedFrom = (args: string, now: Awake): Wanted => {
  const word = args.trim().toLowerCase()

  if (word === 'on') return { set: true }
  if (word === 'off') return { set: false }
  if (word === 'status') return { show: true }
  if (word === '') return now === undefined ? { show: true } : { set: !now }

  return { unknown: word }
}

export const describe = (now: Awake): string => {
  if (now === undefined) return 'Could not read SleepDisabled from pmset -g.'

  return now
    ? 'Awake is ON. The Mac stays awake with the lid closed, on battery too.'
    : 'Awake is OFF. The Mac sleeps on lid close.'
}

export const SETUP = [
  'sudo asked for a password, so nothing changed.',
  `One-time setup: install the sudoers rule at ${SUDOERS_PATH}.`,
  'It allows only "pmset -a disablesleep 0" and "pmset -a disablesleep 1" without a password.',
].join('\n')
