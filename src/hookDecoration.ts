import * as vscode from 'vscode'

const hookDecorationType = vscode.window.createTextEditorDecorationType({
  cursor: 'pointer',
  opacity: '0.13',
})

export function hookDecoration(context: vscode.ExtensionContext) {
  let activeEditor = vscode.window.activeTextEditor
  let timeout: NodeJS.Timer | undefined = undefined

  function updateDecorations() {
    if (!activeEditor) {
      return
    }

    const hookRegEx =
      /((useMemo(<.+>)?\(\(\) =>))|(useCallback\()|(useEffect\(\(\) =>)/g
    const endRegEx = /,.?\[(.|\n)*?\]\)/g

    const text = activeEditor.document.getText()

    const decorations: vscode.DecorationOptions[] = []

    // get the cursor position
    const cursorActivePosition = activeEditor.selection.active

    let match
    let matchEnd
    while ((match = hookRegEx.exec(text)) && (matchEnd = endRegEx.exec(text))) {
      if (match && matchEnd) {
        const startPos = activeEditor.document.positionAt(match.index)
        const endPos = activeEditor.document.positionAt(
          match.index + match[0].length
        )

        const startPosEnd = activeEditor.document.positionAt(matchEnd.index)
        const endPosEnd = activeEditor.document.positionAt(
          matchEnd.index + matchEnd[0].length
        )

        // if the cursor is inside the decoration, update the decoration
        if (
          cursorActivePosition.isBefore(startPos) ||
          cursorActivePosition.isAfter(endPosEnd)
        ) {
          decorations.push({
            range: new vscode.Range(startPos, endPos),
            hoverMessage: 'react hook',
          })

          decorations.push({
            range: new vscode.Range(startPosEnd, endPosEnd),
            hoverMessage: 'dependencies',
          })
        }
      }
    }

    activeEditor.setDecorations(hookDecorationType, decorations)
  }

  function triggerUpdateDecorations(throttle = false) {
    if (timeout) {
      clearTimeout(timeout)
      timeout = undefined
    }
    if (throttle) {
      timeout = setTimeout(updateDecorations, 500)
    } else {
      updateDecorations()
    }
  }

  if (activeEditor) {
    triggerUpdateDecorations()
  }

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor
      if (editor) {
        triggerUpdateDecorations()
      }
    },
    null,
    context.subscriptions
  )

  vscode.window.onDidChangeTextEditorSelection(
    (editor) => {
      if (editor) {
        triggerUpdateDecorations()
      }
    },
    null,
    context.subscriptions
  )

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations(true)
      }
    },
    null,
    context.subscriptions
  )
}
