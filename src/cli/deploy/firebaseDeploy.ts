import { DEFAULT_FUNCTION_NAME } from '@/index'
import { execSyncCmd } from '@/lib'
import { getExportedFunctions } from '@/lib/files/getExportedFunctions'
import inquirer from 'inquirer'

export const firebaseFunctionsDeploy = async (
  projectId: string,
  functionName: string = DEFAULT_FUNCTION_NAME,
  functionPath?: string | null,
) => {
  if (functionPath) {
    const shCmd = [
      'firebase',
      'deploy',
      '--only',
      functionPath,
      '-P',
      `${projectId}`,
    ]
    await execSyncCmd(shCmd)
    return
  }
  try {
    const path = `${process.cwd()}/functions/${functionName}/src/index.ts`
    const methods = getExportedFunctions(path)
    if (methods.length === 0) {
      throw new Error(
        `firebaseFunctionsDeploy: No exported functions found in ${path}`,
      )
    }
    const answer = await inquirer.prompt<{ functions: Array<string> }>([
      {
        type: 'checkbox',
        message: 'Select Functions to deploy',
        name: 'functions',
        choices: [new inquirer.Separator(' = Functions = '), ...methods],
        validate(answer) {
          if (answer.length < 1) {
            return 'You must choose at least one function.'
          }

          return true
        },
      },
    ])
    const functions = `functions:${functionName}:` + answer.functions.join(`,`)
    const shCmd = [
      'firebase',
      'deploy',
      '--only',
      functions,
      '-P',
      `${projectId}`,
    ]
    await execSyncCmd(shCmd)
  } catch (error) {
    throw new Error(`firebaseFunctionsDeploy: ${error}`)
  }
}
