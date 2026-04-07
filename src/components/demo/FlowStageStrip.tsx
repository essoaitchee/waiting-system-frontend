import { cn } from '@/utils/cn'

interface FlowStage {
  title: string
  caption: string
}

interface FlowStageStripProps {
  currentStep: number
  stages: FlowStage[]
}

function FlowStageStrip({ currentStep, stages }: FlowStageStripProps) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {stages.map((stage, index) => {
        const step = index + 1
        const isDone = step < currentStep
        const isActive = step === currentStep

        return (
          <div
            key={stage.title}
            className={cn(
              'rounded-[24px] border px-4 py-4 transition',
              isActive && 'border-orange-300 bg-orange-50 shadow-panel',
              isDone && 'border-emerald-200 bg-emerald-50',
              !isDone && !isActive && 'border-slate-200 bg-white',
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold',
                  isActive && 'bg-orange-500 text-white',
                  isDone && 'bg-emerald-600 text-white',
                  !isDone && !isActive && 'bg-slate-100 text-slate-500',
                )}
              >
                {step}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{stage.title}</p>
                <p className="text-xs text-slate-500">{stage.caption}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default FlowStageStrip
