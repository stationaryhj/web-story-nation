import PageTransition from '@/components/motion/PageTransition';
import MainPage from '@/views/main/home';

export default function Page() {
  return (
    <PageTransition>
      <MainPage />
    </PageTransition>
  );
}
