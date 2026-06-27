import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Arcade Room Gaming',
  description: 'Premium gaming discovery platform',
};

import { ProfileProvider } from '@/context/ProfileContext';
import { GameProvider } from '@/context/GameContext';
import AuthGuard from '@/components/AuthGuard';
import Footer from '@/components/Footer';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ProfileProvider>
          <GameProvider>
            <AuthGuard>
              <Navbar />
              {children}
              <Footer />
            </AuthGuard>
          </GameProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
