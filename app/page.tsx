import { Header } from '@/components/Header'
import { Welcome } from '@/components/Welcome'
import { DailyNotes } from '@/components/DailyNotes'
import { PhotoGallery } from '@/components/PhotoGallery'
import { Phrases } from '@/components/Phrases'

export default function HomePage() {
  return (
    <main>
      <Header />
      <Welcome />
      <DailyNotes />
      <PhotoGallery />
      <Phrases />
    </main>
  )
}
