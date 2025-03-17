import { create } from 'zustand'
import { createChart, IChartApi, ISeriesApi, Time } from 'lightweight-charts'
import { ChartCandle } from '@/services/defineType/bithumb'

interface ChartStore {
  chart: IChartApi | null
  series: ISeriesApi<'Candlestick'> | null
  volumeSeries: ISeriesApi<'Histogram'> | null
  isInitChart: boolean
  initChart: (container: HTMLDivElement) => void
  setChartData: (data: ChartCandle[]) => void
  updateChartData: (data: ChartCandle) => void
  resizeChart: (width: number) => void
  cleanup: () => void
}

export const useChartStore = create<ChartStore>((set, get) => ({
  chart: null,
  series: null,
  volumeSeries: null,
  isInitChart: false,

  initChart: (container: HTMLDivElement) => {
    const chart = createChart(container, {
      layout: {
        background: { color: '#F7F5FF' },
        textColor: '#787B86',
      },
      grid: {
        vertLines: { color: '#E1E5EA30' },
        horzLines: { color: '#E1E5EA30' },
      },
      rightPriceScale: {
        borderColor: '#E1E5EA30',
      },
      timeScale: {
        borderColor: '#E1E5EA30',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: '#787B86',
          labelBackgroundColor: '#787B86',
        },
        horzLine: {
          color: '#787B86',
          labelBackgroundColor: '#787B86',
        },
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
    })

    // 캔들스틱 시리즈 추가
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })

    // 거래량 시리즈 추가
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // 별도의 축 사용하지 않음
      scaleMargins: {
        top: 0.8, // 메인 차트 아래에 표시
        bottom: 0,
      },
    })

    set({ 
      chart, 
      series: candlestickSeries,
      volumeSeries,
      isInitChart: true 
    })
  },

  setChartData: (data: ChartCandle[]) => {
    const { series, volumeSeries } = get()
    if (!series || !volumeSeries) return

    // 캔들스틱 데이터 설정
    series.setData(data.map(candle => ({
      time: candle.time as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    })))

    // 거래량 데이터 설정
    volumeSeries.setData(data.map(candle => ({
      time: candle.time as Time,
      value: candle.volume,
      color: candle.close >= candle.open ? '#26a69a' : '#ef5350',
    })))
  },

  updateChartData: (data: ChartCandle) => {
    const { series, volumeSeries } = get()
    if (!series || !volumeSeries) return

    series.update({
      time: data.time as Time,
      open: data.open,
      high: data.high,
      low: data.low,
      close: data.close,
    })

    volumeSeries.update({
      time: data.time as Time,
      value: data.volume,
      color: data.close >= data.open ? '#26a69a' : '#ef5350',
    })
  },

  resizeChart: (width: number) => {
    const { chart } = get()
    if (!chart) return
    
    chart.applyOptions({
      width: width,
      height: 400,
    })
  },

  cleanup: () => {
    const { chart } = get()
    if (chart) {
      chart.remove()
    }
    set({ 
      chart: null, 
      series: null,
      volumeSeries: null,
      isInitChart: false 
    })
  },
})) 