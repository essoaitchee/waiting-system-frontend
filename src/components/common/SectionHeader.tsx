interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description: string
}

function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-base text-slate-600">{description}</p>
    </div>
  )
}

export default SectionHeader
