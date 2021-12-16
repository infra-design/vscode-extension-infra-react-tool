import ts = require('typescript')
import * as vscode from 'vscode'
import { AstModel } from './AstModel'

const hookDecorationType = vscode.window.createTextEditorDecorationType({
  cursor: 'pointer',
  opacity: '0.2',
})

export function hookDecoration(context: vscode.ExtensionContext) {
  let activeEditor = vscode.window.activeTextEditor
  let timeout: NodeJS.Timer | undefined = undefined

  function updateDecorations() {
    if (!activeEditor) {
      return
    }

    const astModel: AstModel = new AstModel()
    const decorations: vscode.DecorationOptions[] = []

    const cursorActivePosition = activeEditor.selection.active
    const { positionAt } = activeEditor?.document

    astModel.mapAllChildren().forEach(({ node, parent }) => {
      try {
        const blockStartPos = positionAt(parent.pos)
        const blockEndPos = positionAt(parent.end)
        const nodeName = node.escapedText.toString()
        const isUseMemo = nodeName === 'useMemo'
        const isUseEffect = nodeName === 'useEffect'

        if (!blockStartPos || !blockEndPos) {
          return
        }

        if (
          cursorActivePosition.isBefore(blockStartPos) ||
          cursorActivePosition.isAfter(blockEndPos)
        ) {
          const funcBody = parent.arguments[0] as ts.ArrowFunction
          const headerStartPos = positionAt(node.pos)
          const headerEndPos =
            isUseMemo || isUseEffect
              ? positionAt(funcBody.equalsGreaterThanToken.end)
              : positionAt(funcBody.pos)

          decorations.push({
            range: new vscode.Range(headerStartPos, headerEndPos),
            hoverMessage: 'hook',
          })

          const funcBodyEndPos = positionAt(funcBody.end)

          decorations.push({
            range: new vscode.Range(funcBodyEndPos, blockEndPos),
            hoverMessage: 'dependencies',
          })
        }
      } catch (e) {
        console.error(e)
      }
    })

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
