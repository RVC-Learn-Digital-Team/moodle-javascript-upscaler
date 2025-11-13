/**
 * Moodle Image Zoom with Upscaling
 * Works with <img> tags and background-image divs
 * No Bootstrap dependency
 * To insert into administrator->appearance-extra-html, paste at the bottom and add <script></script> tags around it.
 */

(function() {
    'use strict';

    const CONFIG = {
        minImageSize: 100,
        upscaleEnabled: true,        // Set to false to disable upscaling
        upscaleWidth: 2048,
        upscaleHeight: 2048,
        iconSize: 32,
        iconOffset: 8
    };

    const styles = `
        .image-zoom-container {
            position: relative;
            display: inline-block;
        }
        
        .image-zoom-icon {
            position: absolute;
            width: ${CONFIG.iconSize}px;
            height: ${CONFIG.iconSize}px;
            background: rgba(0, 102, 204, 0.85);
            border: 2px solid white;
            border-radius: 4px;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 20px;
            transition: all 0.2s ease;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        
        .image-zoom-icon:hover {
            background: rgba(0, 102, 204, 1);
            transform: scale(1.15);
        }
        
        .image-zoom-icon.show {
            display: flex;
        }
        
        .image-zoom-icon.processing::after {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            border: 3px solid white;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .image-zoom-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 9999;
            align-items: center;
            justify-content: center;
            cursor: zoom-out;
        }
        
        .image-zoom-overlay.active {
            display: flex;
        }
        
        .image-zoom-overlay img {
            max-width: 90%;
            max-height: 90vh;
            object-fit: contain;
        }
        
        .image-zoom-close {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 2px solid #ccc;
            border-radius: 4px;
            width: 44px;
            height: 44px;
            font-size: 28px;
            cursor: pointer;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #333;
        }
        
        .image-zoom-close:hover {
            background: #f0f0f0;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    const overlayHTML = `
        <div class="image-zoom-overlay" id="imageZoomOverlay">
            <button class="image-zoom-close" id="imageZoomClose" aria-label="Close">×</button>
            <img src="" alt="Zoomed image" id="zoomedImage">
        </div>
    `;

    document.addEventListener('DOMContentLoaded', function() {
        document.body.insertAdjacentHTML('beforeend', overlayHTML);
        
        const overlay = document.getElementById('imageZoomOverlay');
        const closeBtn = document.getElementById('imageZoomClose');
        
        overlay.addEventListener('click', closeOverlay);
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeOverlay();
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeOverlay();
        });
        
        initImageZoom();
        
        const observer = new MutationObserver(initImageZoom);
        observer.observe(document.body, { childList: true, subtree: true });
    });

    function initImageZoom() {
        // Handle <img> tags
        const images = document.querySelectorAll('img:not(.image-zoom-processed)');
        images.forEach(function(img) {
            if (!img.complete) {
                img.addEventListener('load', function() { processImage(img); });
            } else {
                processImage(img);
            }
        });
        
        // Handle background-image divs
        const bgDivs = document.querySelectorAll('[style*="background-image"]:not(.image-zoom-processed)');
        bgDivs.forEach(function(div) {
            processBackgroundImage(div);
        });
    }

    function processImage(img) {
        if (img.naturalWidth < CONFIG.minImageSize || img.naturalHeight < CONFIG.minImageSize) {
            img.classList.add('image-zoom-processed');
            return;
        }
        
        if (img.classList.contains('image-zoom-processed')) return;
        img.classList.add('image-zoom-processed');
        
        addZoomIcon(img, img.src);
    }

    function processBackgroundImage(div) {
        div.classList.add('image-zoom-processed');
        
        const style = div.style.backgroundImage;
        const urlMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (!urlMatch) return;
        
        const imgUrl = urlMatch[1];
        
        // Check image dimensions
        const testImg = new Image();
        testImg.onload = function() {
            if (testImg.naturalWidth >= CONFIG.minImageSize && testImg.naturalHeight >= CONFIG.minImageSize) {
                addZoomIcon(div, imgUrl, true);
            }
        };
        testImg.src = imgUrl;
    }

    function addZoomIcon(element, imgSrc, isBackgroundImage = false) {
        const zoomIcon = document.createElement('div');
        zoomIcon.className = 'image-zoom-icon';
        zoomIcon.innerHTML = '+';
        zoomIcon.title = 'Click to enlarge';
        zoomIcon.setAttribute('role', 'button');
        zoomIcon.setAttribute('aria-label', 'Enlarge image');
        
        let container;
        
        if (isBackgroundImage) {
            // For background images, make the element itself the container
            element.style.position = 'relative';
            element.appendChild(zoomIcon);
            container = element;
        } else {
            // For <img> tags, wrap in a container
            container = element.parentElement;
            if (!container.classList.contains('image-zoom-container')) {
                const wrapper = document.createElement('span');
                wrapper.className = 'image-zoom-container';
                element.parentNode.insertBefore(wrapper, element);
                wrapper.appendChild(element);
                wrapper.appendChild(zoomIcon);
                container = wrapper;
            } else {
                container.appendChild(zoomIcon);
            }
        }
        
        element.addEventListener('mouseenter', function(e) {
            positionIcon(e, element, zoomIcon);
            zoomIcon.classList.add('show');
        });
        
        element.addEventListener('mousemove', function(e) {
            positionIcon(e, element, zoomIcon);
        });
        
        container.addEventListener('mouseleave', function() {
            zoomIcon.classList.remove('show');
        });
        
        zoomIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (CONFIG.upscaleEnabled) {
                zoomIcon.classList.add('processing');
                zoomIcon.innerHTML = '';
                upscaleAndShow(imgSrc).finally(() => {
                    zoomIcon.classList.remove('processing');
                    zoomIcon.innerHTML = '+';
                });
            } else {
                showOverlay(imgSrc);
            }
        });
    }

    function positionIcon(e, element, icon) {
        const rect = element.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const isLeft = mouseX < rect.width / 2;
        const isTop = mouseY < rect.height / 2;
        const offset = CONFIG.iconOffset + 'px';
        
        icon.style.top = isTop ? offset : 'auto';
        icon.style.bottom = isTop ? 'auto' : offset;
        icon.style.left = isLeft ? offset : 'auto';
        icon.style.right = isLeft ? 'auto' : offset;
    }

    function upscaleAndShow(imgSrc) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = function() {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    const aspectRatio = img.width / img.height;
                    let targetWidth = CONFIG.upscaleWidth;
                    let targetHeight = CONFIG.upscaleHeight;
                    
                    if (aspectRatio > 1) {
                        targetHeight = targetWidth / aspectRatio;
                    } else {
                        targetWidth = targetHeight * aspectRatio;
                    }
                    
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    const drawWidth = canvas.width;
                    const drawHeight = img.height * (drawWidth / img.width);
                    const x = (canvas.width - drawWidth) / 2;
                    const y = (canvas.height - drawHeight) / 2;
                    
                    ctx.drawImage(img, x, y, drawWidth, drawHeight);
                    
                    const dataUrl = canvas.toDataURL('image/png', 0.95);
                    showOverlay(dataUrl);
                } catch (error) {
                    console.error('Upscale failed:', error);
                    showOverlay(imgSrc);
                }
                resolve();
            };
            
            img.onerror = function() {
                showOverlay(imgSrc);
                resolve();
            };
            
            img.src = imgSrc;
        });
    }

    function showOverlay(imgSrc) {
        const overlay = document.getElementById('imageZoomOverlay');
        const zoomedImg = document.getElementById('zoomedImage');
        
        zoomedImg.src = imgSrc;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeOverlay() {
        const overlay = document.getElementById('imageZoomOverlay');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

})();
