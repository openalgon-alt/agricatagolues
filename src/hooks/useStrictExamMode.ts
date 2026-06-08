import { useEffect } from 'react';

export function useStrictExamMode(mode: 'inactive' | 'exam' | 'result', userDetails?: any) {
    useEffect(() => {
        if (mode === 'inactive') return;

        const preventContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const preventCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            overwriteClipboard();
        };

        const overwriteClipboard = () => {
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(
                        '[SECURITY BLOCKED] Screenshots and copy-paste are disabled during AgriCatalogues Exams.'
                    ).catch(() => {});
                }
            } catch (e) {}
        };

        const preventShortcuts = (e: KeyboardEvent) => {
            // Block modifier keys and print screen key by instantly showing black screen
            const blockedKeys = ['printscreen', 'meta', 'alt', 'control'];
            const key = e.key.toLowerCase();
            
            if (blockedKeys.includes(key)) {
                e.preventDefault();
                showFocusOverlay();
                overwriteClipboard();
                
                // If it's a key press and window remains focused, automatically hide after 1 second
                setTimeout(() => {
                    if (document.hasFocus()) {
                        hideFocusOverlay();
                    }
                }, 1000);
                return;
            }

            // Prevent Ctrl/Meta combinations just in case
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                showFocusOverlay();
                overwriteClipboard();
                setTimeout(() => {
                    if (document.hasFocus()) {
                        hideFocusOverlay();
                    }
                }, 1000);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const blockedKeys = ['printscreen', 'meta', 'alt', 'control'];
            const key = e.key.toLowerCase();
            if (blockedKeys.includes(key)) {
                showFocusOverlay();
                overwriteClipboard();
                setTimeout(() => {
                    if (document.hasFocus()) {
                        hideFocusOverlay();
                    }
                }, 1000);
            }
        };

        // DOM Overlay for focus lost (only for exam mode)
        const overlayId = 'strict-exam-focus-overlay';
        const styleId = 'strict-exam-mode-styles';

        const showFocusOverlay = () => {
            if (mode !== 'exam') return;
            
            // Turn all exam content completely black by applying brightness filter on body
            if (document.body) {
                document.body.style.filter = 'brightness(0)';
                document.body.style.transition = 'filter 0.05s ease';
            }

            let overlay = document.getElementById(overlayId);
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = overlayId;
                overlay.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #262626; user-select: none; font-family: system-ui, -apple-system, sans-serif;">
                        <span style="font-size: 14px; font-weight: 500; letter-spacing: 0.05em;">[ Exam Paused - Click Screen to Resume ]</span>
                    </div>
                `;
                // Set inline styles for overlay container - 100% solid pitch black
                Object.assign(overlay.style, {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: '#000000',
                    zIndex: '2147483647', // Maximum possible 32-bit integer z-index
                    cursor: 'pointer'
                });
                
                // Append to documentElement so it doesn't get affected by document.body's filter: brightness(0)
                document.documentElement.appendChild(overlay);

                // Clicking anywhere on the black screen returns focus and hides it
                overlay.addEventListener('click', () => {
                    window.focus();
                    hideFocusOverlay();
                });
            }
            overwriteClipboard();
        };

        const hideFocusOverlay = () => {
            // Restore document.body brightness/filters
            if (document.body) {
                document.body.style.filter = '';
            }

            const overlay = document.getElementById(overlayId);
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        };

        const handleFocus = () => {
            hideFocusOverlay();
            overwriteClipboard();
        };

        const handleBlur = () => {
            if (mode === 'exam') {
                showFocusOverlay();
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (mode === 'exam') {
                    showFocusOverlay();
                }
            } else {
                hideFocusOverlay();
            }
        };

        // Blur screen heavily when mouse leaves the viewport (prohibits reading/screenshotting from outside)
        const handleMouseLeave = () => {
            if (mode === 'exam' && document.body) {
                const overlay = document.getElementById(overlayId);
                if (!overlay) {
                    document.body.style.filter = 'blur(15px) brightness(0.2)';
                }
            }
        };

        const handleMouseEnter = () => {
            if (mode === 'exam' && document.body) {
                const overlay = document.getElementById(overlayId);
                if (!overlay) {
                    document.body.style.filter = '';
                }
            }
        };

        // Add event listeners
        document.addEventListener('contextmenu', preventContextMenu);
        document.addEventListener('keydown', preventShortcuts);
        document.addEventListener('keyup', handleKeyUp);
        document.addEventListener('copy', preventCopy);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        // Inject styles for print media and user-select
        let styleEl = document.getElementById(styleId) as HTMLStyleElement;
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.innerHTML = `
                /* Prevent text selection */
                body {
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                }

                /* Hide all content when printing or saving as PDF */
                @media print {
                    html, body {
                        display: none !important;
                    }
                    * {
                        display: none !important;
                    }
                }
            `;
            document.head.appendChild(styleEl);
        }

        // Check if window is already blurred when hook is registered
        if (mode === 'exam' && !document.hasFocus()) {
            showFocusOverlay();
        }

        return () => {
            // Cleanup
            document.removeEventListener('contextmenu', preventContextMenu);
            document.removeEventListener('keydown', preventShortcuts);
            document.removeEventListener('keyup', handleKeyUp);
            document.removeEventListener('copy', preventCopy);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
            
            hideFocusOverlay();

            if (styleEl && styleEl.parentNode) {
                styleEl.parentNode.removeChild(styleEl);
            }
        };
    }, [mode]);
}
