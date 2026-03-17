import PaidCoinFilledIcon from '@/src/shared/ui/icons/PaidCoinFilledIcon'
import PlayIcon2 from '@/src/shared/ui/icons/PlayIcon2'
import { countOneVoiceSegment } from '@/src/shared/lib/utils/ttsCost'
import { cn } from '@/src/shared/lib/utils/cn'

const WAVEFORM_HEIGHTS = [
  10, 10, 20, 30, 20, 10, 10, 5, 10, 20, 10, 30, 25, 10, 10, 5, 10, 20, 25, 10, 5, 5, 10, 20, 30, 20, 25, 10, 10, 5,
]
const BAR_WIDTH = 2
const GAP_WIDTH = 2
const MAX_HEIGHT = 30
const WAVEFORM_WIDTH = WAVEFORM_HEIGHTS.length * BAR_WIDTH + (WAVEFORM_HEIGHTS.length - 1) * GAP_WIDTH

const generateWaveformMask = () => {
  const rects = WAVEFORM_HEIGHTS.map((height, idx) => {
    const x = idx * (BAR_WIDTH + GAP_WIDTH)
    const y = (MAX_HEIGHT - height) / 2
    return `<rect x="${x}" y="${y}" width="${BAR_WIDTH}" height="${height}" rx="1" fill="white"/>`
  }).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WAVEFORM_WIDTH}" height="${MAX_HEIGHT}">${rects}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

const WAVEFORM_MASK = generateWaveformMask()

interface VoiceBubbleProps {
  text: string
  className?: string
}

export default function VoiceBubble({ text, className }: VoiceBubbleProps) {
  const penCost = Math.ceil(countOneVoiceSegment(text) / 10) || 0

  return (
    <div className={cn('flex w-fit items-center gap-x-1.5 rounded-xl bg-v2-gray-100 py-2 pl-2 pr-3', className)}>
      <PlayIcon2 size={24} className="shrink-0 text-black" />
      <div
        className="flex"
        style={{
          width: `${WAVEFORM_WIDTH}px`,
          height: `${MAX_HEIGHT}px`,
          maskImage: WAVEFORM_MASK,
          WebkitMaskImage: WAVEFORM_MASK,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
        }}
      >
        <div className="h-full flex-1 bg-gray-300" />
      </div>
      <div className="ml-1 flex shrink-0 items-center gap-x-[1px] rounded-full bg-white px-[5px] py-0.5">
        <PaidCoinFilledIcon className="h-[13px] w-[13px] text-black" />
        <span className="text-xs font-medium text-black">{penCost}</span>
      </div>
    </div>
  )
}
