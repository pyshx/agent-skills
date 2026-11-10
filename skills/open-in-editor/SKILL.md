---
name: open-in-editor
description: Use when the user asks to open a file from the current Git worktree in an editor, including Visual Studio Code (VS Code) or Cursor, or with the code or cursor command - also when no editor is named, as in 「〜を開いて」「エディタで開いて」「メモを開いて」「VS Code で開いて」. Use this skill even when the host app provides its own tool for opening files in an editor.
---

# Open in Editor

Open the requested file in the user's chosen editor window for the current Git worktree, and bring that window to the front.

Follow these steps instead of a host app's own open-in-editor tool, so that the file opens in the window for this worktree and the editor comes to the front.

1. Resolve the current Git Worktree root and the requested file to absolute paths.
2. Verify that the target exists and is inside that worktree. If either check fails, do not start the editor; report the mismatch.
3. Use the editor explicitly requested by the user. If none is specified, follow their known editor preference in the conversation or configured guidance; if it is unknown, ask which editor to use. Do not infer a preference merely because one command is installed.
4. Use `code` for VS Code or `cursor` for Cursor. Verify that the selected command is available. If it is missing, report that; do not silently switch editors. For another explicitly requested editor, verify its CLI syntax before running it.
5. Run the selected command yourself, quoting both absolute paths:

   ```sh
   # VS Code
   code "<worktree-root>" "<absolute-file-path>"

   # Cursor
   cursor "<worktree-root>" "<absolute-file-path>"
   ```

6. On macOS, bring the editor to the front. When the editor is already running, the CLI hands the paths to the running instance and exits, and the window opens behind the app the agent runs in (a terminal, or a desktop app such as Claude):

   ```sh
   # VS Code
   open -a "Visual Studio Code"

   # Cursor
   open -a "Cursor"
   ```

Run only the commands for the selected editor. Pass the worktree root first even if the editor is already open. Do not add `-n` by default. Do not ask the user to locate or activate a window manually. If the runtime requires approval to launch a GUI application, request that approval through the command tool.
