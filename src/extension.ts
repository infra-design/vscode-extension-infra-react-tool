import * as vscode from 'vscode'
import { languages } from 'vscode'
import { CodelensProvider } from './CodelensProvider'
import { hookDecoration } from './hookDecoration'

export function activate(context: vscode.ExtensionContext) {
  languages.registerCodeLensProvider('*', new CodelensProvider('useMemo'))
  languages.registerCodeLensProvider('*', new CodelensProvider('useEffect'))
  languages.registerCodeLensProvider('*', new CodelensProvider('useCallback'))
  hookDecoration(context)
}
