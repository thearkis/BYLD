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
                    
                    if (elementTop < windowHeight * (group.blurTrigger || 0.20) && elementBottom > 0) {
                        const triggerPoint = windowHeight * (group.blurStart || 0.15)
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
    
    // Aggressive mobile scroll handling - continuous polling during scroll
    let isScrolling = false
    let scrollTimeout
    let scrollPollInterval
    let lastScrollTop = window.pageYOffset
    let lastScrollTime = Date.now()
    
    function checkElementsVisibility() {
        elements.forEach(element => {
            const rect = element.getBoundingClientRect()
            const isVisible = rect.top < window.innerHeight * 0.9 && rect.bottom > 0
            
            if (isVisible && config.onIntersect) {
                // Check if element already has the animation class to avoid duplicates
                const hasAnimationClass = element.classList.contains('loaded') || 
                                        element.classList.contains('fade-in') ||
                                        element.classList.contains('visible')
                
                if (!hasAnimationClass) {
                    config.onIntersect(element, { isIntersecting: true })
                }
            }
        })
    }
    
    function handleScroll() {
        const currentScrollTop = window.pageYOffset
        const currentTime = Date.now()
        
        // Detect if scrolling is happening
        if (Math.abs(currentScrollTop - lastScrollTop) > 5) {
            isScrolling = true
            lastScrollTime = currentTime
            
            // Start aggressive polling during scroll
            if (!scrollPollInterval) {
                scrollPollInterval = setInterval(checkElementsVisibility, 16) // ~60fps during scroll
            }
        }
        
        lastScrollTop = currentScrollTop
        
        // Clear the scroll timeout
        clearTimeout(scrollTimeout)
        
        // Set timeout to stop polling after scroll stops
        scrollTimeout = setTimeout(() => {
            isScrolling = false
            
            // Stop aggressive polling
            if (scrollPollInterval) {
                clearInterval(scrollPollInterval)
                scrollPollInterval = null
            }
            
            // Final check after scroll stops
            setTimeout(checkElementsVisibility, 50)
        }, 150) // Wait 150ms after last scroll event
    }
    
    // Enhanced touch handling for mobile
    if ('ontouchstart' in window) {
        let touchStartY = 0
        let touchStartTime = 0
        
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY
            touchStartTime = Date.now()
            isScrolling = true
            
            // Start polling immediately on touch start
            if (!scrollPollInterval) {
                scrollPollInterval = setInterval(checkElementsVisibility, 16)
            }
        }, { passive: true })
        
        document.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY
            const deltaY = Math.abs(currentY - touchStartY)
            
            // If significant movement, ensure polling is active
            if (deltaY > 10) {
                isScrolling = true
                lastScrollTime = Date.now()
                
                if (!scrollPollInterval) {
                    scrollPollInterval = setInterval(checkElementsVisibility, 16)
                }
            }
        }, { passive: true })
        
        document.addEventListener('touchend', () => {
            // Keep polling for a bit after touch ends
            setTimeout(() => {
                isScrolling = false
                
                if (scrollPollInterval) {
                    clearInterval(scrollPollInterval)
                    scrollPollInterval = null
                }
                
                // Final visibility check
                checkElementsVisibility()
            }, 100)
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
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Also check on window resize and orientation change
    window.addEventListener('resize', checkElementsVisibility, { passive: true })
    window.addEventListener('orientationchange', () => {
        setTimeout(checkElementsVisibility, 100)
    })
    
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
            if (scrollTimeout) {
                clearTimeout(scrollTimeout)
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
