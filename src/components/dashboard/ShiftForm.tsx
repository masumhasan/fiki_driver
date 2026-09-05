'use client'

import { cn } from '@/lib/utils'
import { getDriverSession } from '@/lib/auth'
import { startShiftApi, endShiftApi } from '@/lib/api'
import {
  ArrowLeftRight,
  Camera,
  Check,
  ChevronRight,
  CircleGauge,
  Fuel,
  ImagePlus,
  Images,
  Info,
  LockKeyhole,
  MessageCircle,
  Sparkles,
  TriangleAlert,
  X,
  Loader2,
} from 'lucide-react'
import { useId, useRef, useState } from 'react'

type ShiftMode = 'start' | 'end'
type Condition = 'clear' | 'maintenance' | 'damage' | 'cleaned'

const fuelLevels = [
  { value: 'empty', amount: 'E', label: 'Empty' },
  { value: 'quarter', amount: '1/4', label: 'Low' },
  { value: 'half', amount: '1/2', label: 'Half' },
  { value: 'three-quarters', amount: '3/4', label: 'Mostly Full' },
  { value: 'full', amount: 'F', label: 'Full' },
] as const

const conditions: Array<{
  value: Condition
  label: string
  icon: typeof Check
  iconClassName: string
}> = [
  {
    value: 'clear',
    label: 'No Issues',
    icon: Check,
    iconClassName: 'text-emerald-600',
  },
  {
    value: 'maintenance',
    label: 'Needs Maintenance',
    icon: CircleGauge,
    iconClassName: 'text-amber-600',
  },
  {
    value: 'damage',
    label: 'Damage to Report',
    icon: TriangleAlert,
    iconClassName: 'text-red-500',
  },
  {
    value: 'cleaned',
    label: 'Cleaned Out Vehicle',
    icon: Sparkles,
    iconClassName: 'text-blue-600',
  },
]

function SectionTitle({
  children,
  icon: Icon,
}: {
  children: React.ReactNode
  icon: typeof Fuel
}) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
      <Icon
        aria-hidden="true"
        className="size-[1.1rem] shrink-0 text-blue-600"
      />
      {children}
    </h2>
  )
}

export function ShiftForm({
  mode,
  onClose,
  onSuccess,
  startOdometerVal,
  pendingReportShift,
}: {
  mode: ShiftMode
  onClose: () => void
  onSuccess?: () => void
  startOdometerVal?: number
  pendingReportShift?: any
}) {
  const uploadId = useId()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const isStart = mode === 'start'
  
  const initialOdo = isStart
    ? '58,742'
    : startOdometerVal
      ? String(startOdometerVal + 42.6)
      : '58,784.6'

  const [odometer, setOdometer] = useState(initialOdo)
  const [fuel, setFuel] = useState('half')
  const [condition, setCondition] = useState<Condition>('clear')
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<Array<{ name: string; url: string }>>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const session = getDriverSession()
  const vehicle = session?.vehicle
  const assignedVehicleText =
    vehicle && (vehicle.make || vehicle.model || vehicle.licensePlate)
      ? `${[vehicle.make, vehicle.model].filter(Boolean).join(' ')}${vehicle.licensePlate ? ` - ${vehicle.licensePlate}` : ''}`
      : 'Toyota Sienna - MIA-4821'

  const actionLabel = isStart
    ? 'Start Shift & Clock In'
    : pendingReportShift
      ? 'Complete Shift End Report'
      : 'End Shift & Clock Out'

  // Calculate live estimated miles for end shift modal
  const numEndOdo = parseFloat(odometer.replace(/[^\d.]/g, ''))
  const numStartOdo = startOdometerVal || 58742
  const estimatedMilesDisplay =
    !isNaN(numEndOdo) && numEndOdo >= numStartOdo
      ? (numEndOdo - numStartOdo).toFixed(1)
      : '42.6'

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const rawFiles = Array.from(event.target.files || [])
    if (rawFiles.length === 0) return
    setError('')
    setUploadingPhoto(true)

    const token = session?.token
    if (token) {
      const { uploadImageApi } = await import('@/lib/api')
      const { compressImage } = await import('@/lib/imageUtils')
      const uploadedList: Array<{ name: string; url: string }> = []

      for (const file of rawFiles) {
        try {
          // Compress image client-side to max 1920px JPEG (transforms 20MB iPhone camera shots into ~300KB JPEGs)
          const compressed = await compressImage(file)
          const res = await uploadImageApi(token, compressed, 'shift-odometers')
          if (res.success && res.data?.url) {
            uploadedList.push({ name: file.name, url: res.data.url })
          } else {
            console.error('Failed to upload vehicle photo:', file.name, res.error)
          }
        } catch (err) {
          console.error('Error processing vehicle photo:', file.name, err)
        }
      }

      if (uploadedList.length > 0) {
        setPhotos((prev) => [...prev, ...uploadedList])
      } else {
        setError('Failed to upload vehicle photos to S3. Please try again.')
      }
    } else {
      setError('Authentication required to upload photos.')
    }
    setUploadingPhoto(false)
    if (cameraInputRef.current) cameraInputRef.current.value = ''
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  async function submitShift(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const rawNum = odometer.replace(/[^\d.]/g, '')
    if (!rawNum || isNaN(parseFloat(rawNum))) {
      setError(
        `${isStart ? 'Starting' : 'Ending'} mileage is required before clocking ${isStart ? 'in' : 'out'}.`,
      )
      return
    }

    setSubmitting(true)
    setError('')
    const token = session?.token
    if (!token) {
      setError('Authentication required.')
      setSubmitting(false)
      return
    }

    try {
      const photoUrlsList = photos.map((p) => p.url)
      const payload = {
        odometer: rawNum,
        fuel,
        condition,
        notes,
        photoUrl: photoUrlsList[0] || '',
        photos: photoUrlsList,
        startPhotoUrls: isStart ? photoUrlsList : undefined,
        endPhotoUrls: !isStart ? photoUrlsList : undefined,
      }
      const res = isStart ? await startShiftApi(token, payload) : await endShiftApi(token, payload)
      if (res.success) {
        onSuccess?.()
        onClose()
      } else {
        setError(res.error?.message || `Failed to ${isStart ? 'start' : 'end'} shift.`)
      }
    } catch {
      setError(`Failed to ${isStart ? 'start' : 'end'} shift.`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isStart ? 'Start shift' : 'End shift'}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-primary/68 px-3 py-4 backdrop-blur-[2px] sm:px-5 sm:py-8"
    >
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-[0_28px_80px_rgba(1,15,36,0.34)]">
        <header className="relative border-b border-border px-5 py-5 pr-16 sm:px-7 sm:py-6">
          <h1 className="text-xl font-bold tracking-[-0.035em] text-foreground sm:text-2xl">
            {isStart ? 'Start Shift' : pendingReportShift ? 'Complete Last Shift End Report' : 'End Shift'}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-5 text-muted-foreground">
            {isStart
              ? 'Confirm vehicle and enter starting mileage before clocking in.'
              : pendingReportShift
                ? 'Your previous shift was auto-ended at your scheduled end time. Please submit your ending mileage and vehicle status.'
                : 'Enter ending mileage and confirm your vehicle status before clocking out.'}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shift form"
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:right-5 sm:top-5"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>

        <form onSubmit={submitShift} className="space-y-4 p-5 sm:p-7">
          {pendingReportShift && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 leading-relaxed">
              <p className="font-bold text-amber-900 flex items-center gap-1.5">
                <TriangleAlert className="size-4 text-amber-600 shrink-0" />
                Action Required: Complete Last Shift Report
              </p>
              <p className="mt-1 text-amber-800">
                Your shift on <strong>{pendingReportShift.shiftDate}</strong> was auto-ended at your scheduled shift end time ({pendingReportShift.endedAt ? new Date(pendingReportShift.endedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "America/Chicago" }) : "4:00 PM"} CT).
                Please enter your ending odometer and vehicle condition to complete your report before starting your next shift.
              </p>
            </div>
          )}
          <section className="rounded-xl border border-border bg-muted/45 p-4 sm:p-5">
            <SectionTitle icon={ArrowLeftRight}>Assigned Vehicle</SectionTitle>
            <div className="mt-3 flex h-11 w-full items-center justify-between rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm">
              <span>{assignedVehicleText}</span>
              <LockKeyhole aria-hidden="true" className="size-4 text-muted-foreground" />
            </div>
          </section>

          <div className="grid gap-5 sm:grid-cols-2">
            <section className="rounded-xl border border-border bg-muted/45 p-4 sm:min-h-60 sm:p-5">
              <SectionTitle icon={CircleGauge}>
                {isStart ? 'Starting' : 'Ending'} Odometer
                <span className="text-red-500">*</span>
              </SectionTitle>
              <label className="relative mt-3 block">
                <span className="sr-only">Odometer reading in miles</span>
                <input
                  inputMode="numeric"
                  value={odometer}
                  onChange={(event) => {
                    setOdometer(event.target.value)
                    setError('')
                  }}
                  aria-invalid={Boolean(error)}
                  className="h-11 w-full rounded-lg border border-border bg-card px-4 pr-12 text-sm text-foreground shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  mi
                </span>
              </label>
            </section>

            <section className="rounded-xl border border-border bg-muted/45 p-4 sm:min-h-60 sm:p-5">
              <SectionTitle icon={Camera}>Vehicle Photos</SectionTitle>
              {/* Native Mobile Camera Input */}
              <input
                ref={cameraInputRef}
                id={`${uploadId}-camera`}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={handleFileChange}
              />
              {/* Gallery / Photo Library Input */}
              <input
                ref={galleryInputRef}
                id={`${uploadId}-gallery`}
                type="file"
                multiple
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
              />

              {uploadingPhoto ? (
                <div className="mt-3 flex min-h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-400 bg-card p-4 text-center shadow-sm">
                  <Loader2 className="size-8 animate-spin text-blue-600" />
                  <span className="mt-3 text-sm font-semibold text-blue-600">
                    Optimizing & uploading to S3...
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    Converting photo for instant upload
                  </span>
                </div>
              ) : photos.length > 0 ? (
                <div className="mt-3 space-y-2.5">
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((p, idx) => (
                      <div key={`${p.url}-${idx}`} className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-slate-900 shadow-sm">
                        <img src={p.url} alt={p.name} className="size-full object-cover transition-transform group-hover:scale-105" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-red-600/90 text-white shadow backdrop-blur-sm transition-transform hover:scale-110 hover:bg-red-700"
                          title="Remove photo"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                    {photos.length < 6 && (
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="flex aspect-video flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-400/60 bg-blue-50/40 text-center transition-colors hover:border-blue-600 hover:bg-blue-100/50 disabled:opacity-50"
                        title="Take photo with camera"
                      >
                        <Camera className="size-4 text-blue-600" />
                        <span className="mt-1 text-[0.65rem] font-bold text-blue-700">+ Camera</span>
                      </button>
                    )}
                    {photos.length < 6 && (
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="flex aspect-video flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-card text-center transition-colors hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
                        title="Upload from gallery"
                      >
                        <Images className="size-4 text-slate-600" />
                        <span className="mt-1 text-[0.65rem] font-bold text-slate-700">+ Gallery</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground">
                    <span className="font-semibold text-emerald-600">✓ {photos.length} photo{photos.length > 1 ? 's' : ''} uploaded to S3</span>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Camera className="size-3" /> Camera
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="font-bold text-slate-700 hover:underline flex items-center gap-1"
                      >
                        <Images className="size-3" /> Gallery
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-blue-400/80 bg-blue-50/50 p-4 text-center transition-all hover:border-blue-600 hover:bg-blue-100/50 active:scale-[0.98] disabled:opacity-60"
                    >
                      <div className="grid size-9 place-items-center rounded-full bg-blue-100 text-blue-600">
                        <Camera className="size-5" />
                      </div>
                      <span className="text-xs font-bold text-blue-700">Take Photo</span>
                      <span className="text-[0.65rem] text-blue-600/80">Camera capture</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-card p-4 text-center transition-all hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] disabled:opacity-60"
                    >
                      <div className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-600">
                        <Images className="size-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">From Gallery</span>
                      <span className="text-[0.65rem] text-muted-foreground">Upload existing</span>
                    </button>
                  </div>
                  <p className="rounded-lg bg-card/80 px-3 py-1.5 text-center text-[0.68rem] text-muted-foreground border border-border/60">
                    Odometer, front, rear, or any damage photos (auto-optimized for upload)
                  </p>
                </div>
              )}
            </section>
          </div>

          <section className="rounded-xl border border-border bg-muted/45 p-4 sm:p-5">
            <SectionTitle icon={Fuel}>
              Fuel Level at {isStart ? 'Start' : 'End'} of Shift
            </SectionTitle>
            <div className="mt-3 grid grid-cols-5 overflow-hidden rounded-lg border border-border bg-card">
              {fuelLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  aria-pressed={fuel === level.value}
                  onClick={() => setFuel(level.value)}
                  className={cn(
                    'min-w-0 border-r border-border px-1 py-3 text-center last:border-r-0 sm:px-3',
                    fuel === level.value &&
                      'bg-amber-50 ring-1 ring-inset ring-amber-400',
                  )}
                >
                  <span className="block text-xs font-bold text-foreground sm:text-sm">
                    {level.amount}
                  </span>
                  <span className="mt-1 block truncate text-[0.65rem] text-muted-foreground sm:text-sm">
                    {level.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/45 p-4 sm:p-5">
            <SectionTitle icon={CircleGauge}>Vehicle Condition</SectionTitle>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {conditions.map((item) => {
                const Icon = item.icon
                const selected = condition === item.value
                return (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setCondition(item.value)}
                    className={cn(
                      'flex min-h-20 items-center justify-center gap-1.5 rounded-lg border bg-card px-2 py-3 text-center text-xs font-medium leading-4 text-foreground shadow-sm transition-colors',
                      selected
                        ? 'border-emerald-600 ring-1 ring-emerald-600/20'
                        : 'border-border hover:border-blue-300',
                    )}
                  >
                    <Icon
                      className={cn('size-4 shrink-0', item.iconClassName)}
                    />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/45 p-4 sm:p-5">
            <SectionTitle icon={MessageCircle}>
              {isStart ? 'Start' : 'End'} of Shift Notes (optional)
            </SectionTitle>
            <textarea
              value={notes}
              maxLength={300}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add any notes about your shift, vehicle condition, incidents, or other details..."
              className="mt-3 min-h-24 w-full resize-none rounded-lg border border-border bg-card px-4 py-3 text-sm leading-5 text-foreground shadow-sm outline-none placeholder:text-brand-placeholder focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
            />
            <p className="mt-2 text-right text-xs text-muted-foreground">
              {notes.length}/300
            </p>
          </section>

          {!isStart && (
            <section className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-blue-950 sm:px-5">
              <Info className="size-5 shrink-0 text-blue-600" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  Estimated miles driven today
                </p>
                <p className="text-xs text-muted-foreground">
                  Ending Odometer - Starting Odometer
                </p>
              </div>
              <strong className="ml-auto shrink-0 text-xl">{estimatedMilesDisplay} mi</strong>
            </section>
          )}

          {error && (
            <p role="alert" className="text-center text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-[11rem_1fr]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold text-white shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50',
                isStart
                  ? 'bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600'
                  : 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600',
              )}
            >
              {submitting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <CircleGauge className="size-5" />
                  {actionLabel}
                  {isStart && <ChevronRight className="size-5" />}
                </>
              )}
            </button>
          </div>

          <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground sm:text-sm">
            <LockKeyhole className="size-4 shrink-0" />
            {isStart
              ? 'Starting mileage is required before clocking in.'
              : 'Ending mileage is required before clocking out.'}
          </p>
        </form>
      </div>
    </div>
  )
}
