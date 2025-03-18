'use client';

import Tooltip from '@/components/ui/Tooltip/Tooltip';
import { useTooltipStore } from '@/store/useTooltipStore';
import { useState } from 'react';

const SAMPLE_TEXTS = [
  '짧은 텍스트',
  '이것은 조금 더 긴 텍스트입니다. 한 줄 정도 되는 길이입니다.',
  '이것은 매우 긴 텍스트입니다. 여러 줄에 걸쳐 표시될 수 있으며, 말줄임표가 필요한 길이입니다. 실제로는 더 긴 텍스트가 들어갈 수 있습니다.',
  'English text with special characters: !@#$%^&*()',
  '한글과 English가 혼합된 텍스트 with special chars: 가나다 ABC 123',
  '이모지가 포함된 텍스트 😊 🎉 🌟 와 한글과 English mixed',
  '1234',
  '가나다라',
  'abcd',
  'ABCD',
  'asdasdasd',
];

export default function TooltipTest() {
  const { showInfo, position, setShowInfo, setPosition } = useTooltipStore();
  const [ width, setWidth ] = useState<'fixed' | 'responsive'>('fixed');

  return (
    <div className="p-8">
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={ showInfo }
              onChange={ (e) => setShowInfo(e.target.checked) }
            />
            Show Text Info
          </label>
          <select
            value={ position }
            onChange={ (e) => setPosition(e.target.value as any) }
            className="border p-1 rounded"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
          <select
            value={ width }
            onChange={ (e) => setWidth(e.target.value as any) }
            className="border p-1 rounded"
          >
            <option value="fixed">Fixed Width</option>
            <option value="responsive">Responsive Width</option>
          </select>
        </div>
      </div>

      <div className={ `grid gap-4 ${ width === 'fixed' ? 'w-64' : 'w-full' }` }>
        { SAMPLE_TEXTS.map((text, index) => (
          <div
            key={ index }
            className="border p-4 rounded-lg bg-white shadow-sm"
          >
            <Tooltip
              content={ text }
              position={ position }
              showInfo={ showInfo }
            >
              <div className="truncate">
                { text }
              </div>
            </Tooltip>
          </div>
        )) }
      </div>

      <h2 className="text-xl font-bold mt-12 mb-6">절대 자릿수로 점표기 후 툴팁처리</h2>

      <div className="space-y-8">
        { /* 각 측정 방식별 섹션 */ }

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Array.from()방식</h3>
          <div className="grid gap-4">
            { SAMPLE_TEXTS.map((text, index) => {
              const getLength = (str: string) => Array.from(str).length;
              const truncateText = (str: string, maxLength: number) => {
                const length = getLength(str);
                if (length <= maxLength) return str;
                return Array.from(str).slice(0, maxLength).join('') + '...';
              };
              const maxLength = 10; // 최대 표시 길이
              const truncated = truncateText(text, maxLength);
              const actualLength = getLength(text);

              return (
                <div key={ index } className="flex items-center gap-4 border p-4 rounded-lg bg-white">
                  <div className="flex-1">
                    <Tooltip
                      content={ `${ text }\n\n실제 길이: ${ actualLength }` }
                      position={ position }
                      showInfo={ showInfo }
                    >
                      <div className="font-mono">
                        { truncated }
                        <span className="ml-2 text-xs text-gray-500">
                          (길이: { actualLength })
                        </span>
                      </div>
                    </Tooltip>
                  </div>
                </div>
              );
            }) }
          </div>
        </div>

      </div>
    </div>
  );
}
