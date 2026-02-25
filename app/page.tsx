import { type PropsWithChildren } from 'react';
import Image, { ImageProps } from 'next/image';

export default function Home() {
    return (
        <div className="flex min-h-dvh items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex w-full max-w-4xl flex-col items-center gap-y-24 py-32 px-16 mb-48 bg-white dark:bg-black sm:items-start">
                <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
                    <h1 className="max-w-xs text-5xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                        PosturePad
                    </h1>
                    <P>
                        Enabling Postural Alignment With Ambient Devices
                    </P>
                </div>
                <div className="flex flex-col md:flex-row gap-14">
                    <ImageWrapper
                        src="/posture-pad.png"
                        alt="PosturePad"
                        width={350}
                        height={426}
                        className="rounded-2xl"
                        loading="eager"
                    />
                    <ul className="list-disc list-outside text-xl flex flex-col justify-between leading-8 gap-y-4">
                        <li>
                            A portable haptic sleeve that detects posture using embedded sensors and machine learning.
                        </li>
                        <li>
                            Provides gentle ambient cues such as embedded haptics or lighting to condition awareness and better habits.
                        </li>
                        <li>
                            Pairs with software that provides posture history, behavioral insights, and scoring.
                        </li>
                        <li>
                            Supports IoT integrations for other devices.
                        </li>
                    </ul>
                </div>
                <div className='flex flex-col gap-y-16 w-full items-center md:items-start'>
                    <h2 className="text-4xl font-semibold">
                        Integrations
                    </h2>
                    <div className="flex flex-col md:flex-row justify-between gap-y-6 w-full">
                        <Card>
                            <ImageWrapper src="/philips2.png" alt="Philips Hues" width={200} height={152} />
                            <H3>
                                Philips Hues
                            </H3>
                            <P>
                                For ambient color shifts.
                            </P>
                        </Card>
                        <Card>
                            <ImageWrapper src="/alexa2.png" alt="Alexa" width={200} height={152} />
                            <H3>
                                Nest, Alexa, etc.
                            </H3>
                            <P>
                                For voice interfaces.
                            </P>
                        </Card>
                        <Card>
                            <ImageWrapper src="/laptop2.png" alt="Laptop" width={200} height={152} />
                            <H3>
                                Laptops, Phones, etc.
                            </H3>
                            <P>
                                For software sync.
                            </P>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Card({ children }: PropsWithChildren) {
    return (
        <div className='flex flex-col items-center gap-y-1'>
            {children}
        </div>
    );
}

function ImageWrapper(props: ImageProps) {
    return <Image {...props} className='rounded-2xl' />
}

function P({ children }: PropsWithChildren) {
    return <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">{children}</p>
}

function H3({ children }: PropsWithChildren) {
    return <h3 className='text-lg leading-8 font-semibold'>{children}</h3>
}
