import { useEffect, useRef, memo } from 'react';

export default memo(function TradingViewWidget({ symbol }) {
    const container = useRef();

    useEffect(
        () => {
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = `
        {
          "autosize": true,
          "symbol": "${symbol}",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "backgroundColor": "rgba(13, 2, 24, 1)",
          "gridColor": "rgba(255, 255, 255, 0.05)",
          "hide_top_toolbar": true,
          "hide_legend": false,
          "save_image": false,
          "calendar": false,
          "hide_volume": true,
          "support_host": "https://www.tradingview.com"
        }`;

            // Clear previous widget
            if (container.current) {
                container.current.innerHTML = '';
                container.current.appendChild(script);
            }

            return () => {
                if (container.current) container.current.innerHTML = '';
            };
        },
        [symbol]
    );

    return (
        <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
            <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
        </div>
    );
});
