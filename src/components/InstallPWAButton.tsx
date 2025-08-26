import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { toast } from "./ui/use-toast";

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const InstallPWAButton = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsVisible(true);
        };
        window.addEventListener("beforeinstallprompt", handler as EventListener);
        return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
    }, []);

    const onInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        try {
            const choice = await deferredPrompt.userChoice;
            if (choice?.outcome === "accepted") {
                setIsVisible(false);
                toast({
                    title: "App installed successfully",
                    description: "You can now access the app from your home screen.",
                });
            }
        } finally {
            setDeferredPrompt(null);
        }
    };

    if (!isVisible) return null;
    return (
        <Button onClick={onInstall} variant="secondary" size="sm">
            Install App
        </Button>
    );
};

export default InstallPWAButton;