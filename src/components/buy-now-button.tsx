'use client';

import posthog from 'posthog-js';

export function BuyNowButton() {
    function handleClick() {
        posthog.capture('buy_now_clicked');
    }

    return (
        <div className="flex justify-center w-full">
            <button onClick={handleClick} className="bg-blue-400 rounded-2xl p-4 text-xl font-semibold hover:bg-blue-500 hover:cursor-pointer">
                Buy Now
            </button>
        </div>
    );
}
