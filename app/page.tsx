import MainPage from '@/views/main/home'
import PageTransition from '@/components/motion/PageTransition'

export default function Page() {
  return (
    <PageTransition>
      <MainPage />
    </PageTransition>
  )
}
