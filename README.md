# Resizable Stream Preview

A [Vencord](https://vencord.dev) userplugin that lets you drag Discord's floating stream preview much bigger than Discord normally allows.

When you're in a voice call watching a stream and click over to another channel (say `#general`), Discord shows the stream in a small floating window. Discord caps how big you can make it, which is annoying when Discord is snapped to half your screen next to a browser. This plugin adds its own resize handles so the preview can grow up to almost the full width of the Discord window.

## Features

- Resize handles on the bottom-left and bottom-right corners of the preview (they show when you hover it).
- Keeps the 16:9 shape of the stream while you drag.
- Remembers your size, so the preview comes back at the same size next time.
- Double-click a handle to go back to Discord's default size.
- Setting for the largest size allowed (default: 95% of the Discord window width).

## Requirements

Vencord userplugins aren't in the Vencord installer, so you build Vencord yourself from source. You need:

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/) LTS (v18 or newer)
- [pnpm](https://pnpm.io/installation): after installing Node, run `npm install -g pnpm`
- The Discord desktop app

Useful links:

- Vencord website: https://vencord.dev (normal installer: https://vencord.dev/download)
- Vencord source: https://github.com/Vendicated/Vencord
- Official guide to installing from source: https://docs.vencord.dev/installing/
- Official guide to custom (user) plugins: https://docs.vencord.dev/installing/custom-plugins/
- Vencord Discord server (for help): https://vencord.dev/discord

## Install

1. **Clone Vencord** somewhere on your computer:

   ```sh
   git clone https://github.com/Vendicated/Vencord
   cd Vencord
   pnpm install --frozen-lockfile
   ```

2. **Add this plugin** to Vencord's `src/userplugins` folder (create the folder if it doesn't exist). The folder must end up as `Vencord/src/userplugins/resizableStreamPreview/index.tsx`.

   ```sh
   cd src
   mkdir userplugins
   cd userplugins
   git clone https://github.com/Eros-Byrne/vencord-resizable-plugin
   ```

   Then move or copy the `resizableStreamPreview` folder from inside `vencord-resizable-plugin` up into `src/userplugins/`. (Or just download this repo as a ZIP and copy the `resizableStreamPreview` folder in.)

3. **Build Vencord** (from the `Vencord` root folder):

   ```sh
   pnpm build
   ```

4. **Inject it into Discord** (only needed the first time):

   ```sh
   pnpm inject
   ```

   Pick your Discord install (Stable, PTB or Canary) when it asks. Then fully quit Discord (also from the system tray) and open it again.

5. **Turn the plugin on**: Discord Settings → Vencord → Plugins → search for **ResizableStreamPreview** → enable it.

## Usage

1. Join a voice channel and watch someone's stream.
2. Click over to a text channel. The floating preview appears.
3. Hover the preview and drag the little triangle in the bottom-left or bottom-right corner to resize it.
4. Double-click a triangle to reset to Discord's normal size.

Settings (Vencord → Plugins → ResizableStreamPreview → cog icon):

| Setting | What it does |
| --- | --- |
| Max width % | Largest width the preview can reach, as a % of the Discord window width. |
| Preview selector | Advanced. The CSS selector used to find Discord's preview window. Only change it if a Discord update breaks the plugin (see below). |

## Developing in VS Code

1. Open the whole `Vencord` folder in VS Code (not just the plugin folder), so imports like `@api/Settings` and `@utils/types` resolve and you get autocompletion.
2. Edit the files in `src/userplugins/resizableStreamPreview/`.
3. Run `pnpm watch` in VS Code's terminal. It rebuilds every time you save.
4. In Discord press `Ctrl+R` (`Cmd+R` on Mac) to reload with your changes.
5. Press `Ctrl+Shift+I` to open DevTools for errors and to inspect elements.

If you keep this repo cloned separately, you can link the plugin folder instead of copying it, so edits in your repo show up in Vencord right away:

- Windows (Command Prompt as admin): `mklink /D "C:\path\to\Vencord\src\userplugins\resizableStreamPreview" "C:\path\to\this-repo\resizableStreamPreview"`
- macOS / Linux: `ln -s /path/to/this-repo/resizableStreamPreview /path/to/Vencord/src/userplugins/resizableStreamPreview`

## Updating

From the `Vencord` folder:

```sh
git pull
pnpm install --frozen-lockfile
pnpm build
```

Then restart Discord. You don't need to run `pnpm inject` again unless Discord itself updated and Vencord disappeared.

## If it stops working

The plugin finds Discord's preview window by looking for an element whose class contains `pictureInPictureWindow`. Discord sometimes renames things in updates. If the handles stop showing up:

1. Open DevTools (`Ctrl+Shift+I`), click the element picker (top-left arrow) and click on the floating preview.
2. Find the outer element of the preview and look at its `class`. You'll see something like `pictureInPictureWindow_1a2b3c`.
3. Put the new name part in the **Preview selector** setting, for example `[class*="newClassName"]`, then restart Discord.

Known limits:

- Discord places the preview using its own idea of how big it is, so a very large preview may hang off the edge of the window. Drag the preview to move it back.
- Only the floating preview inside Discord is changed. Discord's pop-out stream window is a separate window and is already freely resizable.

## Licence

GPL-3.0-or-later, same as Vencord.
