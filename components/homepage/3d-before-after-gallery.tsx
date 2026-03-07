'use client';

import { useEffect, useRef } from "react"

export default function ThreeDBeforeAfterGallery() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let lastX = 0;
        let ticking = false;

        function updateVideoTime() {
            if (video && !isNaN(video.duration)) {
                video.currentTime = (lastX / window.innerWidth) * video.duration;
            }
            ticking = false;
        }


        const controller = new AbortController()
        window.addEventListener('mousemove', (e) => {
            lastX = e.clientX;

            if (!ticking) {
                window.requestAnimationFrame(updateVideoTime);
                ticking = true;
            }
        }, { signal: controller.signal });
        return () => controller.abort();
    }, []);

    return (
        <div className="relative w-full rounded-xl overflow-hidden">
            <video
                ref={videoRef}
                muted
                playsInline
                preload="auto"
                className="h-full w-full object-cover"
            >
                <source src="/homepage/Rotation.mov" />
            </video>
        </div>
    )
}

