## Mailspring Unthreaded

A [Mailspring](https://getmailspring.com/) plugin that lets you view your inbox as individual messages instead of grouped threads. Switch between the classic threaded view and an unthreaded view with a single click — your preference is saved between sessions.

## What This Plugin Does

By default, Mailspring groups emails by conversation (thread). This plugin gives you an alternative **unthreaded** view where every individual message appears as its own item in the mail list, making it easier to process emails one at a time.

### Features

- **Toggle between views** — A "Switch to Unthreaded" / "Switch to Threaded" button appears at the top of the mail list. Click it to flip between modes at any time.
- **Individual message list** — In unthreaded mode, each email message is listed separately, sorted by date (newest first).
- **Thread grouping** — Messages that belong to the same thread are visually grouped together in the list. Threads with more than one message show a caret that lets you expand or collapse the group.
- **Single-message viewer** — When you click on a message, only that specific message is shown in the reading pane, without the other replies in the thread stacking below it.
- **Quoted-text expansion** — The selected message automatically expands any hidden quoted text so you can see the full content at a glance.
- **Persistent preference** — The enabled/disabled state is saved to `localStorage`, so your choice survives app restarts.
- **Non-destructive** — Disabling the plugin (or toggling back to threaded mode) fully restores Mailspring's original thread list and message viewer.

## Installation

1. Download or clone this repository.
2. Copy (or symlink) the folder into your Mailspring packages directory:
   - **macOS**: `~/Library/Application Support/Mailspring/packages/`
   - **Linux**: `~/.config/Mailspring/packages/`
   - **Windows**: `%APPDATA%\Mailspring\packages\`
3. Inside the plugin folder (`mailspring-unthreaded/`), run:
   ```bash
   npm install
   npm run build
   ```
4. Restart Mailspring (or reload the main window via the developer tools).

The `lib/` directory is already committed to this repository, so if you just want to use the plugin without building it yourself you can skip steps 3–4 and simply restart Mailspring after placing the folder.

## Building from Source

```bash
npm install
npm run build
```

This compiles the TypeScript/JSX source in `src/` into the `lib/` directory using the `tsc` compiler.

## Usage

After installation a **Switch to Unthreaded** button appears in the toolbar above your mail list. Click it to enter unthreaded mode. Click **Switch to Threaded** to return to Mailspring's default view.
