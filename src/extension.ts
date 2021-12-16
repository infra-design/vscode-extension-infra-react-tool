import * as vscode from 'vscode'
import { languages } from 'vscode'
import { CodelensProvider } from './CodelensProvider'
import { hookDecoration } from './hookDecoration'

const { registerCodeLensProvider } = languages

const types = ['typescriptreact', 'javascriptreact', 'typescript', 'javascript']
const hooks = ['useMemo', 'useCallback', 'useEffect']

export function activate(context: vscode.ExtensionContext) {
  types.forEach((type) => {
    hooks.forEach((hook) => {
      registerCodeLensProvider(type, new CodelensProvider(hook))
    })
  })

  hookDecoration(context)
}
