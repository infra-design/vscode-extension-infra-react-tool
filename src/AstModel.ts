import * as ts from 'typescript'
import * as vscode from 'vscode'

export function syntaxKindToName(kind: ts.SyntaxKind) {
  return ts.SyntaxKind[kind]
}

export interface AstNode {
  name: string
  indexs: number[]
  kind: ts.SyntaxKind
  pos: number
  end: number
  isDirectory: boolean
}

export function getNodes(node: ts.Node) {
  const nodes: ts.Node[] = []
  ts.forEachChild(node, (cbNode) => {
    nodes.push(cbNode)
  })
  return nodes
}

export class AstModel {
  #sfile: ts.SourceFile = ts.createSourceFile(
    'ast.ts',
    ``,
    ts.ScriptTarget.Latest
  )
  constructor() {}

  #getAst() {
    const editor = vscode.window.activeTextEditor
    if (editor !== undefined) {
      this.#sfile = ts.createSourceFile(
        editor.document.uri.toString(),
        editor.document.getText(),
        ts.ScriptTarget.Latest
      )
    }
  }

  mapAllChildren() {
    this.#getAst()
    const list: {
      node: ts.Identifier
      parent: ts.CallExpression
    }[] = []

    function deep(node: ts.Node) {
      node.forEachChild((child) => {
        if (
          node.kind === ts.SyntaxKind.CallExpression &&
          child.kind === ts.SyntaxKind.Identifier
        ) {
          const { escapedText } = child as ts.Identifier

          if (
            escapedText === 'useMemo' ||
            escapedText === 'useCallback' ||
            escapedText === 'useEffect'
          ) {
            list.push({
              node: child as ts.Identifier,
              parent: node as ts.CallExpression,
            })
          }
        }

        deep(child)
      })
    }

    this.#sfile.forEachChild(deep)

    return list
  }
}
