import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Please enter a valid email address').max(255, 'Email must be less than 255 characters'),
  subject: z.string().trim().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
});

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const result = contactSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("https://formsubmit.co/ajax/editor@agricatalogues.in", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          _subject: `New Contact: ${formData.subject}`, // FormSubmit specific
          _template: 'table' // FormSubmit specific
        })
      });

      if (!response.ok) throw new Error("Failed to send message");

      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: 'Message Sent!',
        description: 'Thank you for contacting us. We will respond within 48 hours.',
      });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      toast({
        title: 'Error sending message',
        description: 'Please try again later or email us directly.',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | AgriScience Research Journal</title>
        <meta
          name="description"
          content="Contact the editorial team at AgriScience Research Journal. Reach out for manuscript inquiries, collaboration opportunities, or general questions about agricultural research publication."
        />
        <link rel="canonical" href="https://agrisciencejournal.org/contact" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "AgriScience Research Journal",
            "url": "https://agrisciencejournal.org",
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "editor@agricatalogues.in",
              "contactType": "editorial",
              "availableLanguage": "English"
            },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Saddahalli, Palicherlu",
              "addressLocality": "Sidlaghatta- Chikkaballapur",
              "addressRegion": "Karnataka",
              "postalCode": "562105",
              "addressCountry": "IN"
            }
          })}
        </script>
      </Helmet>
      <Layout>
        {/* Header */}
        <section className="bg-primary py-16 md:py-24">
          <div className="container-magazine">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="text-primary-foreground mb-4">Contact Us</h1>
              <p className="text-primary-foreground/80 text-lg md:text-xl">
                Have questions about submissions, subscriptions, or collaborations?
                We're here to help. Reach out to our editorial team.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="section-spacing bg-background">
          <div className="container-magazine">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-foreground mb-6">Get in Touch</h2>
                <p className="text-muted-foreground mb-8">
                  Our editorial team is available Monday through Friday, 9:00 AM to 5:00 PM EST.
                  We aim to respond to all inquiries within 48 hours.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      icon: Mail,
                      title: 'Email',
                      content: 'editor@agricatalogues.in',
                      href: 'mailto:editor@agricatalogues.in',
                    },
                    {
                      icon: Phone,
                      title: 'Phone',
                      content: '+91 9148942104',
                      href: 'tel:+919148942104',
                    },
                    {
                      icon: MapPin,
                      title: 'Address',
                      content: 'Saddahalli, Palicherlu\nSidlaghatta- Chikkaballapur\n562105, Karnataka',
                      href: null,
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            {item.content}
                          </a>
                        ) : (
                          <p className="text-muted-foreground whitespace-pre-line">{item.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map Placeholder */}
                <div className="mt-8 aspect-video bg-muted rounded-xl overflow-hidden">
                  <iframe
                    src="https://maps.google.com/maps?q=13.4821459,77.889948&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="AgriScience Journal Office Location"
                  />
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-card rounded-xl p-6 md:p-8 shadow-elevated">
                  <h2 className="text-foreground text-2xl mb-2">Send a Message</h2>
                  <p className="text-muted-foreground mb-6">
                    Fill out the form below and we'll get back to you shortly.
                  </p>

                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-display font-bold text-foreground text-xl mb-2">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Thank you for reaching out. We'll respond within 48 hours.
                      </p>
                      <Button onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ name: '', email: '', subject: '', message: '' });
                      }}>
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                          Full Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          className={errors.name ? 'border-destructive' : ''}
                          required
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive mt-1">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                          className={errors.email ? 'border-destructive' : ''}
                          required
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1.5">
                          Subject *
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="What is your inquiry about?"
                          className={errors.subject ? 'border-destructive' : ''}
                          required
                        />
                        {errors.subject && (
                          <p className="text-sm text-destructive mt-1">{errors.subject}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
                          Message *
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Please describe your inquiry in detail..."
                          rows={5}
                          className={errors.message ? 'border-destructive' : ''}
                          required
                        />
                        {errors.message && (
                          <p className="text-sm text-destructive mt-1">{errors.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full gap-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          'Sending...'
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Contact;
