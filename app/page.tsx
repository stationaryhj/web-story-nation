import MainPage from '@/views/main/home'
import PageTransition from '@/components/motion/PageTransition'
import DraggableButtonGrid from '@/components/grid/DraggableButtonGrid'

export default function Page() {
  return (
    <PageTransition>
      <MainPage />
    </PageTransition>
  )
}
