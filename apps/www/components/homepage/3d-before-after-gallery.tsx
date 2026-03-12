export default function ThreeDBeforeAfterGallery() {
    return (
        <div className="relative w-full rounded-xl overflow-hidden">
            <video
                autoPlay
                loop
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
