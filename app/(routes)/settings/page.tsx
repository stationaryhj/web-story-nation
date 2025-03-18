// 서버 컴포넌트로 변경
import Header from '@/components/layout/header';
import PageTransition from '@/components/ui/motion/PageTransition';

import SettingsForm from './settings-form';

export default function SettingsPage() {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header/>

        <main className="flex-grow container mx-auto px-4 py-6">
          { /* 클라이언트 컴포넌트로 폼 부분 분리 */ }
          <SettingsForm/>
        </main>
      </div>
    </PageTransition>
  );
}
