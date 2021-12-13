import * as vscode from 'vscode'

/**
 * CodelensProvider
 */
export class CodelensProvider implements vscode.CodeLensProvider {
  private codeLenses: vscode.CodeLens[] = []
  private regex: RegExp
  private hookType = 'useMemo'
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>()
  public readonly onDidChangeCodeLenses: vscode.Event<void> =
    this._onDidChangeCodeLenses.event

  constructor(hookType: string) {
    this.hookType = hookType
    this.regex = new RegExp(hookType + '(\\(|\\<)', 'g')

    vscode.workspace.onDidChangeConfiguration((_) => {
      this._onDidChangeCodeLenses.fire()
    })
  }

  public provideCodeLenses(
    document: vscode.TextDocument
  ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    if (
      vscode.workspace
        .getConfiguration('codelens-sample')
        .get('enableCodeLens', true)
    ) {
      this.codeLenses = []
      const regex = new RegExp(this.regex)
      const text = document.getText()
      let matches
      while ((matches = regex.exec(text)) !== null) {
        const line = document.lineAt(document.positionAt(matches.index).line)
        const indexOf = line.text.indexOf(matches[0])
        const position = new vscode.Position(line.lineNumber, indexOf)
        const range = document.getWordRangeAtPosition(
          position,
          new RegExp(this.regex)
        )
        if (range) {
          this.codeLenses.push(new vscode.CodeLens(range))
        }
      }
      return this.codeLenses
    }
    return []
  }

  public resolveCodeLens(codeLens: vscode.CodeLens) {
    if (
      vscode.workspace
        .getConfiguration('codelens-sample')
        .get('enableCodeLens', true)
    ) {
      codeLens.command = {
        title: this.hookType,
        tooltip: this.hookType,
        command: 'codelens-sample.codelensAction',
        arguments: ['Argument 1', false],
      }
      return codeLens
    }
    return null
  }
}
