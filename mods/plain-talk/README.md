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

A **Project status** panel opens beside the chat: the project, where it stands, what Claude is doing right now, what's waiting on you, what's done, what's next, and any heads-up. Type `/project` to reopen it.
