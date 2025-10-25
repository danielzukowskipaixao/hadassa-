'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClientBrowser } from '@/lib/supabase-browser'
import { ensurePublicUserId } from '@/lib/publicUser'

const Schema = z.object({
  text: z.string().min(1, 'Escreva algo').max(500, 'Máximo 500 caracteres'),
})
type FormValues = z.infer<typeof Schema>

export function PhrasesForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { text: '' },
  })

  async function onSubmit(values: FormValues) {
    const tmp = {
      id: `tmp-${Date.now()}`,
      text: values.text,
      createdAt: new Date().toISOString(),
      isPublic: true,
    }
    window.dispatchEvent(new CustomEvent('phrase:created', { detail: tmp }))
    reset({ text: '' })
    const supabase = createClientBrowser()
    try {
      const userId = await ensurePublicUserId(supabase)
      const { data, error } = await supabase
        .from('Phrase')
        .insert({ text: values.text, isPublic: true, userId })
        .select()
        .single()
      if (error) throw error
      window.dispatchEvent(new CustomEvent('phrase:replace', { detail: { tempId: tmp.id, real: data } }))
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('phrase:revert', { detail: tmp.id }))
      alert(err?.message || 'Erro ao salvar. Verifique as políticas RLS e o .env.local.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2" aria-label="Formulário de frases e recadinhos">
      <label className="block">
        <span className="sr-only">Frase</span>
        <textarea
          aria-label="Escreva uma frase ou recadinho"
          className="w-full rounded-xl p-3 bg-white/10 border border-white/20"
          placeholder="Escreva algo fofo…"
          {...register('text')}
        />
      </label>
      {errors.text && <div className="text-sm text-red-300">{errors.text.message}</div>}
      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl bg-pop text-ink">
          {isSubmitting ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
    </form>
  )
}
