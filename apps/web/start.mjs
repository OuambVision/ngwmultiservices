import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const port = String(process.env.PORT || 3001)
const nextBin = createRequire(import.meta.url).resolve('next/dist/bin/next')
const child = spawn(process.execPath, [nextBin, 'start', '--hostname', '0.0.0.0', '--port', port], {
  stdio: 'inherit',
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 1)
})
