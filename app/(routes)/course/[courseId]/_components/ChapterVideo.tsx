
// CourseComposition.tsx
import React, { useEffect, useMemo, useRef } from "react";
import {
    AbsoluteFill,
    Sequence,
    Audio,
    useVideoConfig,
    useCurrentFrame,
} from "remotion";

/* ---------------------------------- Types --------------------------------- */

type CaptionChunk = {
    timestamp: [number, number];
};

type Slide = {
    slideId: string;
    html: string;
    audioFileUrl: string;
    revelData?: string[];
    caption?: {
        chunks: CaptionChunk[];
    };
};

/* ----------------------- Reveal runtime (iframe side) ------------------------ */

const REVEAL_RUNTIME_SCRIPT = `
<script>
(function () {
  function reset() {
    document.querySelectorAll(".reveal").forEach(el =>
      el.classList.remove("is-on")
    );
  }

  function reveal(id) {
    var el = document.querySelector("[data-reveal='" + id + "']");
    if (el) el.classList.add("is-on");
  }

  window.addEventListener("message", function (e) {
    var msg = e.data;
    if (!msg) return;
    if (msg.type === "RESET") reset();
    if (msg.type === "REVEAL") reveal(msg.id);
  });
})();
</script>
`;

const injectRevealRuntime = (html: string) => {
    if (html.includes("</body>")) {
        return html.replace("</body>", `${REVEAL_RUNTIME_SCRIPT}</body>`);
    }
    return html + REVEAL_RUNTIME_SCRIPT;
};

/* ----------------------- Slide with reveal control -------------------------- */

const SlideIFrameWithReveal = ({ slide }: { slide: Slide }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const time = frame / fps;

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [ready, setReady] = React.useState(false);

    const revealPlan = useMemo(() => {
        const ids = slide.revelData ?? [];
        const chunks = slide.caption?.chunks ?? [];
        return ids.map((id, i) => ({
            id,
            at: chunks[i]?.timestamp?.[0] ?? 0,
        }));
    }, [slide.revelData, slide.caption]);

    // ✅ On load: mark ready + do a clean reset once
    const handleLoad = () => {
        setReady(true);
        iframeRef.current?.contentWindow?.postMessage({ type: "RESET" }, "*");
    };

    // ✅ SCRUB-SAFE: Every render tick, ensure all items that should be visible are visible
    useEffect(() => {
        if (!ready) return;
        const win = iframeRef.current?.contentWindow;
        if (!win) return;

        // If user scrubbed backward, we need to re-apply from scratch:
        // simplest: RESET then re-REVEAL all steps up to "time"
        win.postMessage({ type: "RESET" }, "*");

        for (const step of revealPlan) {
            if (time >= step.at) {
                win.postMessage({ type: "REVEAL", id: step.id }, "*");
            }
        }
    }, [time, ready, revealPlan]);

    return (
        <AbsoluteFill>
            <iframe
                ref={iframeRef}
                srcDoc={injectRevealRuntime(slide.html)}
                onLoad={handleLoad}
                sandbox="allow-scripts allow-same-origin"
                style={{ width: 1280, height: 720, border: "none" }}
            />
            <Audio src={slide.audioFileUrl} />
        </AbsoluteFill>
    );
};


/* -------------------------- Course Composition ------------------------------- */
type Props = {
    slides: Slide[];
    durationsBySlideId: Record<string, number>;
}
export const CourseComposition = ({ slides, durationsBySlideId }: Props) => {
    const { fps } = useVideoConfig();

    const GAP_SECONDS = 1;
    const GAP_FRAMES = Math.round(GAP_SECONDS * fps);

    const timeline = useMemo(() => {
        let from = 0;

        return slides.map((slide) => {
            const dur = durationsBySlideId[slide.slideId] ?? Math.ceil(6 * fps);

            const item = { slide, from, dur };

            // ✅ after slide ends, wait 2s before next slide starts
            from += dur + GAP_FRAMES;

            return item;
        });
    }, [slides, durationsBySlideId, fps]);

    return (
        <AbsoluteFill style={{ backgroundColor: "#000" }}>
            {timeline.map(({ slide, from, dur }) => (
                <Sequence key={from} from={from} durationInFrames={dur}>
                    <SlideIFrameWithReveal slide={slide} />
                </Sequence>
            ))}
        </AbsoluteFill>
    );
};

