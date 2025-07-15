import fs from 'fs'
import path from 'path'

export interface ContractArtifact {
  contractName: string
  abi: any[]
  bytecode: string
  deployedBytecode: string
}

export class HardhatService {
  private static instance: HardhatService
  private artifactsPath: string

  constructor() {
    this.artifactsPath = path.join(process.cwd(), 'artifacts', 'contracts')
  }

  static getInstance(): HardhatService {
    if (!HardhatService.instance) {
      HardhatService.instance = new HardhatService()
    }
    return HardhatService.instance
  }

  async loadContractArtifact(contractName: string): Promise<ContractArtifact> {
    try {
      const artifactPath = path.join(this.artifactsPath, `${contractName}.sol`, `${contractName}.json`)
      
      if (!fs.existsSync(artifactPath)) {
        throw new Error(`Artifact not found for ${contractName}. Please compile contracts with 'npx hardhat compile'`)
      }

      const artifactData = JSON.parse(fs.readFileSync(artifactPath, 'utf8'))
      
      return {
        contractName,
        abi: artifactData.abi,
        bytecode: artifactData.bytecode,
        deployedBytecode: artifactData.deployedBytecode
      }
    } catch (error) {
      throw new Error(`Failed to load artifact for ${contractName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async isContractCompiled(contractName: string): Promise<boolean> {
    const artifactPath = path.join(this.artifactsPath, `${contractName}.sol`, `${contractName}.json`)
    return fs.existsSync(artifactPath)
  }

  async getAllCompiledContracts(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.artifactsPath)) {
        return []
      }

      const contracts: string[] = []
      const directories = fs.readdirSync(this.artifactsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

      for (const dir of directories) {
        const dirPath = path.join(this.artifactsPath, dir)
        const files = fs.readdirSync(dirPath)
        
        files.forEach(file => {
          if (file.endsWith('.json') && !file.includes('.dbg.')) {
            const contractName = file.replace('.json', '')
            contracts.push(contractName)
          }
        })
      }

      return contracts
    } catch (error) {
      console.error('Error reading compiled contracts:', error)
      return []
    }
  }

  async compileContracts(): Promise<void> {
    const { execSync } = require('child_process')
    
    try {
      execSync('npx hardhat compile', { 
        cwd: process.cwd(),
        stdio: 'pipe'
      })
    } catch (error) {
      throw new Error(`Contract compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}