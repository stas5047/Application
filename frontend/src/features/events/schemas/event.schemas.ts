import * as yup from 'yup';

export const eventSchema = yup.object({
  title: yup.string().required('Title is required').max(255),
  description: yup.string().max(2000).default(''),
  dateTime: yup
    .date()
    .required('Date and time is required')
    .typeError('Invalid date')
    .test('is-future', 'Event cannot be in the past', (value) =>
      value ? value > new Date() : false
    ),
  location: yup.string().required('Location is required').max(255),
  capacity: yup
    .number()
    .integer()
    .min(1)
    .nullable()
    .optional()
    .transform((v) => (isNaN(v as number) ? null : v)),
  visibility: yup
    .mixed<'public' | 'private'>()
    .oneOf(['public', 'private'])
    .optional()
    .default('public'),
});

export type EventFormValues = yup.InferType<typeof eventSchema>;