import { useEffect, useRef } from "react";

export default function VLibras() {
    const widgetRef = useRef(null);
    const scriptLoaded = useRef(false);

    useEffect(() => {
        if (scriptLoaded.current) return;

        const script = document.createElement("script");
        script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
        script.async = true;

        script.onload = () => {
            if (window.VLibras) {
                new window.VLibras.Widget("https://vlibras.gov.br/app");
            }
        };

        document.body.appendChild(script);
        scriptLoaded.current = true;

        const style = document.createElement("style");
        style.innerHTML = `
      .vp-enabled { z-index: 999999 !important; }
      .vw-access-button { z-index: 999999 !important; }
    `;
        document.head.appendChild(style);

    }, []);

    return (
        <div ref={widgetRef}>
            <div vw="true" className="enabled">
                <div vw-access-button="true" className="active"></div>
                <div vw-plugin-wrapper="true">
                    <div className="vw-plugin-top-wrapper"></div>
                </div>
            </div>
        </div>
    );
}