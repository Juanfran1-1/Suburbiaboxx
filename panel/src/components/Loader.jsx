import { useEffect, useRef } from 'react';
import logo from "../assets/logo-suburbia.jpg";

export default function Loader({ onFilled }) {
    const fillRef = useRef(null);

    useEffect(() => {
        const fill = fillRef.current;
        if (!fill) return;

        let startTimer;
        let doneTimer;
        let frame;
        let paintFrame;

        fill.style.height = '0%';
        fill.style.transition = 'height 1.8s ease-in-out';

        paintFrame = requestAnimationFrame(() => {
            frame = requestAnimationFrame(() => {
                startTimer = setTimeout(() => {
                    fill.style.transition = 'height 10s linear';
                    fill.style.height = '100%';
                }, 100);

                fill.style.transition = 'height 0.4s ease-out';
                fill.style.height = '100%';

                doneTimer = setTimeout(() => {
                    onFilled?.();
                }, 500);
            });
        });

        return () => {
            cancelAnimationFrame(paintFrame);
            cancelAnimationFrame(frame);
            clearTimeout(startTimer);
            clearTimeout(doneTimer);
        };
    }, [onFilled]);

    return (
        <div className="loader-content">
            <img src={logo} className="logo-base" alt="Suburbia" />
            <div className="logo-fill-container" ref={fillRef}>
                <img src={logo} className="logo-revealed" alt="Suburbia" />
            </div>
        </div>
    );
}
