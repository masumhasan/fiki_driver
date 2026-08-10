import { cn } from '@/lib/utils'
import {
  Accessibility,
  ArrowLeft,
  Building2,
  CarFront,
  Check,
  ClipboardList,
  ExternalLink,
  FileText,
  HeartPulse,
  type LucideIcon,
  Map as MapIcon,
  MapPin,
  Navigation,
  Phone,
  Route,
  Save,
  ShieldAlert,
  UserRound,
} from 'lucide-react'
import Link from 'next/link'

type DetailItem = {
  label: string
  value: string
}

type SectionHeaderProps = {
  icon: LucideIcon
  title: string
}

const passengerDetails: DetailItem[] = [
  { label: 'Full name', value: 'Margaret Johnson' },
  { label: 'Phone number', value: '(305) 555-0192' },
  { label: 'Mobility type', value: 'Wheelchair' },
  { label: 'Additional attendant', value: 'No' },
]

const tripDetails: DetailItem[] = [
  { label: 'Assigned driver', value: 'John Rivera' },
  { label: 'Assigned vehicle', value: 'Toyota Sienna · MIA-4821' },
  { label: 'Trip distance', value: '3.2 mi' },
  { label: 'Estimated duration', value: '18 min' },
  { label: 'Recurring schedule', value: 'Mon / Wed / Fri' },
]

const tripStatuses = [
  { label: 'Assigned', state: 'complete' },
  { label: 'Accepted', state: 'complete' },
  { label: 'Heading to pickup', state: 'complete' },
  { label: 'Passenger picked up', state: 'current' },
  { label: 'Heading to destination', state: 'upcoming' },
  { label: 'Trip completed', state: 'upcoming' },
] as const

const quickNotes = [
  'Passenger late',
  'Traffic delay',
  'No issues',
  'Wheelchair assistance',
  'Facility delay',
]

function SectionHeader({ icon: Icon, title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-3.5 sm:px-5">
      <span className="grid size-7 place-items-center rounded-lg bg-primary/6 text-primary">
        <Icon aria-hidden="true" className="size-3.5" />
      </span>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  )
}

function DetailGrid({
  details,
  columns = 'three',
}: {
  details: DetailItem[]
  columns?: 'two' | 'three'
}) {
  return (
    <dl
      className={cn(
        'grid gap-x-6 gap-y-4',
        columns === 'three'
          ? 'sm:grid-cols-2 lg:grid-cols-3'
          : 'sm:grid-cols-2',
      )}
    >
      {details.map((detail) => (
        <div key={detail.label} className="min-w-0">
          <dt className="text-[0.68rem] font-medium text-muted-foreground">
            {detail.label}
          </dt>
          <dd className="mt-1 text-xs font-semibold leading-5 text-foreground">
            {detail.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function LocationCard({
  address,
  city,
  contact,
  contactLabel,
  facility,
  instructions,
  title,
  type,
  zip,
}: {
  address: string
  city: string
  contact: string
  contactLabel: string
  facility: string
  instructions?: string
  title: string
  type: 'pickup' | 'dropoff'
  zip: string
}) {
  const isPickup = type === 'pickup'

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3.5 sm:px-5">
        <span
          className={cn(
            'grid size-7 place-items-center rounded-lg',
            isPickup
              ? 'bg-brand-success/10 text-brand-success'
              : 'bg-secondary/16 text-brand-yellow-hover',
          )}
        >
          {isPickup ? (
            <Building2 aria-hidden="true" className="size-3.5" />
          ) : (
            <MapPin aria-hidden="true" className="size-3.5" />
          )}
        </span>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>

      <div className="p-4 sm:p-5">
        <div>
          <p className="text-[0.68rem] font-medium text-muted-foreground">
            Facility
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {facility}
          </p>
        </div>

        <div className="mt-4">
          <p className="text-[0.68rem] font-medium text-muted-foreground">
            Address
          </p>
          <p className="mt-1 text-xs leading-5 text-foreground">{address}</p>
          <p className="text-xs leading-5 text-muted-foreground">
            {city}, FL {zip}
          </p>
        </div>

        {instructions && (
          <div className="mt-4 rounded-xl border border-secondary/25 bg-secondary/8 p-3">
            <p className="text-[0.68rem] font-semibold text-secondary-foreground">
              Pickup instructions
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {instructions}
            </p>
          </div>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-[0.68rem] font-medium text-muted-foreground">
            {contactLabel}
          </p>
          <p className="mt-1 text-xs font-semibold text-foreground">
            {contact}
          </p>
        </div>
        <button
          type="button"
          className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-secondary text-xs font-bold text-secondary-foreground shadow-[0_4px_10px_rgba(255,189,32,0.28)] transition-colors hover:bg-brand-yellow-hover"
        >
          {isPickup ? 'Start pickup' : 'Complete drop-off'}
        </button>
      </div>
    </section>
  )
}

function _RoutePreview() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <SectionHeader icon={MapIcon} title="Route overview" />
      <div className="p-4 sm:p-5">
        <div
          className="relative h-56 overflow-hidden rounded-2xl bg-muted"
          role="img"
          aria-label="Route preview from Sunrise Senior Living to Jackson Memorial Hospital"
        >
          <div className="absolute inset-4 grid grid-cols-4 gap-3 opacity-70">
            {Array.from({ length: 12 }, (_, index) => (
              <span
                key={`map-block-${index + 1}`}
                className="rounded-lg border border-border bg-card"
              />
            ))}
          </div>

          <div className="absolute left-[20%] top-[62%] h-1 w-[30%] rounded-full bg-secondary" />
          <div className="absolute left-[49%] top-[39%] h-[24%] w-1 rounded-full bg-secondary" />
          <div className="absolute left-[49%] top-[38%] h-1 w-[28%] rounded-full bg-secondary" />

          <span className="absolute left-[16%] top-[56%] grid size-10 place-items-center rounded-full bg-primary text-primary-foreground ring-4 ring-card">
            <MapPin aria-hidden="true" className="size-4" />
          </span>
          <span className="absolute right-[17%] top-[31%] grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground ring-4 ring-card">
            <Building2 aria-hidden="true" className="size-4" />
          </span>
          <span className="absolute left-1/2 top-[30%] grid size-9 -translate-x-1/2 place-items-center rounded-xl border border-border bg-card text-primary">
            <CarFront aria-hidden="true" className="size-4" />
          </span>

          <span className="absolute bottom-3 left-3 rounded-lg bg-primary px-2.5 py-1.5 text-[0.68rem] font-semibold text-primary-foreground">
            3.2 mi · 18 min
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-3 divide-x divide-border rounded-xl bg-muted p-3">
          <div className="px-2 first:pl-0">
            <dt className="text-[0.65rem] text-muted-foreground">Distance</dt>
            <dd className="mt-1 text-xs font-semibold text-foreground">
              3.2 mi
            </dd>
          </div>
          <div className="px-3">
            <dt className="text-[0.65rem] text-muted-foreground">Duration</dt>
            <dd className="mt-1 text-xs font-semibold text-foreground">
              18 min
            </dd>
          </div>
          <div className="px-3 last:pr-0">
            <dt className="text-[0.65rem] text-muted-foreground">Traffic</dt>
            <dd className="mt-1 text-xs font-semibold text-brand-success">
              Clear
            </dd>
          </div>
        </dl>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <a
            href="https://www.google.com/maps/dir/?api=1&origin=1204%20NW%2014th%20Ave%20Miami%20FL&destination=1611%20NW%2012th%20Ave%20Miami%20FL"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ExternalLink aria-hidden="true" className="size-3.5" />
            Open Google Maps
          </a>
          <a
            href="https://www.google.com/maps/dir/?api=1&origin=1204%20NW%2014th%20Ave%20Miami%20FL&destination=1611%20NW%2012th%20Ave%20Miami%20FL&travelmode=driving"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-secondary text-xs font-semibold text-secondary-foreground transition-colors hover:bg-brand-yellow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Navigation aria-hidden="true" className="size-3.5" />
            Start navigation
          </a>
        </div>
      </div>
    </section>
  )
}

function TripStatusPanel() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <SectionHeader icon={Route} title="Trip status" />
      <div className="p-4 sm:p-5">
        <ol>
          {tripStatuses.map((status, index) => {
            const isComplete = status.state === 'complete'
            const isCurrent = status.state === 'current'
            const isLast = index === tripStatuses.length - 1

            return (
              <li
                key={status.label}
                className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2.5"
              >
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'grid size-6 place-items-center rounded-full border',
                      isComplete &&
                        'border-brand-success bg-brand-success text-primary-foreground',
                      isCurrent &&
                        'border-secondary bg-secondary text-secondary-foreground',
                      status.state === 'upcoming' &&
                        'border-border bg-card text-muted-foreground',
                    )}
                  >
                    {isComplete ? (
                      <Check aria-hidden="true" className="size-3.5" />
                    ) : (
                      <span
                        className={cn(
                          'size-1.5 rounded-full',
                          isCurrent ? 'bg-secondary-foreground' : 'bg-border',
                        )}
                      />
                    )}
                  </span>
                  {!isLast && (
                    <span
                      className={cn(
                        'min-h-5 w-px flex-1',
                        isComplete ? 'bg-brand-success' : 'bg-border',
                      )}
                    />
                  )}
                </div>

                <div className={cn('pb-4 pt-0.5', isLast && 'pb-0')}>
                  <p
                    className={cn(
                      'text-xs font-medium',
                      status.state === 'upcoming'
                        ? 'text-muted-foreground'
                        : 'text-foreground',
                    )}
                  >
                    {status.label}
                  </p>
                  {isCurrent && (
                    <p className="mt-1 text-[0.68rem] font-medium text-brand-yellow-hover">
                      Current status
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>

        <button
          type="button"
          className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-brand-yellow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Mark heading to destination
          <ArrowLeft aria-hidden="true" className="size-3.5 rotate-180" />
        </button>
      </div>
    </section>
  )
}

function DriverNotes() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <SectionHeader icon={FileText} title="Driver notes" />
      <div className="p-4 sm:p-5">
        <fieldset>
          <legend className="text-[0.68rem] font-medium text-muted-foreground">
            Quick notes
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {quickNotes.map((note) => (
              <button
                key={note}
                type="button"
                className="rounded-full border border-border bg-card px-3 py-1.5 text-[0.68rem] font-medium text-muted-foreground transition-colors hover:border-primary/20 hover:bg-primary/5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {note}
              </button>
            ))}
          </div>
        </fieldset>

        <label
          htmlFor="driver-notes"
          className="mt-4 block text-[0.68rem] font-medium text-muted-foreground"
        >
          Notes
        </label>
        <textarea
          id="driver-notes"
          name="driverNotes"
          rows={4}
          placeholder="Add trip notes, observations, or issues..."
          className="mt-2 w-full resize-y rounded-xl border border-input bg-muted px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-ring focus:ring-3 focus:ring-ring/12"
        />

        <button
          type="button"
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-brand-yellow-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Save aria-hidden="true" className="size-3.5" />
          Save notes
        </button>
      </div>
    </section>
  )
}

export function RideDetailsOverview() {
  return (
    <section
      aria-labelledby="ride-details-title"
      className="mx-auto w-full max-w-6xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Back
          </Link>
          <span className="hidden h-5 w-px bg-border sm:block" />
          <div className="min-w-0">
            <div className="mt-0.5 flex items-center gap-2">
              <h1
                id="ride-details-title"
                className="text-base font-bold tracking-tight text-foreground"
              >
                TRP-2847
              </h1>
              <span className="rounded-full border border-secondary/50 bg-secondary/14 px-2.5 py-1 text-[0.68rem] font-semibold text-secondary-foreground">
                In progress
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <a
            href="https://www.google.com/maps/dir/?api=1&origin=1204%20NW%2014th%20Ave%20Miami%20FL&destination=1611%20NW%2012th%20Ave%20Miami%20FL"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-card px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Navigation aria-hidden="true" className="size-3.5" />
            <span className="hidden sm:inline">Google Maps</span>
            <span className="sm:hidden">Maps</span>
          </a>
          <a
            href="tel:+13055550192"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-brand-success/25 bg-card px-3 text-xs font-semibold text-brand-success transition-colors hover:bg-brand-success/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Phone aria-hidden="true" className="size-3.5" />
            <span className="hidden sm:inline">Call passenger</span>
            <span className="sm:hidden">Call</span>
          </a>
        </div>
      </div>

      <section className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-[0_6px_22px_rgba(8,37,82,0.05)] sm:p-5">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary/20 text-sm font-bold text-secondary-foreground">
              MJ
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold tracking-tight text-foreground">
                Margaret Johnson
              </h2>
              <a
                href="tel:+13055550192"
                className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone aria-hidden="true" className="size-3.5" />
                (305) 555-0192
              </a>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-2.5 py-1 text-[0.68rem] font-medium text-primary">
                  <Accessibility aria-hidden="true" className="size-3" />
                  Wheelchair
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground">
                  <Route aria-hidden="true" className="size-3" />
                  One way
                </span>
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-5 border-t border-border pt-4 text-right sm:block sm:space-y-3 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
            <div>
              <dt className="text-[0.65rem] text-muted-foreground">Date</dt>
              <dd className="mt-1 text-xs font-semibold text-foreground">
                Jul 24, 2026
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] text-muted-foreground">Pickup</dt>
              <dd className="mt-1 text-xs font-semibold text-foreground">
                8:00 AM
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] text-muted-foreground">Drop-off</dt>
              <dd className="mt-1 text-xs font-semibold text-foreground">
                8:45 AM
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <LocationCard
          type="pickup"
          title="Pickup information"
          facility="Sunrise Senior Living"
          address="1204 NW 14th Ave"
          city="Miami"
          zip="33125"
          instructions="Call upon arrival. Use the main entrance on the west side."
          contactLabel="Pickup contact"
          contact="Front Desk · (305) 555-0193"
        />
        <LocationCard
          type="dropoff"
          title="Drop-off information"
          facility="Jackson Memorial Hospital"
          address="1611 NW 12th Ave"
          city="Miami"
          zip="33136"
          contactLabel="Destination contact"
          contact="Admissions · (305) 555-0140"
        />
      </div>

      <div className="mt-4 space-y-4">
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <SectionHeader icon={UserRound} title="Passenger information" />
          <div className="p-4 sm:p-5">
            <DetailGrid details={passengerDetails} columns="two" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-destructive/18 bg-destructive/4 p-3">
                <div className="flex items-center gap-2 text-destructive">
                  <HeartPulse aria-hidden="true" className="size-3.5" />
                  <p className="text-[0.68rem] font-semibold">Medical note</p>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                  Passenger requires an oxygen tank during transit.
                </p>
              </div>
              <div className="rounded-xl border border-primary/12 bg-primary/4 p-3">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldAlert aria-hidden="true" className="size-3.5" />
                  <p className="text-[0.68rem] font-semibold">
                    Emergency contact
                  </p>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                  Linda Johnson · (305) 555-0198
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <SectionHeader icon={ClipboardList} title="Trip information" />
          <div className="p-4 sm:p-5">
            <DetailGrid details={tripDetails} columns="three" />
            <a
              href="https://www.google.com/maps/dir/?api=1&origin=1204%20NW%2014th%20Ave%20Miami%20FL&destination=1611%20NW%2012th%20Ave%20Miami%20FL"
              target="_blank"
              rel="noreferrer"
              className="mx-auto mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-6 text-xs font-bold text-secondary-foreground hover:bg-brand-yellow-hover sm:w-auto"
            >
              <Navigation className="size-3.5" />
              Open Google Maps
            </a>
          </div>
        </section>
      </div>

      <div className="mt-4">
        <TripStatusPanel />
      </div>

      <div className="mt-4">
        <DriverNotes />
      </div>
    </section>
  )
}
