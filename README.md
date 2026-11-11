# lid-awake

A Claude Code mod for macOS. `/awake` switches sleep on lid close off and on, so you stop typing `sudo pmset -a disablesleep 1`.

## Use

- `/awake` toggles the setting.
- `/awake on`, `/awake off`, `/awake status` set or show it.

After each change the mod reads `pmset -g` again and reports the state it finds. While awake is on, the status line shows `awake: lid close will not sleep`.

Awake applies on battery too. A closed laptop in a bag keeps running and gets hot, so switch it off when you are done.

## Install

At the prompt of a terminal session:

```
/plugin install lid-awake --marketplace charlottebepbop/lid-awake
```

Answer `y` to add the marketplace, then pick a scope.

From a shell:

```
claude plugin install lid-awake --marketplace charlottebepbop/lid-awake
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `charlottebepbop/lid-awake`, then Add plugin.

## One-time setup

`pmset -a disablesleep` needs root, and a mod cannot type a password. Add a sudoers rule that allows only these two commands without one. Replace `YOUR_USER` with the output of `whoami`:

```
echo 'YOUR_USER ALL=(root) NOPASSWD: /usr/bin/pmset -a disablesleep 0, /usr/bin/pmset -a disablesleep 1' > /tmp/lid-awake.sudoers
visudo -cf /tmp/lid-awake.sudoers
sudo install -m 0440 -o root -g wheel /tmp/lid-awake.sudoers /etc/sudoers.d/lid-awake
```

Until the rule exists, `/awake` changes nothing and prints a setup note.

If your terminal wraps `sudo` and adds `TERMINFO`, a hand-typed `sudo pmset -a disablesleep 1` fails after this. Use `/awake`, or `command sudo`.

## Remove

```
sudo rm /etc/sudoers.d/lid-awake
```

## Test

```
claude plugin test .
```
