import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'

export default async function AdminPage() {
  const user = await getCurrentUser()
  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-pop">Painel Admin</h1>
        <Link href="/" className="underline opacity-80 hover:opacity-100">Voltar</Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="glass p-4">
          <h2 className="text-lg mb-2">Recadinhos por data</h2>
          <p className="opacity-80 text-sm">Crie/edite recados do dia atual ou anteriores. (UI simplificada a implementar conforme uso)</p>
        </section>
        <section className="glass p-4">
          <h2 className="text-lg mb-2">Moderar conteúdo</h2>
          <p className="opacity-80 text-sm">Ocultar fotos ou frases públicas, ajustar visibilidade.</p>
        </section>
      </div>
      <p className="mt-6 text-sm opacity-70">Logado como: {user?.email}</p>
    </main>
  )
}
