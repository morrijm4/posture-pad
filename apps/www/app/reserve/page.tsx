"use client";

import posthog from 'posthog-js';
import { saveCustomer } from './saveCustomer';
import { useRouter } from 'next/navigation';
import { useState, type SubmitEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import disposableDomains from "disposable-email-domains";

const EMAIL_IS_VALID = /^[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const EMAIL_HAS_NO_PLUS = /^[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export default function Page() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState("");
    const [nameErrorMessage, setNameErrorMessage] = useState("");
    const { toast } = useToast();
    const router = useRouter();


    function isValidName(name: FormDataEntryValue | null): name is string {
        let msg: string;
        if (typeof name === 'string' && name != "") msg = ""
        else msg = "Please enter a name";
        setNameErrorMessage(msg);
        return !msg;
    }

    function isValidEmail(email: FormDataEntryValue | null): email is string {
        let msg: string;

        if (typeof email !== 'string' || !EMAIL_IS_VALID.test(email))
            msg = "Please enter a valid email";
        else if (!EMAIL_HAS_NO_PLUS.test(email))
            msg = "Email addresses with a '+' are not allowed";
        else if (disposableDomains.includes(email))
            msg = "Please use a permanent email address";
        else
            msg = ""

        setEmailErrorMessage(msg);
        return !msg;
    }

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setIsSubmitted(true);

        const input = new FormData(e.target);

        try {
            const name = input.get("name");
            const email = input.get("email");

            const validName = isValidName(name);
            const validEmail = isValidEmail(email);

            if (!validName || !validEmail)
                throw new ValidationError();

            await saveCustomer({
                name,
                email,
                sessionId: posthog.get_session_id(),
                distinctId: posthog.get_distinct_id(),
            });

            toast({
                title: "You’re on the list!",
                description: "You’ve joined the early access list for PosturePad. We’ll email you before pre-orders go live.",
                duration: 5000,
            });
            router.push('/');
        } catch {
            toast({
                title: "Oops!",
                description: "Looks like something went wrong when trying to add you to our early access list. We are terribly sorry! Please try again later.",
                duration: 5000,
            });
            posthog.capture('reserve_list_error');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className='flex flex-col h-[calc(100vh-73px)]'>
            <div className="flex items-center justify-center p-8">
                <div className="flex flex-col gap-8 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 p-6 md:p-8 rounded-xl max-w-lg w-full">
                    <h1 className="text-3xl md:text-4xl font-semibold">Almost there — reserve your PosturePad</h1>
                    <div className="space-y-3 text-base md:text-lg opacity-80">
                        <p>
                            PosturePad is currently in development. By joining the early access list, you&apos;ll be among the first to know when pre-orders and our Kickstarter go live.
                        </p>
                        <p className="text-sm md:text-base">
                            We&apos;ll send occasional updates about progress, launch timing, and ways to give feedback. <span className="font-medium">No payment is collected today.</span>
                        </p>
                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-2"
                        noValidate
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Input
                                    name="name"
                                    type="text"
                                    placeholder="Full name"
                                    autoComplete="name"
                                />
                                {isSubmitted && nameErrorMessage && (
                                    <span className={"text-xs text-red-400"}>
                                        {nameErrorMessage || "Name is required to sign up"}
                                    </span>
                                )}
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="Email"
                                    autoComplete="email"
                                />
                                {isSubmitted && emailErrorMessage && (
                                    <span className={"text-xs text-red-400"}>
                                        {emailErrorMessage || "Email is required to sign up"}
                                    </span>
                                )}
                            </div>
                        </div>

                        <Button
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                            variant="outline"
                            className="w-full hover:cursor-pointer"
                            type="submit"
                        >
                            Join the early access list
                        </Button>
                    </form>
                    <p className="text-xs text-neutral-500">
                        We&apos;ll only use your information to share updates about PosturePad and related launches. You can unsubscribe at any time.
                    </p>
                </div>
            </div>
        </div>
    );
}

class ValidationError extends Error { };
