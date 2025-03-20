import type { AxiosResponse } from 'axios'
import axios, { AxiosError } from 'axios'

const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

// Figma 관련 타입 정의
interface FigmaConfig {
  ACCESS_TOKEN: string
  FILE_ID: string
}

interface CaptureConfig {
  scale?: number
  format?: 'png' | 'jpg' | 'svg' | 'pdf'
}

interface FigmaNode {
  id: string
  name: string
  type: string
  children?: Array<FigmaNode>
  characters?: string
}

interface FigmaFile {
  name: string
  document: FigmaNode
}

interface FigmaImageResponse {
  err: null | string
  images: {
    [key: string]: string
  }
}

type CaptureConfigs = {
  [key: string]: CaptureConfig
}

// 환경 설정
dotenv.config({
  path: path.resolve(__dirname, '../../.env.local'),
})

const config: FigmaConfig = {
  //피그마 api 어세스 토큰
  ACCESS_TOKEN: process.env.FIGMA_ACCESS_TOKEN || 'figd_6luYk2sV6lhXrRV8KdYtsNg3ixtfyB6H_XD1IXt1',
  //url 프로젝트 명
  FILE_ID: process.env.FIGMA_FILE_ID || 'Sw4S3tPnieDqxUxWZKpzAw',
}

const CAPTURE_CONFIG: CaptureConfigs = {
  Home: { scale: 1, format: 'png' },
  Chat_main: { scale: 1, format: 'png' },
  MyCharacter_Create: { scale: 1, format: 'png' },
  Chat_list: { scale: 1, format: 'png' },
  Home_Login_popup1: { scale: 1, format: 'png' },
  Setting: { scale: 1, format: 'png' },
  MyCharacter_home: { scale: 1, format: 'png' },
  MyCharacter_Create_Detail: { scale: 1, format: 'png' },
  MyCharacter_Create_Image: { scale: 1, format: 'png' },
  My_home: { scale: 1, format: 'png' },
}

// 환경 변수 검증 함수
function validateConfig(): void {
  if (!process.env.FIGMA_ACCESS_TOKEN) {
    throw new Error('FIGMA_ACCESS_TOKEN이 설정되지 않았습니다. .env 파일을 확인해주세요.')
  }
  if (!process.env.FIGMA_FILE_ID) {
    throw new Error('FIGMA_FILE_ID가 설정되지 않았습니다. .env 파일을 확인해주세요.')
  }
}

// 파일 이름 안전성 검증
function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^\w가-힣-]/g, '_')
}

// axios 인스턴스 생성 (타입 지정을 위해)
const axiosInstance = axios.create({
  timeout: 15000,
})

// 이미지 다운로드 함수
async function downloadImage(url: string, fileName: string): Promise<string | null> {
  try {
    const sanitizedFileName = sanitizeFileName(fileName)
    const response: AxiosResponse<Buffer> = await axiosInstance({
      url,
      responseType: 'arraybuffer',
      timeout: 10000,
    })

    const imgDir = 'docs/figma_img'
    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir, { recursive: true })
    }

    const filePath = `${imgDir}/${sanitizedFileName}.png`
    fs.writeFileSync(filePath, response.data)
    console.log(`이미지 저장 완료: ${filePath}`)
    return filePath
  } catch (error) {
    console.error('이미지 다운로드 중 오류:', error instanceof Error ? error.message : String(error))
    return null
  }
}

async function captureScreenshot(nodeId: string, captureConfig: CaptureConfig): Promise<string> {
  try {
    const response: AxiosResponse<FigmaImageResponse> = await axiosInstance.get(
      `https://api.figma.com/v1/images/${config.FILE_ID}`,
      {
        headers: { 'X-Figma-Token': config.ACCESS_TOKEN },
        params: {
          ids: nodeId,
          format: captureConfig.format || 'png',
          scale: captureConfig.scale || 2,
        },
      }
    )

    const imageUrl = response.data.images[nodeId]
    if (!imageUrl) {
      throw new Error('이미지를 생성할 수 없습니다.')
    }

    const fileName = `${nodeId.replace(/[^a-z0-9]/gi, '_')}`
    const savedPath = await downloadImage(imageUrl, fileName)

    return `\n![${nodeId}](${imageUrl})\n${savedPath ? `Local file: ${savedPath}\n` : ''}`
  } catch (error) {
    console.error('스크린샷 캡처 중 오류:', error)
    return ''
  }
}

async function traverse(
  node: FigmaNode,
  depth: number,
  markdown: string,
  targetName: string | null = null
): Promise<string> {
  if (targetName && node.name === targetName) {
    return traverseNode(node, depth, '')
  }

  if (targetName) {
    const result = ''
    if (node.children) {
      for (const child of node.children) {
        const childResult = await traverse(child, depth + 1, '', targetName)
        if (childResult) {
          return childResult
        }
      }
    }
    return result
  }

  return traverseNode(node, depth, markdown)
}

async function traverseNode(node: FigmaNode, depth: number, markdown: string): Promise<string> {
  let result = markdown + `${'\t'.repeat(depth)}- ${node.name}\n`

  if (node.type === 'TEXT' && node.characters) {
    const lines = node.characters.split('\n')
    lines.forEach(line => {
      if (line.trim()) {
        result += `${'\t'.repeat(depth + 1)}• ${line.trim()}\n`
      }
    })
  }

  if (CAPTURE_CONFIG[node.name]) {
    const screenshotMd = await captureScreenshot(node.id, CAPTURE_CONFIG[node.name])
    if (screenshotMd) {
      result += `${'\t'.repeat(depth)}${screenshotMd}`
    }
  }

  if (node.children) {
    for (const child of node.children) {
      result = await traverseNode(child, depth + 1, result)
    }
  }

  return result
}

function getUniqueFileName(basePath: string, baseName: string): string {
  return baseName
}

async function getFigmaFile(targetName: string | null = null): Promise<string> {
  try {
    validateConfig()
    console.log('Figma API 호출 시작...')

    const response: AxiosResponse<FigmaFile> = await axiosInstance.get(
      `https://api.figma.com/v1/files/${config.FILE_ID}`,
      {
        headers: {
          'X-Figma-Token': config.ACCESS_TOKEN,
        },
        timeout: 15000,
      }
    )

    const file = response.data
    console.log('Figma 파일 데이터 받음:', file.name)

    const markdown = await traverse(file.document, 0, '', targetName)
    console.log('마크다운 생성 완료')

    if (!fs.existsSync('docs')) {
      fs.mkdirSync('docs', { recursive: true })
    }

    const normalizedMarkdown = markdown.replace(/\n/g, '\r\n')

    const baseFileName = targetName ? `figma-${sanitizeFileName(targetName)}` : 'figma-structure'
    const filePath = `docs/${baseFileName}.md`

    if (fs.existsSync(filePath)) {
      const backupPath = `${filePath}.backup`
      fs.writeFileSync(backupPath, fs.readFileSync(filePath))
      console.log(`기존 파일 백업 완료: ${backupPath}`)
    }

    fs.writeFileSync(filePath, normalizedMarkdown, { encoding: 'utf8' })
    console.log(`마크다운 파일이 생성되었습니다!: ${filePath}`)

    return filePath
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        console.error('Figma 파일을 찾을 수 없습니다. FILE_ID를 확인해주세요.')
      } else if (error.response?.status === 403) {
        console.error('접근 권한이 없습니다. ACCESS_TOKEN을 확인해주세요.')
      }
    }
    console.error('에러 발생:', error instanceof Error ? error.message : String(error))
    throw error
  }
}

function getUserInput(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise<string>(resolve => {
    rl.question(question, (answer: string) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

// CLI 실행 코드
if (require.main === module) {
  console.log('Figma 내보내기 시작...')

  getUserInput('추출할 부분을 입력해주세요 (전체 추출은 엔터) : ')
    .then(targetName => {
      const sanitizedTarget = targetName ? sanitizeFileName(targetName) : null
      return getFigmaFile(sanitizedTarget)
    })
    .then(filePath => {
      console.log('=================================')
      console.log('피그마 구조 추출이 완료되었습니다.')
      console.log(`생성된 파일: ${filePath}`)
      console.log('=================================')
    })
    .catch(error => {
      console.error('치명적인 오류 발생:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    })
}

module.exports = {
  getFigmaFile,
  getUserInput,
}
