(function() {
    'use strict';

    let isModalOpen = false;
    let modal = null;
    let iframe = null;
    let widgetButton = null;

    // Create the floating widget button
    function createAnalysisWidget() {
        // Prevent multiple instances
        if (document.getElementById('analysis-widget-button')) {
            return;
        }

        // Create the main button container
        widgetButton = document.createElement('div');
        widgetButton.id = 'analysis-widget-button';
        widgetButton.style.cssText = `
            position: fixed;
            top: 48%; 
            right: 0px;
            transform: translateY(-50%);
            background: linear-gradient(135deg, #6879EF, #5a6ad8);
            color: white;
            padding: 15px 8px;
            border-radius: 25px 0 0 25px;
            cursor: pointer;
            z-index: 9999;
            box-shadow: -2px 2px 15px rgba(104, 121, 239, 0.3);
            transition: all 0.3s ease;
            font-family: Arial, sans-serif;
            font-size: 11px;
            font-weight: bold;
            writing-mode: vertical-lr;
            text-orientation: mixed;
            letter-spacing: 1px;
            min-height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
        `;

        widgetButton.innerHTML = 'MONITOR LAYANAN';

        // Add hover effect
        widgetButton.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(135deg, #5a6ad8, #4c5bc9)';
            this.style.transform = 'translateY(-50%) translateX(-5px)';
            this.style.boxShadow = '-4px 4px 20px rgba(104, 121, 239, 0.4)';
        });

        widgetButton.addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(135deg, #6879EF, #5a6ad8)';
            this.style.transform = 'translateY(-50%)';
            this.style.boxShadow = '-2px 2px 15px rgba(104, 121, 239, 0.3)';
        });

        // Create popup modal
        modal = document.createElement('div');
        modal.id = 'analysis-modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;

        // Create modal content
        // --- BAGIAN YANG DIUBAH ---
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            position: absolute;
            top: 10%; /* Menyisakan 10% di bagian atas */
            left: 0; /* Merapat ke kiri */
            width: 100%; /* Lebar full layar */
            height: 90%; /* Sisa tinggi layar (100% - 10%) */
            background: white;
            border-radius: 20px 20px 0 0; /* Radius hanya di atas karena bawah menempel layar */
            box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3); /* Efek bayangan ke atas */
            overflow: hidden;
            display: flex;
            flex-direction: column;
            animation: slideUp 0.3s ease-out; /* Tambahan animasi halus opsional */
        `;

        // Create floating close button
        const closeBtn = document.createElement('div');
        closeBtn.id = 'close-modal';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 20px;
            width: 35px;
            height: 35px;
            background: #6879EF;
            color: white;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10001;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
            transition: background 0.2s ease;
        `;

        // Hover effect for close button
        closeBtn.addEventListener('mouseenter', () => closeBtn.style.background = '#4c5bc9');
        closeBtn.addEventListener('mouseleave', () => closeBtn.style.background = '#6879EF');

        // Create iframe container
        const iframeContainer = document.createElement('div');
        iframeContainer.style.cssText = `
            flex: 1;
            position: relative;
            background: #f5f5f5;
            height: 100%;
            width: 100%;
        `;

        // Create iframe (persistent)
        iframe = document.createElement('iframe');
        iframe.src = '/analytics-data';
        iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            background: white;
            display: block;
        `;

        // Create loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            font-family: Arial, sans-serif;
            color: #6879EF;
        `;
        loadingDiv.innerHTML = `
            <div style="border: 4px solid #f3f3f3; border-top: 4px solid #6879EF; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
            <div>Memuat data analisis...</div>
        `;

        // Add CSS animation for loading spinner & modal slide
        if (!document.getElementById('widget-styles')) {
            const style = document.createElement('style');
            style.id = 'widget-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        // Remove loading when iframe loads
        iframe.addEventListener('load', function() {
            loadingDiv.style.display = 'none';
        });

        // Assemble modal
        iframeContainer.appendChild(loadingDiv);
        iframeContainer.appendChild(iframe);
        modalContent.appendChild(closeBtn); // Appending floating close button
        modalContent.appendChild(iframeContainer);
        modal.appendChild(modalContent);

        // Function to open modal
        function openModal() {
            if (isModalOpen) return;
            
            isModalOpen = true;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        // Function to close modal
        function closeModal() {
            if (!isModalOpen) return;
            
            isModalOpen = false;
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // Add click event to button
        widgetButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openModal();
        });

        // Close button event
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Close modal with ESC key
        function handleEscape(e) {
            if (e.key === 'Escape' && isModalOpen) {
                closeModal();
            }
        }
        document.addEventListener('keydown', handleEscape);

        // Cleanup on page unload
        window.addEventListener('beforeunload', function() {
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            if (widgetButton && widgetButton.parentNode) {
                widgetButton.parentNode.removeChild(widgetButton);
            }
        });

        // Append elements to body
        document.body.appendChild(widgetButton);
        document.body.appendChild(modal);
    }

    // Cleanup function for existing instances
    function cleanup() {
        const existingButton = document.getElementById('analysis-widget-button');
        const existingModal = document.getElementById('analysis-modal');
        
        if (existingButton) existingButton.remove();
        if (existingModal) existingModal.remove();
    }

    // Initialize when DOM is ready
    function init() {
        cleanup(); // Remove any existing instances
        createAnalysisWidget();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();