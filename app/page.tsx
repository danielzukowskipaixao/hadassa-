import { Header } from '@/components/Header'
import { Welcome } from '@/components/Welcome'
import { MonthlyCalendar } from '@/components/MonthlyCalendar'
import { PhotoGallery } from '@/components/PhotoGallery'
import { PhrasesForm } from '@/components/PhrasesForm'
import { PhrasesList } from '../components/PhrasesList'

export default function HomePage() {
  return (
    <main>
      <Header />
      <Welcome />
      <section className="px-6 mt-6">
        <div className="max-w-5xl mx-auto glass p-4">
          <h2 className="text-lg mb-1">Calendário do Mês</h2>
          <MonthlyCalendar />
        </div>
      </section>
      <PhotoGallery />
      <section className="px-6 mt-8">
        <div className="max-w-5xl mx-auto glass p-4">
          <h2 className="text-lg">Frases & Recadinhos</h2>
          <p className="opacity-80 text-sm mb-4">Deixe um carinho em palavras ✨</p>
          <PhrasesForm />
          <PhrasesList />
        </div>
      </section>
    </main>
  )
}
