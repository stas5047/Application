import { Controller } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useEventForm } from '@/features/events/hooks/use-event-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Spinner } from '@/components/ui/spinner';
import { PageLoader } from '@/components/ui/page-loader';
import { EmptyState } from '@/components/ui/empty-state';

export default function EventFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { isEditMode, isFetching, isSubmitting, fetchError, form, onSubmit } = useEventForm({ id });
  const { register, control, handleSubmit, formState: { errors } } = form;

  if (isFetching) return <PageLoader />;

  if (fetchError) {
    return (
      <EmptyState
        icon={AlertCircle}
        heading="Event not found"
        subText="This event doesn't exist or could not be loaded."
        ctaLabel="Back to Events"
        onCta={() => void navigate('/events')}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-8 text-2xl font-bold tracking-tight">
          {isEditMode ? 'Edit Event' : 'Create Event'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Give your event a clear title"
              aria-invalid={!!errors.title}
              disabled={isSubmitting}
              {...register('title')}
            />
            {errors.title && (
              <p className="text-destructive text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">
              Description{' '}
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what attendees can expect…"
              aria-invalid={!!errors.description}
              disabled={isSubmitting}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-destructive text-sm">{errors.description.message}</p>
            )}
          </div>

          {/* Date & Time */}
          <Controller
            name="dateTime"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                id="dateTime"
                label="Date & Time"
                value={field.value ?? null}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.dateTime?.message}
              />
            )}
          />

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="City, venue, or online link"
              aria-invalid={!!errors.location}
              disabled={isSubmitting}
              {...register('location')}
            />
            {errors.location && (
              <p className="text-destructive text-sm">{errors.location.message}</p>
            )}
          </div>

          {/* Capacity */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="capacity">
              Capacity{' '}
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              step="1"
              placeholder="Unlimited"
              aria-invalid={!!errors.capacity}
              disabled={isSubmitting}
              onKeyDown={(e) => {
                if (['-', '+', '.', ',', 'e', 'E'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              {...register('capacity', { valueAsNumber: true })}
            />
            {errors.capacity && (
              <p className="text-destructive text-sm">{errors.capacity.message}</p>
            )}
          </div>

          {/* Visibility */}
          <div className="flex flex-col gap-1.5">
            <Label>Visibility</Label>
            <Controller
              name="visibility"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value ?? 'public'}
                  onValueChange={field.onChange}
                  className="flex flex-row gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="vis-public" value="public" disabled={isSubmitting} />
                    <Label htmlFor="vis-public" className="font-normal cursor-pointer">Public</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="vis-private" value="private" disabled={isSubmitting} />
                    <Label htmlFor="vis-private" className="font-normal cursor-pointer">Private</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner size="sm" className="mr-1" />}
              {isEditMode ? 'Save Changes' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
