'use client';

import { toast } from 'sonner';
import { useState } from 'react';
import { Send, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

import { sendEmailToUser } from '@/lib/api/email';
import { sendEmailSchema, type SendEmailInput } from '@/lib/validations/email.schema';

export function SendEmailForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SendEmailInput>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: {
      subject: '',
      message: '',
      actionUrl: '',
      actionText: '',
    },
  });

  const onSubmit = async (data: SendEmailInput) => {
    try {
      setIsLoading(true);
      await sendEmailToUser({
        subject: data.subject,
        message: data.message,
        actionUrl: data.actionUrl || undefined,
        actionText: data.actionText || undefined,
      });
      toast.success('Email sent successfully!');
      form.reset();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <CardTitle>Send Email to Your Account</CardTitle>
        </div>
        <CardDescription>
          Send an email notification to your registered email address. This is useful for testing
          email functionality or sending yourself reminders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Email subject" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Your email message..."
                      className="min-h-[150px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    The message will be sent to your registered email address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="actionUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        type="url"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>Optional link to include in the email.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action Button Text (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Click Here" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Text for the action button.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                'Sending...'
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
