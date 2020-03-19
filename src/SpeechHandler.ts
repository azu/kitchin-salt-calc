/**
 * Modeless VUI
 * Object -> Verb
 */
export const createSpeechHand = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || window.SpeechRecognition;
    // @ts-ignore
    if (typeof SpeechRecognition === "undefiend") {
        return () => {};
    }
    const recognition = new SpeechRecognition();
    recognition.addEventListener("result", (event: any) => {
        console.log(event.results);
    });
    recognition.continuous = true;
    recognition.start();
    return () => {
        recognition.stop();
    };
};
