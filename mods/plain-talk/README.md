# plain-talk

A Claude Code mod for people who aren't developers. Claude explains coding work in plain language and ends each reply with short sections: **✅ Done**, **🔜 Next**, **🙋 Waiting on you** and **⚠️ Heads up**.

You can still see the technical side when you want it:

- Say "technical details" in any message to get the full technical explanation once.
- Type `/technical` to add a 🔧 Technical details section to every reply, and `/plain` to switch back.

## Install

```
/plugin install plain-talk --marketplace vimalcherangattu/TaskHub
```

Answer `y` to add the marketplace, then pick a scope.

To switch it on for everyone working in a project, add this to the project's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "vimal-mods": { "source": { "source": "github", "repo": "vimalcherangattu/TaskHub" } }
  },
  "enabledPlugins": { "plain-talk@vimal-mods": true }
}
```

## Side panel

A **Project status** panel opens beside the chat (type `/project` to reopen it). It shows:

- the project, where it stands, and a progress bar for work with several steps
- what Claude is doing right now
- **Waiting on you**, including any question Claude has asked; the count also shows in the status line, and new items send a notification
- **Big moves** this session: publishing live, deleting, overwriting, spending money or sending messages, named in plain words as they happen
- **Where to look** (links to the live site, a preview or the change) and **How to check it yourself**
- Done, Next and Heads up
- **From last time**: what the project's `STATUS.md` says, until Claude fills the panel in
- **Words explained**: technical words with a one-line meaning, kept per project
- buttons: **Explain simpler**, **Technical details**, **What should I test?**, **Wrap up**

If Claude changes things and forgets to update the panel, the mod reminds it on the next turn.

## Developing

`claude plugin validate mods/plain-talk` and `claude plugin test mods/plain-talk`. Bump `version` in `.claude-plugin/plugin.json` with every change.
