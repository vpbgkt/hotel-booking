'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ONBOARD_HOTEL } from '@/lib/graphql/queries/platform-admin';
import {
  Building2,
  MapPin,
  User,
  Globe,
  ArrowRight,
  ArrowLeft,
  Check,
  Star,
  Hotel,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Hotel Details', icon: Building2 },
  { id: 2, title: 'Location', icon: MapPin },
  { id: 3, title: 'Admin Account', icon: User },
  { id: 4, title: 'Preferences', icon: Globe },
];

interface FormData {
  // Hotel
  hotelName: string;
  phone: string;
  hotelEmail: string;
  description: string;
  starRating: number;
  // Location
  address: string;
  city: string;
  state: string;
  pincode: string;
  // Admin
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminPasswordConfirm: string;
  adminPhone: string;
  // Preferences
  bookingModel: string;
  domain: string;
}

const initialFormData: FormData = {
  hotelName: '',
  phone: '',
  hotelEmail: '',
  description: '',
  starRating: 3,
  address: '',
  city: '',
  state: '',
  pincode: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  adminPasswordConfirm: '',
  adminPhone: '',
  bookingModel: 'DAILY',
  domain: '',
};

export default function OnboardPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [result, setResult] = useState<{ hotelSlug: string; adminEmail: string } | null>(null);

  const [onboardHotel, { loading }] = useMutation(ONBOARD_HOTEL, {
    onCompleted: (data: any) => {
      if (data?.onboardHotel?.success) {
        setResult({
          hotelSlug: data.onboardHotel.hotelSlug,
          adminEmail: data.onboardHotel.adminEmail,
        });
        setStep(5); // success step
      }
    },
    onError: (err) => {
      setErrors({ hotelEmail: err.message });
    },
  });

  const updateField = (field: keyof FormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (s === 1) {
      if (!form.hotelName.trim()) newErrors.hotelName = 'Hotel name is required';
      if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!form.hotelEmail.trim()) newErrors.hotelEmail = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.hotelEmail))
        newErrors.hotelEmail = 'Invalid email address';
    } else if (s === 2) {
      if (!form.address.trim()) newErrors.address = 'Address is required';
      if (!form.city.trim()) newErrors.city = 'City is required';
      if (!form.state.trim()) newErrors.state = 'State is required';
      if (!form.pincode.trim()) newErrors.pincode = 'Pincode is required';
      else if (!/^\d{6}$/.test(form.pincode)) newErrors.pincode = 'Must be 6 digits';
    } else if (s === 3) {
      if (!form.adminName.trim()) newErrors.adminName = 'Name is required';
      if (!form.adminEmail.trim()) newErrors.adminEmail = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail))
        newErrors.adminEmail = 'Invalid email address';
      if (!form.adminPassword) newErrors.adminPassword = 'Password is required';
      else if (form.adminPassword.length < 6)
        newErrors.adminPassword = 'Password must be at least 6 characters';
      if (form.adminPassword !== form.adminPasswordConfirm)
        newErrors.adminPasswordConfirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      setStep(3);
      return;
    }

    await onboardHotel({
      variables: {
        input: {
          hotelName: form.hotelName.trim(),
          phone: form.phone.trim(),
          hotelEmail: form.hotelEmail.trim(),
          description: form.description.trim() || undefined,
          starRating: form.starRating,
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          adminName: form.adminName.trim(),
          adminEmail: form.adminEmail.trim(),
          adminPassword: form.adminPassword,
          adminPhone: form.adminPhone.trim() || undefined,
          bookingModel: form.bookingModel,
          domain: form.domain.trim() || undefined,
        },
      },
    });
  };

  // Success screen
  if (step === 5 && result) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-lg w-full mx-4 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to BlueStay!</h1>
            <p className="text-gray-600 mb-8">
              Your hotel has been successfully registered. You can now log in to
              your admin dashboard and start managing your property.
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Admin Email</span>
                <span className="font-medium text-sm">{result.adminEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Hotel URL</span>
                <span className="font-medium text-sm text-brand-600">
                  bluestay.in/{result.hotelSlug}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Status</span>
                <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-medium">
                  <AlertCircle size={14} />
                  Pending Activation
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-6">
              Our team will review and activate your hotel within 24 hours.
              You&apos;ll receive a confirmation email.
            </p>

            <div className="flex flex-col gap-3">
              <Button size="lg" asChild>
                <Link href="/admin">Go to Admin Dashboard</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/">Back to Homepage</Link>
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Header Banner */}
        <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 py-12 md:py-16">
          <div className="container-app text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-4">
                <Building2 size={14} />
                Hotel Partner Registration
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                List Your Property on BlueStay
              </h1>
              <p className="text-lg text-white/80 max-w-xl mx-auto">
                Complete the form below to register your hotel. It only takes a few
                minutes to get started.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stepper + Form */}
        <section className="container-app max-w-3xl -mt-8 pb-16 relative z-10">
          {/* Step Indicators */}
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const isActive = step === s.id;
                const isComplete = step > s.id;
                return (
                  <div key={s.id} className="flex items-center flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          isComplete
                            ? 'bg-green-100 text-green-600'
                            : isActive
                              ? 'bg-brand-600 text-white'
                              : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isComplete ? <Check size={18} /> : <Icon size={18} />}
                      </div>
                      <span
                        className={`hidden md:block text-sm font-medium ${
                          isActive ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-3 rounded ${
                          isComplete ? 'bg-green-300' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <StepWrapper key="step1">
                  <h2 className="text-xl font-semibold mb-1">Hotel Details</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Tell us about your property
                  </p>

                  <div className="space-y-5">
                    <FormField
                      label="Hotel Name"
                      required
                      error={errors.hotelName}
                    >
                      <Input
                        leftIcon={<Hotel size={18} />}
                        placeholder="e.g. Radhika Beach Resort"
                        value={form.hotelName}
                        onChange={(e) => updateField('hotelName', e.target.value)}
                        error={!!errors.hotelName}
                      />
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField label="Phone" required error={errors.phone}>
                        <Input
                          leftIcon={<Phone size={18} />}
                          placeholder="+91 98765 43210"
                          value={form.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          error={!!errors.phone}
                        />
                      </FormField>
                      <FormField
                        label="Contact Email"
                        required
                        error={errors.hotelEmail}
                      >
                        <Input
                          leftIcon={<Mail size={18} />}
                          placeholder="info@yourhotel.com"
                          value={form.hotelEmail}
                          onChange={(e) =>
                            updateField('hotelEmail', e.target.value)
                          }
                          error={!!errors.hotelEmail}
                        />
                      </FormField>
                    </div>

                    <FormField label="Description" error={errors.description}>
                      <textarea
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Brief description of your hotel (optional)"
                        value={form.description}
                        onChange={(e) =>
                          updateField('description', e.target.value)
                        }
                      />
                    </FormField>

                    <FormField label="Star Rating">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => updateField('starRating', r)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Star
                              size={28}
                              className={
                                r <= form.starRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </FormField>
                  </div>
                </StepWrapper>
              )}

              {step === 2 && (
                <StepWrapper key="step2">
                  <h2 className="text-xl font-semibold mb-1">Location</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Where is your property located?
                  </p>

                  <div className="space-y-5">
                    <FormField label="Address" required error={errors.address}>
                      <textarea
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                        rows={2}
                        placeholder="Full street address"
                        value={form.address}
                        onChange={(e) => updateField('address', e.target.value)}
                      />
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField label="City" required error={errors.city}>
                        <Input
                          placeholder="e.g. Diu"
                          value={form.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          error={!!errors.city}
                        />
                      </FormField>
                      <FormField label="State" required error={errors.state}>
                        <Input
                          placeholder="e.g. Gujarat"
                          value={form.state}
                          onChange={(e) => updateField('state', e.target.value)}
                          error={!!errors.state}
                        />
                      </FormField>
                    </div>

                    <FormField label="Pincode" required error={errors.pincode}>
                      <Input
                        placeholder="e.g. 362520"
                        value={form.pincode}
                        onChange={(e) => updateField('pincode', e.target.value)}
                        error={!!errors.pincode}
                        className="max-w-xs"
                      />
                    </FormField>
                  </div>
                </StepWrapper>
              )}

              {step === 3 && (
                <StepWrapper key="step3">
                  <h2 className="text-xl font-semibold mb-1">Admin Account</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Create your hotel admin login credentials
                  </p>

                  <div className="space-y-5">
                    <FormField
                      label="Full Name"
                      required
                      error={errors.adminName}
                    >
                      <Input
                        leftIcon={<User size={18} />}
                        placeholder="Hotel Manager Name"
                        value={form.adminName}
                        onChange={(e) => updateField('adminName', e.target.value)}
                        error={!!errors.adminName}
                      />
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        label="Admin Email"
                        required
                        error={errors.adminEmail}
                      >
                        <Input
                          leftIcon={<Mail size={18} />}
                          type="email"
                          placeholder="admin@yourhotel.com"
                          value={form.adminEmail}
                          onChange={(e) =>
                            updateField('adminEmail', e.target.value)
                          }
                          error={!!errors.adminEmail}
                        />
                      </FormField>
                      <FormField
                        label="Phone"
                        error={errors.adminPhone}
                      >
                        <Input
                          leftIcon={<Phone size={18} />}
                          placeholder="+91 98765 43210"
                          value={form.adminPhone}
                          onChange={(e) =>
                            updateField('adminPhone', e.target.value)
                          }
                        />
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        label="Password"
                        required
                        error={errors.adminPassword}
                      >
                        <Input
                          leftIcon={<Lock size={18} />}
                          type="password"
                          placeholder="Min 6 characters"
                          value={form.adminPassword}
                          onChange={(e) =>
                            updateField('adminPassword', e.target.value)
                          }
                          error={!!errors.adminPassword}
                        />
                      </FormField>
                      <FormField
                        label="Confirm Password"
                        required
                        error={errors.adminPasswordConfirm}
                      >
                        <Input
                          leftIcon={<Lock size={18} />}
                          type="password"
                          placeholder="Re-enter password"
                          value={form.adminPasswordConfirm}
                          onChange={(e) =>
                            updateField('adminPasswordConfirm', e.target.value)
                          }
                          error={!!errors.adminPasswordConfirm}
                        />
                      </FormField>
                    </div>
                  </div>
                </StepWrapper>
              )}

              {step === 4 && (
                <StepWrapper key="step4">
                  <h2 className="text-xl font-semibold mb-1">Preferences</h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Configure your booking model and optional custom domain
                  </p>

                  <div className="space-y-6">
                    <FormField label="Booking Model">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          {
                            value: 'DAILY',
                            label: 'Daily',
                            desc: 'Traditional night-based bookings',
                          },
                          {
                            value: 'HOURLY',
                            label: 'Hourly',
                            desc: 'Short-stay hourly bookings',
                          },
                          {
                            value: 'BOTH',
                            label: 'Both',
                            desc: 'Daily + hourly bookings',
                          },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              updateField('bookingModel', opt.value)
                            }
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              form.bookingModel === opt.value
                                ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="font-medium text-sm">
                              {opt.label}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {opt.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </FormField>

                    <FormField
                      label="Custom Domain"
                      hint="Optional — you can set this up later"
                    >
                      <Input
                        leftIcon={<Globe size={18} />}
                        placeholder="e.g. book.myhotel.com"
                        value={form.domain}
                        onChange={(e) => updateField('domain', e.target.value)}
                      />
                    </FormField>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-xl p-5 border">
                      <h3 className="font-medium text-sm text-gray-900 mb-3">
                        Registration Summary
                      </h3>
                      <div className="space-y-2 text-sm">
                        <SummaryRow label="Hotel" value={form.hotelName} />
                        <SummaryRow
                          label="Location"
                          value={`${form.city}, ${form.state}`}
                        />
                        <SummaryRow
                          label="Rating"
                          value={`${form.starRating} Star`}
                        />
                        <SummaryRow label="Admin" value={form.adminEmail} />
                        <SummaryRow
                          label="Booking"
                          value={form.bookingModel}
                        />
                        {form.domain && (
                          <SummaryRow label="Domain" value={form.domain} />
                        )}
                      </div>
                    </div>
                  </div>
                </StepWrapper>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {step > 1 ? (
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft size={16} />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  isLoading={loading}
                  size="lg"
                  variant="accent"
                >
                  <Building2 size={18} />
                  Register Hotel
                </Button>
              )}
            </div>
          </div>

          {/* Benefits sidebar */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <BenefitCard
              icon={<Check className="text-green-500" size={20} />}
              title="Free to Join"
              description="No upfront costs or monthly fees. Pay only a small commission per booking."
            />
            <BenefitCard
              icon={<Hotel className="text-brand-500" size={20} />}
              title="Your Own Website"
              description="Get a professional hotel booking page with your branding on BlueStay."
            />
            <BenefitCard
              icon={<Star className="text-amber-500" size={20} />}
              title="Grow Your Business"
              description="Reach thousands of travelers and increase your direct bookings."
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// ============================================
// Helper Components
// ============================================

function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function FormField({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && (
          <span className="text-gray-400 text-xs font-normal ml-2">{hint}</span>
        )}
      </Label>
      {children}
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value || '—'}</span>
    </div>
  );
}

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h4 className="font-medium text-sm">{title}</h4>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}
