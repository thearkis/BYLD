/**
 * @lib Scroll Fade
 * @ver 1.0.0
 * @description Generic helper functions for scroll effects, fade-ins, and parallax animations
 */

'use strict';

;(function () {

if (typeof window !== 'undefined') {
    window.ScrollFade = {}
} else {
    global.ScrollFade = {}
}

var ScrollFade = typeof window !== 'undefined' ? window.ScrollFade : global.ScrollFade

/**
 * @method animateElements Element fade-in animations on page load
 * @arg selector {string} CSS selector for elements to animate
 * @arg className {string} CSS class to add when element is loaded
 * @arg options {object} Animation options
 */
ScrollFade.animateElements = function(selector, className, options) {
    options = options || {}
    
    const elements = document.querySelectorAll(selector)
    
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add(className)
        }, index * (options.delay || 300))
    })
    
    return {
        elements: elements,
        finishTime: elements.length * (options.delay || 300) + (options.finishOffset || 0)
    }
}

/**
 * @method animateElementsSequential Animate elements in sequence with staggered timing
 * @arg selectors {array} Array of {selector, className, delay} objects
 * @arg options {object} Global animation options
 */
ScrollFade.animateElementsSequential = function(selectors, options) {
    options = options || {}
    
    let currentTime = 0
    const results = []
    
    selectors.forEach((config, index) => {
        const elements = document.querySelectorAll(config.selector)
        const delay = config.delay || options.defaultDelay || 300
        const className = config.className
        
        elements.forEach((element, elementIndex) => {
            setTimeout(() => {
                element.classList.add(className)
            }, currentTime + (elementIndex * delay))
        })
        
        const finishTime = currentTime + (elements.length * delay)
        currentTime = finishTime + (config.offset || 200)
        
        results.push({
            selector: config.selector,
            elements: elements,
            className: className,
            finishTime: finishTime
        })
    })
    
    return {
        results: results,
        totalTime: currentTime
    }
}

/**
 * @method animateTextShuffle Character swapping animation for text elements
 * @arg selector {string} CSS selector for text elements
 * @arg options {object} Animation options
 * @arg startTime {number} When to start animations
 */
ScrollFade.animateTextShuffle = function(selector, options, startTime) {
    options = options || {}
    
    const textElements = document.querySelectorAll(selector)
    
    textElements.forEach(element => {
        const text = element.textContent.trim()
        if (text.length === 0) return
        
        // Split text into individual character spans
        element.innerHTML = text.split('').map(char => '<span>' + char + '</span>').join('')
        
        const spans = element.querySelectorAll('span')
        const originalText = text.split('')
        
        function animateLetters() {
            spans.forEach((span, index) => {
                const delay = index * (options.letterDelay || 30)
                setTimeout(() => {
                    let rollCount = 0
                    const maxRolls = options.maxRolls || 15
                    
                    const rollInterval = setInterval(() => {
                        if (rollCount < maxRolls) {
                            const randomChar = String.fromCharCode(33 + Math.floor(Math.random() * 94))
                            span.textContent = randomChar
                            rollCount++
                        } else {
                            span.textContent = originalText[index]
                            clearInterval(rollInterval)
                        }
                    }, options.rollInterval || 50)
                }, delay)
            })
        }
        
        if (startTime !== undefined) {
            setTimeout(animateLetters, startTime)
        } else {
            animateLetters()
        }
    })
}

/**
 * @method setupParallax Setup parallax scrolling for elements
 * @arg config {object} Parallax configuration
 */
ScrollFade.setupParallax = function(config) {
    config = config || {}
    
    let ticking = false
    
    function updateParallax() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const windowHeight = window.innerHeight
        const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window
        
        // Process each parallax group
        config.groups.forEach(group => {
            const elements = document.querySelectorAll(group.selector)
            const parallaxSpeed = group.speed || 0.8
            const enableBlur = group.blur !== false
            const enableMovement = group.movement !== false
            
            elements.forEach(element => {
                let yPos = 0
                
                if (enableMovement) {
                    yPos = -(scrollTop * (1 - parallaxSpeed))
                    element.style.transform = `translate3d(0, ${yPos}px, 0)`
                    element.style.willChange = 'transform, filter'
                }
                
                if (enableBlur) {
                    const elementRect = element.getBoundingClientRect()
                    const elementTop = elementRect.top
                    const elementBottom = elementRect.bottom
                    
                    let blurAmount = 0
                    
                    // Adjust blur timing for mobile vs desktop
                    let blurTrigger = group.blurTrigger || 0.20
                    let blurStart = group.blurStart || 0.15
                    
                    if (isMobile) {
                        // On mobile, blur later to avoid blurring first sections on page load
                        blurTrigger = group.mobileBlurTrigger || 0.40  // 40% instead of 20%
                        blurStart = group.mobileBlurStart || 0.30     // 30% instead of 15%
                    }
                    
                    if (elementTop < windowHeight * blurTrigger && elementBottom > 0) {
                        const triggerPoint = windowHeight * blurStart
                        const distanceFromTrigger = Math.max(0, triggerPoint - elementTop)
                        const maxDistance = triggerPoint + elementRect.height
                        const exitProgress = distanceFromTrigger / maxDistance
                        blurAmount = Math.min(exitProgress * (group.maxBlur || 8), group.maxBlur || 8)
                    }
                    
                    element.style.filter = `blur(${blurAmount}px)`
                    if (!enableMovement) {
                        element.style.willChange = 'filter'
                    }
                }
            })
        })
        
        ticking = false
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax)
            ticking = true
        }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true })
    
    return {
        update: updateParallax,
        destroy: function() {
            window.removeEventListener('scroll', requestTick)
        }
    }
}

/**
 * @method setupScrollObserver Setup intersection observer for scroll-triggered effects
 * @arg config {object} Observer configuration
 */
ScrollFade.setupScrollObserver = function(config) {
    config = config || {}
    
    const observerOptions = {
        root: null,
        rootMargin: config.rootMargin || '-20% 0px -20% 0px',
        threshold: config.threshold || 0.3
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (config.onIntersect) {
                    config.onIntersect(entry.target, entry)
                }
            }
        })
    }, observerOptions)
    
    // Observe all elements matching the selector
    const elements = document.querySelectorAll(config.selector)
    elements.forEach(element => observer.observe(element))
    
    // Continuous element visibility checking during scroll
    let scrollPollInterval
    let lastScrollTop = window.pageYOffset
    
    function checkElementsVisibility() {
        elements.forEach(element => {
            const rect = element.getBoundingClientRect()
            
            // More conservative visibility check on mobile
            const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window
            const visibilityThreshold = isMobile ? 0.3 : 0.9 // 30% on mobile, 90% on desktop
            
            const isVisible = rect.top < window.innerHeight * visibilityThreshold && rect.bottom > 0
            
            if (isVisible && config.onIntersect) {
                // Always call onIntersect when element is visible, regardless of existing classes
                // This ensures elements fade in both when scrolling down AND up
                config.onIntersect(element, { isIntersecting: true })
            }
        })
    }
    
    function handleScroll() {
        const currentScrollTop = window.pageYOffset
        
        // Always check elements on every scroll event
        checkElementsVisibility()
        
        // Update last scroll position
        lastScrollTop = currentScrollTop
    }
    
    // Enhanced touch handling for mobile - continuous checking during active scroll
    if ('ontouchstart' in window) {
        let touchStartY = 0
        let isScrolling = false
        
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY
            isScrolling = false
            
            // Start continuous polling immediately on touch start
            if (!scrollPollInterval) {
                scrollPollInterval = setInterval(() => {
                    if (isScrolling) {
                        checkElementsVisibility() // Check during active scrolling
                    }
                }, 16) // 60fps continuous checking during scroll
            }
        }, { passive: true })
        
        document.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY
            const deltaY = Math.abs(currentY - touchStartY)
            
            // If there's significant movement, mark as scrolling and check visibility
            if (deltaY > 5) {
                isScrolling = true
                checkElementsVisibility() // Check immediately on touch move
            }
        }, { passive: true })
        
        document.addEventListener('touchend', () => {
            isScrolling = false
            
            // Keep continuous checking active for a bit after touch ends
            setTimeout(() => {
                if (scrollPollInterval) {
                    clearInterval(scrollPollInterval)
                    scrollPollInterval = null
                }
                
                // Final check
                checkElementsVisibility()
            }, 200) // Keep checking for 200ms after touch ends
        }, { passive: true })
        
        document.addEventListener('touchcancel', () => {
            isScrolling = false
            
            if (scrollPollInterval) {
                clearInterval(scrollPollInterval)
                scrollPollInterval = null
            }
            
            checkElementsVisibility()
        }, { passive: true })
    }
    
    // Add scroll event listener - check on every scroll event
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Also check on window resize and orientation change
    window.addEventListener('resize', checkElementsVisibility, { passive: true })
    window.addEventListener('orientationchange', () => {
        setTimeout(checkElementsVisibility, 100)
    })
    
    // Initial check
    setTimeout(checkElementsVisibility, 100)
    
    return {
        observer: observer,
        elements: elements,
        destroy: function() {
            observer.disconnect()
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', checkElementsVisibility)
            window.removeEventListener('orientationchange', checkElementsVisibility)
            
            if ('ontouchstart' in window) {
                document.removeEventListener('touchstart', () => {})
                document.removeEventListener('touchmove', () => {})
                document.removeEventListener('touchend', () => {})
                document.removeEventListener('touchcancel', () => {})
            }
            
            if (scrollPollInterval) {
                clearInterval(scrollPollInterval)
            }
        }
    }
}

/**
 * @method initScrollEffects Initialize all scroll effects with a single configuration
 * @arg config {object} Global configuration for all effects
 */
ScrollFade.initScrollEffects = function(config) {
    config = config || {}
    
    const effects = {}
    
    // Initialize element animations
    if (config.animations) {
        effects.animations = ScrollFade.animateElementsSequential(config.animations, config.animationOptions || {})
    }
    
    // Initialize text shuffle animations
    if (config.textShuffle) {
        config.textShuffle.forEach(textConfig => {
            if (effects.animations) {
                // Find the relevant animation result to get timing
                const animationResult = effects.animations.results.find(r => r.selector === textConfig.afterSelector)
                if (animationResult) {
                    ScrollFade.animateTextShuffle(textConfig.selector, textConfig.options, animationResult.finishTime + (textConfig.offset || 0))
                }
            } else {
                ScrollFade.animateTextShuffle(textConfig.selector, textConfig.options, textConfig.startTime)
            }
        })
    }
    
    // Initialize parallax effects
    if (config.parallax) {
        effects.parallax = ScrollFade.setupParallax(config.parallax)
    }
    
    // Initialize scroll observers
    if (config.observers) {
        effects.observers = config.observers.map(observerConfig => 
            ScrollFade.setupScrollObserver(observerConfig)
        )
    }
    
    return {
        ...effects,
        destroy: function() {
            if (effects.parallax) effects.parallax.destroy()
            if (effects.observers) effects.observers.forEach(obs => obs.destroy())
        }
    }
}

})()
