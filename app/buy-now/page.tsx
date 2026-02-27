"use client";

import posthog from 'posthog-js';
import { useRouter } from 'next/navigation';
import { useState, type SubmitEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import disposableDomains from "disposable-email-domains";

// emailIsValid: (value: string) =>
//     .test(value) ||
//     "",
// emailDoesntHavePlus: (value: string) =>
//     .test(value) ||
//     "Email addresses with a '+' are not allowed",
// emailIsntDisposable: (value: string) =>
//     !disposableDomains.includes(value.split("@")[1]) ||
//     "Please use a permanent email address",

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

    function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
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

            posthog.capture('newsletter_signup', { name, email });

            toast({
                title: "Signed up!",
                description: "You are now apart of our newsletter to recieve updates about PosturePad.",
                duration: 5000,
            });
            router.push('/');
        } catch {
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className='flex flex-col h-[calc(100vh-73px)]'>
            <div className="flex items-center justify-center p-8">
                <div className="flex flex-col gap-8 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 p-4 rounded-xl max-w-lg w-full">
                    <h1 className="text-4xl">Thank you!</h1>
                    <p className="text-xl opacity-60">
                        We are so glad that you would like to purchase PosturePad. Currently our product is in development but, you can sign up for our newsletter to stay up-to-date on our progress!
                    </p>
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
                            Sign up
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

class ValidationError extends Error { };
