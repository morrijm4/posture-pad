import Image from 'next/image';

export default function Home() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-4xl flex-col items-center gap-y-24 py-32 px-16 bg-white dark:bg-black sm:items-start">
                <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
                    <h1 className="max-w-xs text-5xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                        PosturePad
                    </h1>
                    <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                        Enabling Postural Alignment With Ambient Devices
                    </p>
                </div>
                <div className='flex gap-x-14'>
                    <Image src="/posture-pad.png" alt="PosturePad" width={350} height={426} className='rounded-2xl' />
                    <ul className='list-disc list-outside text-xl flex flex-col justify-between'>
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
                {/*
                <div>
                    <h2 className='text-3xl font-semibold'>
                        Integrations
                    </h2>
                    <div className='flex justify-between'>
                        <div>
                            <h3>
                                Philips Hues
                            </h3>
                        </div>
                        <div>
                            <h3>
                                Nest, Alexa, etc.
                            </h3>
                        </div>
                        <div>
                            <h3>
                                Laptops, Phones, etc.
                            </h3>
                        </div>
                    </div>
                </div>
                */}
            </main>
        </div>
    );
}
