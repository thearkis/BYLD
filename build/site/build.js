/**
 * @lib Shuffle Character animation utilities
 * @ver 1.0.0
 */

var Shuffle = {}

if (typeof window === 'undefined') {
    module.exports = Shuffle
}

;(function () {

// Character sets for different languages
var charSets = {
    latin: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    japanese: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
    chinese: '信頼安全技術開発软件程序代码数据系统网络服务器客户端界面设计测试部署维护更新版本管理',
    ascii: function() {
        // Generate ASCII characters 33-126 (visible characters)
        var chars = ''
        for (var i = 33; i <= 126; i++) {
            chars += String.fromCharCode(i)
        }
        return chars
    }
}

Shuffle.charSets = charSets

/**
 * @method animateTextShuffle Basic text shuffling animation
 * @arg element {HTMLElement} DOM element to animate
 * @arg originalText {string} Original text to restore
 * @arg finalText {string} Final text to animate to
 * @arg options {object} Animation options
 */
Shuffle.animateTextShuffle = function(element, originalText, finalText, options) {
    options = options || {}
    
    var randomChars = options.charSet || charSets.latin
    var swapsRemaining = options.swapsRemaining || 14
    var interval = options.interval || 20
    var maxLength = Math.max(originalText.length, finalText.length)
    
    // Clear any existing animation
    if (element.animationInterval) {
        clearInterval(element.animationInterval)
    }
    
    element.isAnimating = true
    element.classList.add('rolling-animation')
    
    element.animationInterval = setInterval(function() {
        var currentDisplayText = ''
        
        for (var i = 0; i < maxLength; i++) {
            if (i < swapsRemaining) {
                var randomChar = randomChars.charAt(Math.floor(Math.random() * randomChars.length))
                currentDisplayText += randomChar
            } else if (i < finalText.length) {
                currentDisplayText += finalText[i]
            }
        }
        
        element.textContent = currentDisplayText
        swapsRemaining--
        
        if (swapsRemaining <= 0) {
            clearInterval(element.animationInterval)
            element.textContent = finalText
            element.classList.remove('rolling-animation')
            element.isAnimating = false
            
            if (options.onComplete) {
                options.onComplete()
            }
        }
    }, interval)
}

/**
 * @method animateHoverShuffle Hover-based text shuffling animation
 * @arg element {HTMLElement} DOM element to animate
 * @arg options {object} Animation options
 */
Shuffle.animateHoverShuffle = function(element, options) {
    options = options || {}
    
    var originalText = element.textContent
    var randomChars = options.charSet || charSets.latin
    var swapsRemaining = options.swapsRemaining || (originalText.length + 8)
    var interval = options.interval || 30
    
    // Store original styles to prevent jumping
    var originalStyles = {
        fontFamily: window.getComputedStyle(element).fontFamily,
        fontSize: window.getComputedStyle(element).fontSize,
        fontWeight: window.getComputedStyle(element).fontWeight,
        display: window.getComputedStyle(element).display,
        width: element.offsetWidth,
        height: element.offsetHeight
    }
    
    // Store original text
    element.originalText = originalText
    element.isAnimating = false
    element.animationInterval = null
    
    function startAnimation() {
        if (element.isAnimating) return
        
        element.isAnimating = true
        element.classList.add('rolling-animation')
        
        // Store original text content to restore later
        element.originalTextContent = element.textContent
        
        // Preserve original font properties during animation
        element.style.fontFamily = originalStyles.fontFamily
        element.style.fontSize = originalStyles.fontSize
        element.style.fontWeight = originalStyles.fontWeight
        
        // Only set minimal constraints to prevent major layout shifts
        // Use the original text length to estimate minimum width
        element.style.minWidth = 'fit-content'
        element.style.whiteSpace = 'nowrap'
        
        var currentSwapsRemaining = swapsRemaining
        
        element.animationInterval = setInterval(function() {
            var currentDisplayText = ''
            
            for (var i = 0; i < originalText.length; i++) {
                if (i >= originalText.length - currentSwapsRemaining) {
                    // Characters that are still random
                    var randomChar = randomChars.charAt(Math.floor(Math.random() * randomChars.length))
                    currentDisplayText += randomChar
                } else {
                    // Characters that have resolved to final
                    currentDisplayText += originalText[i]
                }
            }
            
            element.textContent = currentDisplayText
            currentSwapsRemaining--
            
            if (currentSwapsRemaining <= 0) {
                clearInterval(element.animationInterval)
                element.textContent = originalText
                element.classList.remove('rolling-animation')
                element.isAnimating = false
                
                // Reset only the styles we modified
                element.style.minWidth = ''
                element.style.whiteSpace = ''
                element.style.fontFamily = ''
                element.style.fontSize = ''
                element.style.fontWeight = ''
            }
        }, interval)
    }
    
    function stopAnimation() {
        if (element.animationInterval) {
            clearInterval(element.animationInterval)
            element.textContent = originalText
            element.classList.remove('rolling-animation')
            element.isAnimating = false
            
            // Reset only the styles we modified
            element.style.minWidth = ''
            element.style.whiteSpace = ''
            element.style.fontFamily = ''
            element.style.fontSize = ''
            element.style.fontWeight = ''
        }
    }
    
    // Add event listeners
    element.addEventListener('mouseenter', startAnimation)
    element.addEventListener('mouseleave', stopAnimation)
    
    return {
        start: startAnimation,
        stop: stopAnimation,
        element: element
    }
}

/**
 * @method animateLetterByLetter Letter-by-letter shuffling animation
 * @arg element {HTMLElement} DOM element to animate
 * @arg options {object} Animation options
 */
Shuffle.animateLetterByLetter = function(element, options) {
    options = options || {}
    
    var originalText = element.textContent
    var isJapanese = element.classList.contains('Data__jp') || element.classList.contains('CaseData__jp') || element.classList.contains('Footer__jp')
    var randomChars = isJapanese ? charSets.japanese : charSets.chinese
    
    var letterDelay = options.letterDelay || 100
    var rollInterval = options.rollInterval || 80
    var maxRolls = options.maxRolls || (6 + Math.floor(Math.random() * 4)) // 6-9 rolls per letter
    var repeatDelay = options.repeatDelay || (2000 + Math.random() * 2000) // 2-4 seconds
    
    // Split text into individual letters
    element.innerHTML = ''
    var letterSpans = []
    
    for (var i = 0; i < originalText.length; i++) {
        var span = document.createElement('span')
        span.textContent = originalText[i]
        span.style.display = 'inline-block'
        span.style.width = 'auto'
        element.appendChild(span)
        letterSpans.push(span)
        
        // Measure the width of the original character and lock it
        setTimeout(function(span) {
            var charWidth = span.offsetWidth
            span.style.width = charWidth + 'px'
            span.style.textAlign = 'center'
        }, 10, span)
    }
    
    function animateLetters() {
        letterSpans.forEach(function(span, index) {
            var targetLetter = originalText[index]
            var rollCount = 0
            
            setTimeout(function() {
                span.classList.add('rolling-animation')
                
                var letterInterval = setInterval(function() {
                    if (rollCount < maxRolls) {
                        // Show random character
                        var randomChar = randomChars.charAt(Math.floor(Math.random() * randomChars.length))
                        span.textContent = randomChar
                        rollCount++
                    } else {
                        // Show final character
                        span.textContent = targetLetter
                        span.classList.remove('rolling-animation')
                        clearInterval(letterInterval)
                    }
                }, rollInterval)
                
            }, index * letterDelay)
        })
    }
    
    function scheduleNextAnimation() {
        setTimeout(function() {
            animateLetters()
            scheduleNextAnimation()
        }, repeatDelay)
    }
    
    // Start initial animation
    animateLetters()
    
    // Schedule repeating animations after initial completes
    setTimeout(function() {
        scheduleNextAnimation()
    }, 1500)
    
    return {
        animate: animateLetters,
        element: element
    }
}

/**
 * @method animateLinkHover Link hover animation with text change
 * @arg element {HTMLElement} DOM element to animate
 * @arg hoverText {string} Text to show on hover
 * @arg originalHref {string} Href to set on hover
 * @arg options {object} Animation options
 */
Shuffle.animateLinkHover = function(element, hoverText, originalHref, options) {
    options = options || {}
    
    // Safety check for element and textContent
    if (!element || !element.textContent) {
        console.warn('Shuffle.animateLinkHover: Element or textContent is undefined')
        return
    }
    
    var originalText = element.textContent
    var originalHrefValue = element.href
    
    element.style.cursor = 'pointer'
    element.isAnimating = false
    element.animationInterval = null
    
    function animateToHoverText() {
        if (element.animationInterval) {
            clearInterval(element.animationInterval)
        }
        element.isAnimating = true
        element.href = originalHref
        
        Shuffle.animateTextShuffle(element, originalText, hoverText, {
            interval: 20,
            onComplete: function() {
                element.style.cursor = 'pointer'
            }
        })
    }
    
    function animateToOriginalText() {
        if (element.animationInterval) {
            clearInterval(element.animationInterval)
        }
        element.isAnimating = true
        element.href = originalHrefValue
        
        Shuffle.animateTextShuffle(element, element.textContent, originalText, {
            interval: 20,
            onComplete: function() {
                element.style.cursor = 'pointer'
            }
        })
    }
    
    element.addEventListener('mouseenter', animateToHoverText)
    element.addEventListener('mouseleave', animateToOriginalText)
    
    return {
        element: element,
        animateToHover: animateToHoverText,
        animateToOriginal: animateToOriginalText
    }
}

/**
 * @method animateMenuText Menu text hover animation (text doesn't change)
 * @arg element {HTMLElement} DOM element to animate
 * @arg options {object} Animation options
 */
Shuffle.animateMenuText = function(element, options) {
    options = options || {}
    
    var originalText = element.textContent
    var randomChars = options.charSet || charSets.latin
    var swapsRemaining = options.swapsRemaining || 20
    var interval = options.interval || 40
    
    // Store original font properties
    var originalStyles = {
        fontFamily: window.getComputedStyle(element).fontFamily,
        fontSize: window.getComputedStyle(element).fontSize,
        fontWeight: window.getComputedStyle(element).fontWeight
    }
    
    element.isAnimating = false
    element.animationInterval = null
    
    element.addEventListener('mouseenter', function() {
        if (element.isAnimating) return
        
        element.isAnimating = true
        element.classList.add('rolling-animation')
        
        // Preserve original font properties during animation
        element.style.fontFamily = originalStyles.fontFamily
        element.style.fontSize = originalStyles.fontSize
        element.style.fontWeight = originalStyles.fontWeight
        
        // Ensure enough width to prevent line wrapping
        var originalWidth = element.offsetWidth
        var extraWidth = Math.max(20, originalWidth * 0.2)
        element.style.width = (originalWidth + extraWidth) + 'px'
        element.style.display = 'inline-block'
        element.style.whiteSpace = 'nowrap'
        
        var currentSwapsRemaining = swapsRemaining
        
        element.animationInterval = setInterval(function() {
            var currentDisplayText = ''
            
            for (var i = 0; i < originalText.length; i++) {
                if (i < currentSwapsRemaining) {
                    var randomChar = randomChars.charAt(Math.floor(Math.random() * randomChars.length))
                    currentDisplayText += randomChar
                } else {
                    currentDisplayText += originalText[i]
                }
            }
            
            element.textContent = currentDisplayText
            currentSwapsRemaining--
            
            if (currentSwapsRemaining <= 0) {
                clearInterval(element.animationInterval)
                element.textContent = originalText
                element.classList.remove('rolling-animation')
                element.isAnimating = false
                
                // Restore original styles
                element.style.fontFamily = ''
                element.style.fontSize = ''
                element.style.fontWeight = ''
                element.style.width = ''
                element.style.display = ''
                element.style.whiteSpace = ''
            }
        }, interval)
    })
    
    return {
        element: element
    }
}

/**
 * @method animateCaseresultText Caseresult text character swapping animation
 * @arg element {HTMLElement} DOM element to animate
 * @arg options {object} Animation options
 */
Shuffle.animateCaseresultText = function(element, options) {
    options = options || {}
    
    var text = element.textContent.trim()
    if (text.length === 0) return null
    
    // Split text into individual character spans
    element.innerHTML = text.split('').map(function(char) {
        return '<span>' + char + '</span>'
    }).join('')
    
    var spans = element.querySelectorAll('span')
    var originalText = text.split('')
    var maxRolls = options.maxRolls || 15
    var rollInterval = options.rollInterval || 50
    var letterDelay = options.letterDelay || 30
    
    function animateLetters() {
        spans.forEach(function(span, index) {
            var delay = index * letterDelay
            setTimeout(function() {
                var rollCount = 0
                
                var rollInterval = setInterval(function() {
                    if (rollCount < maxRolls) {
                        // Random character from ASCII 33-126 (visible characters)
                        var randomChar = String.fromCharCode(33 + Math.floor(Math.random() * 94))
                        span.textContent = randomChar
                        rollCount++
                    } else {
                        // Animation complete - restore original character
                        span.textContent = originalText[index]
                        clearInterval(rollInterval)
                    }
                }, rollInterval)
            }, delay)
        })
    }
    
    return {
        element: element,
        animate: animateLetters
    }
}

/**
 * @method animateServiceDigit Service digit animation for ::before elements
 * @arg element {HTMLElement} DOM element to animate
 * @arg finalDigit {number} Final digit to show
 * @arg options {object} Animation options
 */
Shuffle.animateServiceDigit = function(element, finalDigit, options) {
    options = options || {}
    
    var randomChars = '0123456789'
    var swapsRemaining = options.swapsRemaining || 6
    var interval = options.interval || 80
    var digitStr = finalDigit.toString()
    
    // Create a temporary span to hold the animated digit
    var digitSpan = document.createElement('span')
    var isMobile = window.innerWidth <= 768 || 'ontouchstart' in window
    var fontSize = isMobile ? '32px' : '4vw'
    var lineHeight = isMobile ? '32px' : '4vw'
    digitSpan.style.cssText = 'position: absolute; top: 0; left: 0; color: #f00; font-size: ' + fontSize + '; line-height: ' + lineHeight + '; display: block; z-index: 10; text-shadow: 0 0 3px #f00;'
    
    // Hide the original ::before content during animation
    element.style.position = 'relative'
    element.appendChild(digitSpan)
    
    var animationInterval = setInterval(function() {
        if (swapsRemaining > 0) {
            // Show random digit
            var randomChar = randomChars.charAt(Math.floor(Math.random() * randomChars.length))
            digitSpan.textContent = randomChar
            swapsRemaining--
        } else {
            // Animation complete - change to normal color and remove glow
            digitSpan.style.color = '#00f'
            digitSpan.style.textShadow = 'none'
            digitSpan.textContent = digitStr
            clearInterval(animationInterval)
            
            // Remove temporary span after a brief moment
            setTimeout(function() {
                if (digitSpan.parentNode) {
                    digitSpan.parentNode.removeChild(digitSpan)
                }
            }, 100)
        }
    }, interval)
    
    return {
        element: element,
        digitSpan: digitSpan
    }
}

/**
 * @method animateFooterTextRolling Footer text rolling animation with character cycling
 * @arg element {HTMLElement} DOM element to animate
 * @arg options {object} Animation options
 */
Shuffle.animateFooterTextRolling = function(element, options) {
    options = options || {}
    
    const originalText = element.textContent
    const isJapanese = element.classList.contains('Footer__jp')
    const randomChars = isJapanese ? charSets.japanese : charSets.chinese
    
    // Split text into individual letters
    element.innerHTML = ''
    const letterSpans = []
    
    for (let i = 0; i < originalText.length; i++) {
        const span = document.createElement('span')
        span.textContent = originalText[i]
        span.style.display = 'inline-block'
        span.style.width = 'auto'
        element.appendChild(span)
        letterSpans.push(span)
        
        // Measure the width of the original character and lock it
        setTimeout(() => {
            const charWidth = span.offsetWidth
            span.style.width = charWidth + 'px'
            span.style.textAlign = 'center'
        }, 10)
    }
    
    // Function to animate all letters
    function animateLetters() {
        letterSpans.forEach((span, index) => {
            const targetLetter = originalText[index]
            let rollCount = 0
            const maxRolls = options.maxRolls || 6 + Math.floor(Math.random() * 4) // 6-9 rolls per letter
            
            setTimeout(() => {
                span.classList.add('rolling-animation')
                
                const letterInterval = setInterval(() => {
                    if (rollCount < maxRolls) {
                        // Show random character
                        const randomChar = randomChars.charAt(Math.floor(Math.random() * randomChars.length))
                        span.textContent = randomChar
                        rollCount++
                    } else {
                        // Show final character
                        span.textContent = targetLetter
                        span.classList.remove('rolling-animation')
                        clearInterval(letterInterval)
                    }
                }, options.rollInterval || 80) // 80ms per roll
                
            }, index * (options.letterDelay || 100)) // 100ms delay between each letter
        })
    }
    
    // Function to schedule next animation
    function scheduleNextAnimation() {
        const randomDelay = (options.minDelay || 2000) + Math.random() * (options.maxDelay || 2000) // 2-4 seconds
        setTimeout(() => {
            animateLetters()
            scheduleNextAnimation() // Schedule the next one
        }, randomDelay)
    }
    
    // Start initial animation
    animateLetters()
    
    // Schedule repeating animations after initial completes
    const initialDelay = options.initialDelay || 1500 // 1.5 seconds buffer
    setTimeout(() => {
        scheduleNextAnimation()
    }, initialDelay)
    
    return {
        element: element,
        animateLetters: animateLetters,
        stopAnimation: function() {
            // Clear any ongoing animations if needed
            letterSpans.forEach(span => {
                span.classList.remove('rolling-animation')
            })
        }
    }
}



/**
 * @method initAllAnimations Initialize all shuffling animations on the page
 * @arg options {object} Global options for all animations
 */
Shuffle.initAllAnimations = function(options) {
    options = options || {}
    
    // Initialize link hover animations
    var linkElements = document.querySelectorAll('.cols__text_phone a, .cols__text_email a, .cols__text_x a')
    linkElements.forEach(function(element) {
        var parentElement = element.closest('.cols__text_phone, .cols__text_email, .cols__text_x')
        var hoverText = ''
        var originalHref = ''
        
        if (parentElement.classList.contains('cols__text_phone')) {
            hoverText = '+1 833 359 6777'
            originalHref = 'tel:+1 833 359 6777'
        } else if (parentElement.classList.contains('cols__text_email')) {
            hoverText = 'a@ark.studio'
            originalHref = 'mailto:a@ark.studio'
        } else if (parentElement.classList.contains('cols__text_x')) {
            hoverText = '@ARKconclave'
            originalHref = 'http://x.com/arkconclave'
        }
        
        Shuffle.animateLinkHover(element, hoverText, originalHref, options.linkHover)
    })
    
    // Initialize menu text animations
    var menuTextElements = document.querySelectorAll('.Menu__text')
    menuTextElements.forEach(function(element) {
        Shuffle.animateMenuText(element, options.menuText)
    })
    
    // Initialize data elements letter-by-letter animations
    var dataElements = document.querySelectorAll('.Data__jp:not(.Data__jp_Hide), .Data__ch, .CaseData__jp:not(.CaseData__jp_Hide), .CaseData__ch, .Footer__jp, .Footer__ch:not(.Footer__ch_Hide)')
    dataElements.forEach(function(element) {
        Shuffle.animateLetterByLetter(element, options.letterByLetter)
    })
    
    // Initialize action elements hover animations
    var actionElements = document.querySelectorAll('.Action, .Footer__action, .Button_Type_Action, .CaseAction')
    actionElements.forEach(function(element) {
        Shuffle.animateHoverShuffle(element, {
            centerContent: true,
            ...options.actionHover
        })
    })
    
    // Initialize caseresult text animations
    var caseresultElements = document.querySelectorAll('.caseresult__title, .caseresult__text')
    caseresultElements.forEach(function(element) {
        Shuffle.animateCaseresultText(element, options.caseresultText)
    })
    
    return {
        linkElements: linkElements.length,
        menuTextElements: menuTextElements.length,
        dataElements: dataElements.length,
        actionElements: actionElements.length,
        caseresultElements: caseresultElements.length
    }
}

})();

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
                        // On mobile, check if blur should be disabled
                        if (group.mobileBlurTrigger && group.mobileBlurTrigger > 1.5) {
                            // Skip blur entirely on mobile for this group
                            element.style.filter = 'none'
                        } else {
                            // On mobile, blur later to avoid blurring first sections on page load
                            blurTrigger = group.mobileBlurTrigger || 0.40  // 40% instead of 20%
                            blurStart = group.mobileBlurStart || 0.30     // 30% instead of 15%
                            
                            if (elementTop < windowHeight * blurTrigger && elementBottom > 0) {
                                const triggerPoint = windowHeight * blurStart
                                const distanceFromTrigger = Math.max(0, triggerPoint - elementTop)
                                const maxDistance = triggerPoint + elementRect.height
                                const exitProgress = distanceFromTrigger / maxDistance
                                blurAmount = Math.min(exitProgress * (group.maxBlur || 8), group.maxBlur || 8)
                            }
                            
                            element.style.filter = `blur(${blurAmount}px)`
                        }
                    } else {
                        // Desktop blur logic
                        if (elementTop < windowHeight * blurTrigger && elementBottom > 0) {
                            const triggerPoint = windowHeight * blurStart
                            const distanceFromTrigger = Math.max(0, triggerPoint - elementTop)
                            const maxDistance = triggerPoint + elementRect.height
                            const exitProgress = distanceFromTrigger / maxDistance
                            blurAmount = Math.min(exitProgress * (group.maxBlur || 8), group.maxBlur || 8)
                        }
                        
                        element.style.filter = `blur(${blurAmount}px)`
                    }
                    
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
            
            // Check if element is visible from either direction (top or bottom)
            const isVisibleFromTop = rect.top < window.innerHeight * visibilityThreshold && rect.bottom > 0
            const isVisibleFromBottom = rect.top < window.innerHeight && rect.bottom > window.innerHeight * (1 - visibilityThreshold)
            
            const isVisible = isVisibleFromTop || isVisibleFromBottom
            
            if (isVisible && config.onIntersect) {
                // Always call onIntersect when element is visible, regardless of existing classes
                // This ensures elements fade in both when scrolling down AND up
                config.onIntersect(element, { isIntersecting: true })
            }
        })
    }
    
    function handleScroll() {
        const currentScrollTop = window.pageYOffset
        const scrollDirection = currentScrollTop > lastScrollTop ? 'DOWN' : 'UP'
        

        
        // Always check elements on every scroll event
        checkElementsVisibility()
        
        // Update last scroll position
        lastScrollTop = currentScrollTop
    }
    
    // Enhanced touch handling for mobile - continuous checking during active scroll
    if ('ontouchstart' in window) {
        let touchStartY = 0
        let lastTouchY = 0
        let touchMoveCount = 0
        
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY
            lastTouchY = touchStartY
            touchMoveCount = 0
            
    
            
            // Force immediate visibility check
            checkElementsVisibility()
            
            // Start aggressive continuous polling
            if (!scrollPollInterval) {
                scrollPollInterval = setInterval(() => {
                    checkElementsVisibility()
                }, 4) // 250fps ultra-aggressive checking
            }
        }, { passive: true })
        
        document.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY
            const deltaY = Math.abs(currentY - lastTouchY)
            lastTouchY = currentY
            

            
            // Check visibility on EVERY touch move, regardless of distance
            checkElementsVisibility()
            
            // If there's any movement, ensure continuous checking is active
            if (deltaY > 0) {
                if (!scrollPollInterval) {
                    scrollPollInterval = setInterval(() => {
                        checkElementsVisibility()
                    }, 4) // 250fps ultra-aggressive checking
                }
            }
        }, { passive: true })
        
        document.addEventListener('touchend', () => {
            // Force final visibility check
            checkElementsVisibility()
            
            // Keep aggressive checking active for longer after touch ends
            setTimeout(() => {
                if (scrollPollInterval) {
                    clearInterval(scrollPollInterval)
                    scrollPollInterval = null
                }
                
                // Multiple final checks to catch any missed elements
                checkElementsVisibility()
                setTimeout(checkElementsVisibility, 50)
                setTimeout(checkElementsVisibility, 100)
                setTimeout(checkElementsVisibility, 200)
            }, 500) // Keep checking for 500ms after touch ends
        }, { passive: true })
        
        document.addEventListener('touchcancel', () => {
            // Force visibility check on cancel
            checkElementsVisibility()
            
            if (scrollPollInterval) {
                clearInterval(scrollPollInterval)
                scrollPollInterval = null
            }
            
            // Multiple checks to catch missed elements
            setTimeout(checkElementsVisibility, 50)
            setTimeout(checkElementsVisibility, 100)
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

/**
 * @lib MissEvent Расширение методов работы с DOM
 * @ver 0.8.0
 */
;(function () {

var ua = navigator.userAgent

var opera = ua.toLowerCase().indexOf("op") > -1
var chrome = ua.indexOf('Chrome') > -1 && !opera
var explorer = ua.indexOf('MSIE') > -1
var firefox = ua.indexOf('Firefox') > -1
var safari = ua.indexOf("Safari") > -1 && !chrome

var mobile = ua.match(/Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i) !== null
var android = ua.match(/Android/i) !== null

var href = window.location.href
var qsIndex = href.indexOf('?')
var qs = {}

if (qsIndex !== -1) {
    href.substring(qsIndex + 1).split('&').forEach(function (pair) {
        pair = pair.split('=')
        qs[pair[0]] = pair[1] === undefined ? '' : decodeURIComponent(pair[1])
    })

}

window.MissEvent = {
    /**
     * If mobile platform
     */
    mobile: mobile,
    android: android,
    ios: !android,

    /**
     * Current browser
     */
    chrome: chrome,
    explorer: explorer,
    firefox: firefox,
    safari: safari,
    opera: opera,

    /**
     * query string
     */
    qs: function (key, value) {
        if (value === undefined && typeof key === 'string') {
            return qs[key]
        } else {

            if (typeof key === 'string') {
                qs[key] = value
            } else {
                for (var i in key) qs[i] = key[i]
            }

            qsString = ''
            for (var key in qs) {
                if (qs[key] !== undefined && qs[key] !== '') {
                    qsString +=  '&' + key + '=' + qs[key]
                }
            }
            history.pushState(qs, document.title, window.location.pathname + '?' + qsString.substr(1))
        }
    },

    /**
     * Finger tap
     * @event tap
     * @domNode target
     */
    tap: function (domNode) {
        if (domNode.missEventTap) {
            return
        } else {
            domNode.missEventTap = true
        }

        if (!MissEvent.mobile) {
            return domNode.addEventListener('click', function (e) {
                this.dispatchEvent(new Event('tap'))
            })
        }

        var didTouch = false
        var didMove = false

        domNode.addEventListener('touchstart', function () {
            didTouch = true
            didMove = false
        })
        domNode.addEventListener('touchmove', function () {
            didTouch = false
            didMove = true
        })
        domNode.addEventListener('touchend', function (e) {
            if (didTouch && !didMove) {
                this.dispatchEvent(new Event('tap'))
                e.preventDefault()
            }
        })
    },

    /**
     * Horizontal swipe
     * @event     swipe    {delta: number, elasticDelta: number}
     * @event     didswipe {delta: number, elasticDelta: number, isFast: boolean}
     *
     * @domNode   target
     * @direction string   'horizontal', 'vertical'
     */
    swipe: function (domNode, direction, conditionCallback, fastSwipeTimeout, fastSwipeOffset) {
        if (domNode.missEventSwipe) {
            return
        } else {
            domNode.missEventSwipe = true
        }

        if (fastSwipeTimeout === undefined) fastSwipeTimeout = 500
        if (fastSwipeOffset === undefined) fastSwipeOffset = 15

        var didTouch = false
        var didFastSwipe = false
        var touchMoveDirection = ''
        var swipeTimeout = false
        var holdTime
        var elasticFactor = .2
        var fromX, fromY, toX, toY, deltaX, deltaY, delta, elasticDelta
        var willSwipe = false

        var parentWidth = domNode.offsetWidth
        var parentHeight = domNode.offsetHeight
        var parentOffsetLeft = domNode.offsetLeft
        var parentOffsetTop = domNode.offsetTop
        var parent = domNode

        while (parent = parent.offsetParent) {
            parentOffsetLeft += parent.offsetLeft
            parentOffsetTop += parent.offsetTop
        }

        domNode.addEventListener(MissEvent.mobile ? 'touchstart' : 'mousedown', function (e) {
            if (conditionCallback && !conditionCallback()) {
                return
            }

            didTouch = true
            fromX = e.touches ? e.touches[0].clientX : e.clientX
            fromY = e.touches ? e.touches[0].clientY : e.clientY
            delta = 0
            touchMoveDirection = ''
            holdTime = new Date
        })

        function move (e) {
            if (!didTouch) return

            holdTime = new Date

            toX = e.touches ? e.touches[0].clientX : e.clientX
            toY = e.touches ? e.touches[0].clientY : e.clientY

            deltaX = toX - fromX
            deltaY = toY - fromY

            if (touchMoveDirection === '') {
                touchMoveDirection = Math.abs(deltaX) < Math.abs(deltaY) ? 'vertical' : 'horizontal'
            }

            if (touchMoveDirection === direction) {
                e.preventDefault()

                if (willSwipe === false) {
                    willSwipe = true
                    domNode.dispatchEvent(
                        new CustomEvent('willswipe')
                    )
                }

                if (!swipeTimeout) {
                    didFastSwipe = true
                    swipeTimeout = setTimeout(function () {didFastSwipe = false}, fastSwipeTimeout)
                }

                delta = direction === 'horizontal' ?  deltaX : deltaY

                domNode.dispatchEvent(
                    new CustomEvent(
                        'swipe', {
                            detail: {
                                x: toX - parentOffsetLeft,
                                y: toY - parentOffsetTop,
                                delta: delta,
                                width: parentWidth,
                                height: parentHeight,
                                elasticFactor: elasticFactor
                            }
                        }
                    )
                )
            }
        }

        if (MissEvent.mobile) {
            domNode.addEventListener('touchmove', move)
        } else {
            window.addEventListener('mousemove', move)
        }

        function end (e) {
            if (!didTouch) return

            if (didTouch && !touchMoveDirection) {
                domNode.dispatchEvent(
                    new CustomEvent(
                         'swipefail', {
                            detail: {
                                x: fromX - parentOffsetLeft,
                                y: fromY - parentOffsetTop,
                                width: parentWidth,
                                height: parentHeight,
                            }
                        }
                    )
                )
            } else if (didTouch && touchMoveDirection === direction) {
                domNode.dispatchEvent(
                    new CustomEvent(
                         'didswipe', {
                            detail: {
                                x: toX - parentOffsetLeft,
                                y: toY - parentOffsetTop,
                                width: parentWidth,
                                height: parentHeight,
                                delta: delta,
                                elasticFactor: elasticFactor,
                                holdTime: new Date - holdTime,
                                isFast: didFastSwipe && Math.abs(delta) >= fastSwipeOffset,
                            }
                        }
                    )
                )
            }

            if (swipeTimeout) clearTimeout(swipeTimeout)

            didTouch = false
            didFastSwipe = false
            touchMoveDirection = false
            swipeTimeout = false
            willSwipe = false
        }

        if (MissEvent.mobile) {
            domNode.addEventListener('touchend', end)
        } else {
            window.addEventListener('mouseup', end)
        }
    },

    horizontalSwipe: function (domNode, conditionCallback, fastSwipeTimeout, fastSwipeOffset) {
        this.swipe(domNode, 'horizontal', conditionCallback, fastSwipeTimeout, fastSwipeOffset)
    },
    verticalSwipe: function (domNode, conditionCallback, fastSwipeTimeout, fastSwipeOffset) {
        this.swipe(domNode, 'vertical', conditionCallback, fastSwipeTimeout, fastSwipeOffset)
    },

    /**
     * Horizontal scroll visibility
     * @events visible, invisible
     * @domNode target
     * @parent container to scroll (window is default)
     */
    visible: function (domNode, conditionCallback, parent) {
        if (parent === undefined) {
            parent = window
        }

        var offsetTop = MissEvent.offset(domNode).top
        var offsetBottom = offsetTop + domNode.offsetHeight
        var visible

        function checkVisibility () {
            if (conditionCallback && !conditionCallback()) {
                if (visible !== false) {
                    domNode.dispatchEvent(new Event('invisible'))
                    visible = false
                }
                return
            }

            var scrollTop = (parent === window ? document.body : parent).scrollTop
            var scrollBottom = scrollTop + parent.innerHeight

            if (scrollBottom > offsetTop && scrollTop < offsetBottom) {
                if (visible !== true) {
                    domNode.dispatchEvent(new Event('visible'))
                    visible = true
                }
            } else {
                if (visible !== false) {
                    domNode.dispatchEvent(new Event('invisible'))
                    visible = false
                }
            }
        }

        parent.addEventListener('scroll', checkVisibility)
        checkVisibility()
    },

    offset: function (domNode) {
        if (domNode.offsetParent === null) {
            return undefined
        }

        var offsetTop = 0
        var offsetLeft = 0

        while (domNode.offsetParent !== null) {
            offsetTop += domNode.offsetTop
            offsetLeft += domNode.offsetLeft
            domNode = domNode.offsetParent
        }

        return {
            top: offsetTop,
            left: offsetLeft
        }
    },
}

})();
/**
 * @lib Beast
 * @ver 0.39.4
 * @url github.com/arkconclave/beast
 */

'use strict';

;(function () {

if (typeof window !== 'undefined') {

    // Polyfill for window.CustomEvent in IE
    if (typeof window.CustomEvent !== 'function') {
        window.CustomEvent = function (event, params) {
            params = params || {bubbles: false, cancelable: false, detail: undefined}
            var e = document.createEvent('CustomEvent')
            e.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
            return e
        }
        window.CustomEvent.prototype = window.Event.prototype
    }

    window.Beast = {}
    document.addEventListener('DOMContentLoaded', function () {
        Beast.init()
    })

} else {
    global.Beast = {}
    module.exports = Beast
}

/*
 * Common vars
 */
var Declaration = {}                 // Declarations from Bease.decl()
var DeclarationFinished = false      // Flag turns true after the first Beast.node() call
var HttpRequestQueue = []            // Queue of required bml-files with link tag
var CssLinksToLoad = 0               // Num of <link rel="stylesheet"> in the <head>
var BeastIsReady = false             // If all styles and scripts are loaded
var OnBeastReadyCallbacks = []       // Functions to call when sources are ready
var ReStartBML = /<[a-z][^>]*\/?>/i  // matches start of BML substring
var ReDoubleQuote = /"/g             // matches "-symbols
var ReBackslash = /\\/g              // matches \-symbols
var ReLessThen = /</g                // matches <-symbols
var ReMoreThen = />/g                // matches >-symbols
var ReNL = /\n/g                     // matches \n-symbols
var ReCamelCase = /([a-z])([A-Z])/g  // matches camelCase pairs
var ReStylePairSplit = /:\s?/        // matches :-separation in style DOM-attribute

// Declaration properties that can't belong to user
var ReservedDeclarationProperies = {
    inherits:1,
    implementWith:1,
    expand:1,
    mod:1,
    mix:1,
    param:1,
    domInit:1,
    domAttr:1,
    on:1,
    onWin:1,
    onMod:1,
    onAttach:1,
    onRemove:1,
    tag:1,
    noElems:1,
    final:1,

    // 2 means not to inherit this field
    abstract:2,
    finalMod:2,
    __userMethods:2,
    __commonExpand:2,
    __flattenInherits:2,
    __finalMod:2,
    __elems:2,
    __isBlock:2,
}

// CSS-properties measured in px commonly
var CssPxProperty = {
    height:1,
    width:1,
    left:1,
    right:1,
    bottom:1,
    top:1,
    'line-height':1,
    'font-size':1,
}

// Single HTML-tags
var SingleTag = {
    area:1,
    base:1,
    br:1,
    col:1,
    command:1,
    embed:1,
    hr:1,
    img:1,
    input:1,
    keygen:1,
    link:1,
    meta:1,
    param:1,
    source:1,
    wbr:1,
}

// Text output helpers
function escapeDoubleQuotes (string) {
    return string.replace(ReBackslash, '\\\\').replace(ReDoubleQuote, '\\"').replace(ReNL, '\\n')
}
function escapeHtmlTags (string) {
    return string.replace(ReLessThen, '&lt;').replace(ReMoreThen, '&gt;')
}
function camelCaseToDash (string) {
    return string.replace(ReCamelCase, '$1-$2').toLowerCase()
}
function stringifyObject (ctx) {
    if (Array.isArray(ctx)) {
        var string = '['
        for (var i = 0, ii = ctx.length; i < ii; i++) {
            string += stringifyObject(ctx[i]) + ','
        }
        string = string.slice(0,-1)
        string += ']'
        return string
    }
    else if (typeof ctx === 'object') {
        var string = '{'
        for (var key in ctx) {
            if (ctx[key] !== undefined) {
                string += '"' + key + '":' + stringifyObject(ctx[key]) + ','
            }
        }
        if (string.length !== 1) {
            string = string.slice(0, -1)
        }
        string += '}'
        return string
    }
    else if (typeof ctx === 'string') {
        return '"' + escapeDoubleQuotes(ctx) + '"'
    }
    else if (typeof ctx === 'function' && ctx.beastDeclPath !== undefined) {
        return ctx.beastDeclPath
    }
    else {
        return ctx.toString()
    }
}
function objectIsEmpty (object) {
    for (var key in object) return false
    return true
}
function cloneObject (ctx) {
    if (Array.isArray(ctx)) {
        var array = []
        for (var i = 0, ii = ctx.length; i < ii; i++) {
            array.push(
                cloneObject(ctx[i])
            )
        }
        return array
    }
    else if (typeof ctx === 'object' && ctx !== null) {
        var object = {}
        for (var key in ctx) {
            object[key] = cloneObject(ctx[key])
        }
        return object
    }
    else {
        return ctx
    }
}

/**
 * Public Beast properties
 */
Beast.declaration = Declaration

/**
 * Initialize Beast
 */
Beast.init = function () {
    var links = document.getElementsByTagName('link')
    var bmlLinks = []

    for (var i = 0, ii = links.length; i < ii; i++) {
        var link = links[i]
        if (link.type === 'bml' || link.rel === 'bml') {
            RequireModule(link.href)
            bmlLinks.push(link)
        }
        if (link.rel === 'stylesheet') {
            CssLinksToLoad++
            link.onload = link.onerror = function () {
                CheckIfBeastIsReady()
            }
        }
    }

    for (var i = 0, ii = bmlLinks.length; i < ii; i++) {
        bmlLinks[i].parentNode.removeChild(bmlLinks[i])
    }

    CheckIfBeastIsReady()
}

/**
 * Require declaration script
 *
 * @url string Path to script file
 */
function RequireModule (url) {
    var xhr = new (XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0')
    xhr.open('GET', url)
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            CheckIfBeastIsReady()
        }
    }
    HttpRequestQueue.push(xhr)
    xhr.send()
}

/**
 * Checks if all <link> are loaded
 */
function CheckIfBeastIsReady () {
    if (BeastIsReady) return

    var isReady = true

    for (var i = 0, ii = HttpRequestQueue.length; i < ii; i++) {
        var xhr = HttpRequestQueue[i]
        if (xhr.readyState !== 4 || xhr.status !== 200) {
            isReady = false
        }
    }
    if (document.styleSheets.length < CssLinksToLoad) {
        isReady = false
    }

    if (isReady) {
        for (var i = 0, ii = HttpRequestQueue.length; i < ii; i++) {
            EvalBml(
                HttpRequestQueue[i].responseText
            )
        }
        HttpRequestQueue = []
        ProcessBmlScripts()

        BeastIsReady = true
        for (var i = 0, ii = OnBeastReadyCallbacks.length; i < ii; i++) {
            OnBeastReadyCallbacks[i]()
        }
    }
}

/**
 * Converts <script type="bml"/> tag to Beast::evalBml() method
 */
function ProcessBmlScripts () {
    var scripts = document.getElementsByTagName('script')

    for (var i = 0, ii = scripts.length; i < ii; i++) {
        var script = scripts[i]

        if (script === undefined) {
            continue
        }

        var text = script.text

        if (script.type === 'bml' && text !== '') {
            EvalBml(text)
        }
    }
}

/**
 * Parses and attaches declaration to <head>-node.
 * If there's only XML inside, appends node to document.body.
 *
 * @text string Text to parse and attach
 */
function EvalBml (text) {
    var rootNode = eval(Beast.parseBML(text))
    if (/^[\s\n]*</.test(text)) {
        rootNode.render(document.body)
    }
}

/**
 * Initialize DOM: assign DOM-nodes to BemNodes
 * @domNode DOMElement Node to start with
 */
Beast.domInit = function (domNode, isInnerCall, parentBemNode, parentBlock) {
    // No more Beast.decl() after the first Beast.domInit() call
    if (!DeclarationFinished) {
        DeclarationFinished = true
        CompileDeclarations()
    }

    if (domNode === undefined) {
        return false
    }
    // ELEMENT_NODE
    else if (domNode.nodeType === 1) {
        var nodeName = domNode.getAttribute('data-node-name')
        if (nodeName !== null) {

            // BemNode
            var bemNode = isInnerCall ? Beast.node(nodeName, {__context: parentBlock}) : Beast.node(nodeName)
            var stringToEval = ''
            var implementedNodeName = ''

            // Assign attributes
            for (var i = 0, ii = domNode.attributes.length, name, value; i < ii; i++) {
                name = domNode.attributes[i].name
                value = domNode.attributes[i].value

                // Parse style to css object
                if (name === 'style') {
                    var stylePairs = value.split(';')
                    for (var j = 0, jj = stylePairs.length, stylePair; j < jj; j++) {
                        stylePair = stylePairs[j].split(ReStylePairSplit)
                        bemNode.css(stylePair[0], stylePair[1])
                    }
                }
                // Restore encoded objects
                else if (name === 'data-event-handlers') {
                    stringToEval += ';bemNode._domNodeEventHandlers = ' + decodeURIComponent(value)
                }
                else if (name === 'data-window-event-handlers') {
                    stringToEval += ';bemNode._windowEventHandlers = ' + decodeURIComponent(value)
                }
                else if (name === 'data-mod-handlers') {
                    stringToEval += ';bemNode._modHandlers = ' + decodeURIComponent(value)
                }
                else if (name === 'data-dom-init-handlers') {
                    stringToEval += ';bemNode._domInitHandlers = ' + decodeURIComponent(value)
                }
                else if (name === 'data-mod') {
                    stringToEval += ';bemNode._mod = ' + decodeURIComponent(value)
                }
                else if (name === 'data-param') {
                    stringToEval += ';bemNode._param = ' + decodeURIComponent(value)
                }
                else if (name === 'data-implemented-node-name') {
                    implementedNodeName = value
                }
                else if (name === 'data-no-elems') {
                    bemNode._noElems = true
                }
                // Else _domAttr
                else if (name !== 'class') {
                    bemNode.domAttr(name, value)
                }
            }

            if (stringToEval !== '') {
                eval(stringToEval)
            }

            for (var key in bemNode._param) {
                if (bemNode._param[key].__isStringifiedBemNode === true) {
                    bemNode._param[key] = eval(bemNode._param[key].string)
                }
            }

            if (isInnerCall !== undefined) {
                var parentDomNode = parentBemNode._domNode
                parentBemNode._domNode = undefined

                if (implementedNodeName !== '') {
                    Beast.node(implementedNodeName, {__context:parentBlock})
                        .appendTo(parentBemNode)
                        .implementWith(bemNode, true)
                } else {
                    parentBemNode.append(bemNode)
                    if (parentBemNode._noElems === true) {
                        bemNode.parentBlock(parentBlock)
                    }
                }

                parentBemNode._domNode = parentDomNode
            }

            // Assign children
            for (var i = 0, ii = domNode.childNodes.length, childNode; i < ii; i++) {
                Beast.domInit(
                    domNode.childNodes[i],
                    true,
                    bemNode,
                    bemNode._noElems === true
                        ? bemNode._parentBlock._parentNode._parentBlock
                        : bemNode._parentBlock
                )
            }

            // Assign flags
            bemNode._renderedOnce = true
            bemNode._isExpanded = true

            // Crosslink
            bemNode._domNode = domNode
            domNode.bemNode = bemNode

            // Add event handlers
            if (bemNode._domNodeEventHandlers !== undefined) {
                for (var eventName in bemNode._domNodeEventHandlers) {
                    for (var i = 0, ii = bemNode._domNodeEventHandlers[eventName].length; i < ii; i++) {
                        bemNode.on(eventName, bemNode._domNodeEventHandlers[eventName][i], true, false, true)
                    }
                }
            }
            if (bemNode._windowEventHandlers !== undefined) {
                for (var eventName in bemNode._windowEventHandlers) {
                    for (var i = 0, ii = bemNode._windowEventHandlers[eventName].length; i < ii; i++) {
                        bemNode.onWin(eventName, bemNode._windowEventHandlers[eventName][i], true, false, true)
                    }
                }
            }

            if (isInnerCall === undefined) {
                function finalWalk (bemNode) {
                    for (var i = 0, ii = bemNode._children.length; i < ii; i++) {
                        if (bemNode._children[i] instanceof BemNode) {
                            finalWalk(bemNode._children[i])
                        }
                    }
                    for (var name in bemNode._mod) {
                        bemNode._callModHandlers(name, bemNode._mod[name])
                    }
                    bemNode._domInit()
                    bemNode._onAttach(true)
                }
                finalWalk(bemNode)
            }

            domNode.removeAttribute('data-event-handlers')
            domNode.removeAttribute('data-window-event-handlers')
            domNode.removeAttribute('data-mod-handlers')
            domNode.removeAttribute('data-mod')
            domNode.removeAttribute('data-param')
            domNode.removeAttribute('data-after-dom-init-handlers')
            domNode.removeAttribute('data-node-name')
            domNode.removeAttribute('data-implemented-node-name')
            domNode.removeAttribute('data-no-elems')

            return bemNode
        }
    }
    // TEXT_NODE
    else if (domNode.nodeType === 3) {
        parentBemNode.append(domNode.nodeValue)
        return domNode.nodeValue
    }

    return false
}

/**
 * Declaration standart fields:
 * - inherits       string|array Inherited declarations by selector
 * - expand         function     Expand instructions
 * - mod            object       Default modifiers
 * - noElems        object       If block can have elements
 * - param          object       Default parameters
 * - domInit        function     DOM inititial instructions
 * - on             object       Event handlers
 * - onWin          object       Window event hadnlers
 * - onMod          object       Modifier change actions
 * - tag            string       DOM tag name
 *
 * @selector string 'block' or 'block__elem'
 * @decl     object
 */
Beast.decl = function (selector, decl) {
    if (typeof selector === 'object') {
        for (var key in selector) {
            Beast.decl(key, selector[key])
        }
        return this
    } else {
        selector = selector.toLowerCase()
    }

    if (typeof decl.final === 'string') {
        decl.final = [decl.final]
    }

    if (typeof decl.inherits === 'string') {
        decl.inherits = [decl.inherits]
    }

    if (typeof decl.mix === 'string') {
        decl.mix = [decl.mix]
    }

    if (decl.inherits !== undefined) {
        for (var i = 0, ii = decl.inherits.length; i < ii; i++) {
            decl.inherits[i] = decl.inherits[i].toLowerCase()
        }
    }

    if (Declaration[selector] !== undefined) {
        extendDecl(decl, Declaration[selector])
    }

    Declaration[selector] = decl

    // Store element declartion in block declaration (for inheritance needs)
    var blockName = ''
    var elemName = ''

    if (selector.indexOf('__') === -1) {
        decl.__isBlock = true
        blockName = selector
    } else {
        decl.__isBlock = false

        var selectorParts = selector.split('__')
        blockName = selectorParts[0]
        elemName = selectorParts[1]

        if (Declaration[blockName] === undefined) {
            Declaration[blockName] = {}
        }

        if (Declaration[blockName].__elems === undefined) {
            Declaration[blockName].__elems = []
        }

        Declaration[blockName].__elems.push(elemName)
    }

    return this
}

/**
 * Extends declaration with another
 * @decl    object extending decl
 * @extDecl object decl to extend with
 */
function extendDecl (decl, extDecl) {
    for (var key in extDecl) {
        if (decl[key] === undefined) {
            decl[key] = extDecl[key]
        }
        else if (
            typeof extDecl[key] === 'object' && !Array.isArray(extDecl[key])
        ) {
            extendDecl(decl[key], extDecl[key])
        }
    }
}

/**
 * Creates bemNode object
 *
 * @name    string         Node name
 * @attr    object         Node attributes
 * @content string|bemNode Last multiple argument
 * @return  BemNode
 */
Beast.node = function (name, attr) {
    // No more Beast.decl() after the first Beast.node() call
    if (!DeclarationFinished) {
        DeclarationFinished = true
        CompileDeclarations()
    }

    return new BemNode(
        name, attr, Array.prototype.splice.call(arguments, 2)
    )
}

/**
 * Compiles declaration fileds to methods, makes inheritances
 */
function CompileDeclarations () {
    function extend (obj, extObj) {
        for (var key in extObj) {
            if (
                ReservedDeclarationProperies[key] === 2 ||
                extObj.final !== undefined && extObj.final.indexOf(key) !== -1
            ) {
                continue
            }

            if (obj[key] === undefined) {
                obj[key] = typeof extObj[key] === 'object' && extObj[key].constructor === 'Object'
                    ? cloneObject(extObj[key])
                    : extObj[key]
            }
            else if (
                typeof extObj[key] === 'function' && obj[key]._inheritedDeclFunction === undefined
            ) {
                (function (fn, inheritedFn, inheritedDecl) {
                    fn._inheritedDeclFunction = function () {
                        // Imitate inherited decl context for inner inherited() calls
                        var temp = this._decl
                        this._decl = inheritedDecl
                        inheritedFn.apply(this, arguments)
                        this._decl = temp
                    }
                })(obj[key], extObj[key], extObj)
            }
            else if (
                typeof extObj[key] === 'object' && !Array.isArray(extObj[key])
            ) {
                extend(obj[key], extObj[key])
            }
        }
    }

    function inherit (declSelector, decl, inheritedDecls, final) {
        for (var i = inheritedDecls.length - 1; i >= 0; i--) {
            var selector = inheritedDecls[i]
            var inheritedDecl = Declaration[selector]
            var prevFinal

            decl.__flattenInherits.push(selector.toLowerCase())

            if (inheritedDecl !== undefined) {
                extend(decl, inheritedDecl)

                if (inheritedDecl.finalMod === true) {
                    prevFinal = final
                    final = {selector:{}, mod:{}}
                }

                if (final !== undefined) {
                    final.selector[selector] = true
                    if (inheritedDecl.mod !== undefined) {
                        for (var modName in inheritedDecl.mod) {
                            final.mod[modName.toLowerCase()] = true
                        }
                    }
                }

                if (inheritedDecl.inherits !== undefined) {
                    inherit(declSelector, decl, inheritedDecl.inherits, final)
                }

                setFinal(decl, final)

                if (inheritedDecl.finalMod === true) {
                    final = prevFinal
                }

                // Automatic element inheritence for block
                if (inheritedDecl.__elems && decl.__isBlock) {
                    for (var j = 0, jj = inheritedDecl.__elems.length; j < jj; j++) {
                        var elemName = inheritedDecl.__elems[j]
                        var elemSelector = declSelector + '__' + elemName
                        if (Declaration[elemSelector] === undefined) {
                            Beast.decl(
                                elemSelector, {
                                    inherits: selector + '__' + elemName
                                }
                            )
                            if (generatedDeclSelectors.indexOf(elemSelector) === -1) {
                                generatedDeclSelectors.push(elemSelector)
                            }
                        }
                    }
                }
            }
        }
    }

    function setFinal (decl, final) {
        if (final !== undefined) {
            if (decl.__finalMod === undefined) {
                decl.__finalMod = {}
            }
            if (decl.__finalMod._selector === undefined) {
                decl.__finalMod._selector = {}
            }
            for (var modName in final.mod) {
                if (decl.__finalMod[modName] === undefined) {
                    decl.__finalMod[modName] = {}
                    for (var selector in final.selector) {
                        decl.__finalMod[modName][selector] = true
                        decl.__finalMod._selector[selector] = true
                    }
                }
            }
        }
    }

    var generatedDeclSelectors = []
    var forEachSelector = function (decl, selector) {

        var final
        if (decl.finalMod === true) {
            final = {selector:{}, mod:{}}
            final.selector[selector] = true
            if (decl.mod !== undefined) {
                for (var modName in decl.mod) {
                    final.mod[modName.toLowerCase()] = true
                }
            }
        }

        // Extend decl with inherited rules
        if (decl.inherits !== undefined) {
            decl.__flattenInherits = []
            inherit(selector, decl, decl.inherits, final)
        }

        setFinal(decl, final)

        // Compile expand rules to methods array
        var expandHandlers = []
        if (decl.implementWith !== undefined) {
            expandHandlers.unshift(function () {
                this.implementWith(
                    Beast.node(decl.implementWith, undefined, this.get())
                )
            })
        }
        if (decl.expand !== undefined) {
            expandHandlers.unshift(decl.expand)
        }
        if (decl.mix !== undefined) {
            expandHandlers.unshift(function () {
                this.mix.apply(this, decl.mix)
            })
        }
        if (decl.tag !== undefined) {
            expandHandlers.unshift(function () {
                this.tag(decl.tag)
            })
        }
        if (decl.noElems === true) {
            expandHandlers.unshift(function () {
                this.noElems()
            })
        }
        if (decl.domAttr !== undefined) {
            expandHandlers.unshift(function () {
                this.domAttr(decl.domAttr)
            })
        }
        if (decl.onMod !== undefined) {
            expandHandlers.unshift(function () {
                for (var modName in decl.onMod) {
                    for (var modValue in decl.onMod[modName]) {
                        this.onMod(modName, modValue, decl.onMod[modName][modValue], true)
                    }
                }
            })
        }
        if (decl.on !== undefined) {
            expandHandlers.unshift(function () {
                for (var events in decl.on) {
                    if (events === 'preventable') {
                        for (var preventableEvents in decl.on.preventable) {
                            this.on(preventableEvents, decl.on.preventable[preventableEvents], false, decl, true)
                        }
                    } else {
                        this.on(events, decl.on[events], false, decl)
                    }
                }
            })
        }
        if (decl.onWin !== undefined) {
            expandHandlers.unshift(function () {
                for (var events in decl.onWin) {
                    if (events === 'preventable') {
                        for (var preventableEvents in decl.onWin.preventable) {
                            this.onWin(preventableEvents, decl.onWin.preventable[preventableEvents], false, decl, true)
                        }
                    } else {
                        this.onWin(events, decl.onWin[events], false, decl)
                    }
                }
            })
        }

        // Compile expand handlers
        if (expandHandlers.length > 0) {
            decl.__commonExpand = function () {
                for (var i = 0, ii = expandHandlers.length; i < ii; i++) {
                    expandHandlers[i].call(this)
                }
            }
        }

        // Extract user methods
        decl.__userMethods = {}
        for (var key in decl) {
            if (ReservedDeclarationProperies[key] !== 1) {
                decl.__userMethods[key] = decl[key]
            }
        }

    }

    for (var selector in Declaration) {
        forEachSelector(Declaration[selector], selector)
    }

    if (generatedDeclSelectors.length !== 0) {
        for (var i = 0, ii = generatedDeclSelectors.length; i < ii; i++) {
            forEachSelector(
                Declaration[generatedDeclSelectors[i]],
                generatedDeclSelectors[i]
            )
        }
    }
}

/**
 * Set callback when Beast is ready
 *
 * @callback function Function to call
 */
Beast.onReady = function (callback) {
    if (BeastIsReady) {
        callback()
    } else {
        OnBeastReadyCallbacks.push(callback)
    }
}

;(function () {

Beast.parseBML = function (string) {
    js = ''
    buffer = ''
    char = ''
    prevChar = ''
    nextChar = ''
    lastPush = ''
    nodeAttrValueQuote = ''

    openNodesNum = 0
    openBracesNum = 0

    embedStack = []

    inBml = false
    inBmlComment = false
    inNode = false
    inClosingNode = false
    inNodeName = false
    inNodeAttrName = false
    inNodeAttrValue = false
    inNodeTextContent = false
    inSingleQuoteString = false
    inDoubleQuoteString = false
    inSingleLineComment = false
    inMultiLineComment = false
    inEmbed = false

    for (var i = 0, ii = string.length; i < ii; i++) {
        prevChar = i > 0 ? string[i - 1] : ''
        nextChar = i < ii - 1 ? string[i + 1] : ''
        char = string[i]

        // Reset escape char
        if (prevChar === '\\' && char === '\\') {
            prevChar = ''
        }

        /*
         * BML context
         */
        if (inBml) {
            // Node attr value
            if (inNodeAttrValue) {
                if (char === nodeAttrValueQuote && prevChar !== '\\') {
                    pushNodeAttrValue()
                }
                else if (char === '{' && prevChar !== '\\') {
                    pushNodeAttrValue(true)
                    pushEmbed()
                }
                else {
                    if ((char === '"' || char === "'") && prevChar !== '\\') {
                        buffer += '\\'
                    }
                    buffer += char
                }
            }
            // Comment
            else if (inBmlComment) {
                if (prevChar === '-' && char === '>') {
                    inBmlComment = false
                }
            }
            // Comment start
            else if (char === '<' && nextChar === '!') {
                inBmlComment = true
            }
            // Node text content
            else if (inNodeTextContent) {
                if (char === '<' && (nextChar === '/' || isLetter(nextChar))) {
                    pushNodeTextContent()
                }
                else if (char === '{' && prevChar !== '\\') {
                    pushNodeTextContent(true)
                    pushEmbed()
                }
                else {
                    if (char === '"') {
                        buffer += '\\' + char
                    }
                    else if (char === '\n') {
                        buffer += '\\n'
                    }
                    else {
                        buffer += char
                    }
                }
            }
            // Break char: space, new line or tab
            else if (isBreak(char)) {
                if (inNodeName) {
                    pushNodeName()
                    inNodeAttrName = true
                }
                else if (inNodeAttrName) {
                    pushNodeAttrName()
                }

                if (inNode && !inNodeName && isLetter(nextChar)) {
                    inNodeAttrName = true
                }
            }
            else if ((inNodeName || inNodeAttrName) && isLetterOrDigitOrDash(char)) {
                buffer += char

                // Node attr name start
                if (!inNodeName && !inNodeAttrName) {
                    inNodeAttrName = true
                }
            }
            // Node attr name end
            else if (inNodeAttrName && prevChar === '=' && (char === '"' || char === "'")) {
                pushNodeAttrName()
                inNodeAttrValue = true
                nodeAttrValueQuote = char
            }
            // Node opening start
            else if (!inNode && prevChar === '<' && isLetter(char)) {
                buffer += char
                inNode = true
                inNodeName = true
                pushNodeOpen()
            }
            // Node closing start
            else if (!inClosingNode && prevChar === '<' && char === '/' && isLetter(nextChar)) {
                inClosingNode = true
                inNodeName = true
            }
            // Single node closed
            else if (inNode && prevChar === '/' && char === '>') {
                if (inNodeName) {
                    pushNodeName()
                }
                if (inNodeAttrName) {
                    pushNodeAttrName()
                }

                pushClosingNode()
            }
            // Node opening end
            else if (inNode && char === '>') {
                if (inNodeName) {
                    pushNodeName()
                }
                if (inNodeAttrName) {
                    pushNodeAttrName()
                }

                pushOpeningNodeClose()
                inNodeTextContent = true
            }
            // Node closing end
            else if (char === '>' && inClosingNode) {
                pushClosingNode()
            }
            // Skip char for future
            else if (
                !(inNode && !inNodeAttrValue && char === '/' && nextChar === '>') &&
                !(inNodeAttrName && char === '=' && nextChar !== '=')
            ) {
                // Unexpected char
                throw (
                    'BML syntax error: Unexpected token "' + char + '": \n' +
                    string.substring(0, i+1).split('\n').slice(-5).join('\n') + '\n' +
                    js.slice(-100)
                )
            }
        }

        /*
         * JS context
         */
        else {
            // New line
            if (char === '\n') {
                if (inSingleLineComment) {
                    inSingleLineComment = false
                }
            }
            // Single line comment
            else if (prevChar === '/' && char === '/' && !inSingleQuoteString && !inDoubleQuoteString) {
                if (!inSingleLineComment) {
                    inSingleLineComment = true
                }
            }
            // Multi line comment
            else if (prevChar === '/' && char === '*' && !inSingleQuoteString && !inDoubleQuoteString) {
                if (!inMultiLineComment) {
                    inMultiLineComment = true
                }
            }
            else if (prevChar === '*' && char === '/' && !inSingleQuoteString && !inDoubleQuoteString) {
                if (inMultiLineComment) {
                    inMultiLineComment = false
                }
            }
            // If not inside comment
            else if (!inSingleLineComment && !inMultiLineComment) {
                // Single quote string
                if (!inDoubleQuoteString && char === "'" && prevChar !== '\\') {
                    inSingleQuoteString = !inSingleQuoteString
                }
                // Double quote string
                else if (!inSingleQuoteString && char === '"' && prevChar !== '\\') {
                    inDoubleQuoteString = !inDoubleQuoteString
                }
                // If not inside string
                else if (!inSingleQuoteString && !inDoubleQuoteString) {
                    // Embedded JS
                    if (inEmbed) {
                        if (char === '{') {
                            openBracesNum++
                        }
                        else if (char === '}') {
                            openBracesNum--
                        }

                        if (openBracesNum === 0) {
                            popEmbed()
                        }
                    }

                    // BML
                    if (!inBml && char === '<' && isLetter(nextChar)) {
                        inBml = true

                        if (inEmbed) {
                            embedStack.push([openNodesNum, openBracesNum, inNode, inNodeTextContent, inNodeAttrValue, nodeAttrValueQuote])
                            openNodesNum = 0
                            openBracesNum = 0
                            inNode = false
                            inNodeTextContent = false
                            inNodeAttrValue = false
                            nodeAttrValueQuote = ''
                        }
                    }
                }
            }
        }

        if (!inBml && char !== '') {
            js += char
        }
    }

    return js
}

var js = ''
var buffer = ''
var char = ''
var prevChar = ''
var nextChar = ''
var lastPush = ''
var nodeAttrValueQuote = ''

var openNodesNum = 0
var openBracesNum = 0

var embedStack = []

var inBml = false
var inBmlComment = false
var inNode = false
var inClosingNode = false
var inNodeName = false
var inNodeAttrName = false
var inNodeAttrValue = false
var inNodeTextContent = false
var inSingleQuoteString = false
var inDoubleQuoteString = false
var inSingleLineComment = false
var inMultiLineComment = false
var inEmbed = false

function pushNodeOpen () {

    if (!inEmbed || openNodesNum > 0) {
        if (lastPush === 'closingNode') {
            js += ','
        }
        else if (lastPush === 'nodeTextContent') {
            js += ','
        }
        else if (lastPush === 'embed') {
            js += ','
        }
        else if (lastPush === 'openingNodeClose') {
            js += ','
        }
        else if (lastPush === 'nodeName') {
            js += ',undefined,'
        }
        else if (lastPush === 'nodeAttrName') {
            js += 'true},'
        }
        else if (lastPush === 'nodeAttrValue') {
            js += '},'
        }
    }

    openNodesNum++
    js += 'Beast.node('
    lastPush = 'nodeOpen'
}

function pushClosingNode () {
    if (lastPush === 'nodeAttrName') {
        js += 'true}'
    }
    else if (lastPush === 'nodeAttrValue') {
        js += '}'
    }

    openNodesNum--
    js += ')'
    buffer = ''
    inNode = false
    inClosingNode = false
    inNodeTextContent = true
    inNodeName = false
    lastPush = 'closingNode'

    if (openNodesNum === 0) {
        if (inEmbed) {
            var parserState = embedStack.pop()
            openNodesNum = parserState[0]
            openBracesNum = parserState[1]
            inNode = parserState[2]
            inNodeTextContent = parserState[3]
            inNodeAttrValue = parserState[4]
            nodeAttrValueQuote = parserState[5]
        } else {
            inNodeTextContent = false
        }

        inBml = false
        char = ''
        prevChar = ''
        nextChar = ''
        lastPush = ''
    }
}

function pushNodeName () {
    js += '"' + buffer + '"'
    buffer = ''
    inNodeName = false
    lastPush = 'nodeName'

    if (openNodesNum === 1 && !inEmbed) {
        js += ',{__context:this'
        lastPush = 'nodeAttrValue'
    }
}

function pushNodeAttrName () {
    if (lastPush === 'nodeName') {
        js += ',{'
    }
    else if (lastPush === 'nodeAttrName') {
        js += 'true,'
    }
    else if (lastPush === 'nodeAttrValue') {
        js += ','
    }

    js += '"' + buffer + '":'
    buffer = ''
    inNodeAttrName = false
    lastPush = 'nodeAttrName'
}

function pushNodeAttrValue (beforePushEmbed) {
    if (lastPush === 'embed') {
        if (buffer !== '') {
            js += '+'
        }
    }
    else if (lastPush === 'nodeAttrName' && buffer === '' && beforePushEmbed === undefined) {
        js += 'false'
    }

    if (buffer !== '') {
        if (beforePushEmbed === undefined) {
            js += isNaN(buffer) || lastPush === 'embed' ? '"' + buffer + '"' : buffer
            buffer = ''
        } else {
            js += '"' + buffer + '"'
        }
    }

    if (beforePushEmbed === undefined) {
        nodeAttrValueQuote = ''
        inNodeAttrValue = false
    }

    lastPush = 'nodeAttrValue'
}

function pushOpeningNodeClose () {
    if (lastPush === 'nodeName') {
        if (nextChar !== '<') {
            js += ',undefined'
        }
    }
    else if (lastPush === 'nodeAttrName') {
        js += 'true}'
    }
    else if (lastPush === 'nodeAttrValue') {
        js += '}'
    }

    inNode = false
    lastPush = 'openingNodeClose'
}

function pushNodeTextContent (beforePushEmbed) {
    if (buffer !== '') {
        if (lastPush === 'closingNode') {
            js += ','
        }
        else if (lastPush === 'embed') {
            js += ','
        }
        else if (lastPush === 'openingNodeClose') {
            js += ','
        }

        js += '"' + buffer + '"'
        buffer = ''
        lastPush = 'nodeTextContent'
    }

    if (beforePushEmbed === undefined) {
        inNodeTextContent = false
    }
}

function pushEmbed () {
    if (inNodeTextContent) {
        if (lastPush === 'closingNode') {
            js += ','
        }
        else if (lastPush === 'nodeTextContent') {
            js += ','
        }
        else if (lastPush === 'openingNodeClose') {
            js += ','
        }
    }
    else if (inNodeAttrValue) {
        if (buffer !== '') {
            js += '+'
            buffer = ''
        }
    }

    openBracesNum++
    inBml = false
    inEmbed = true
    char = ''
    lastPush = 'embed'
}


function popEmbed () {
    if (inNodeAttrValue) {
        if (buffer !== '') {
            js += buffer
            buffer = ''
        }
    }

    inBml = true

    if (embedStack.length === 0) {
        inEmbed = false
    }

    lastPush = 'embed'
}

function isLetter (char) {
    return char >= 'A' && char <= 'z'
}

function isLetterOrDigitOrDash (char) {
    return char >= 'A' && char <= 'z' || char >= '0' && char <= '9' || char === '-'
}

function isBreak (char) {
    return char === ' ' || char === '\n' || char === '\t'
}

})();

/**
 * Parses and evaluates BML-string
 */
Beast.evalBML = function (string) {
    return eval(Beast.parseBML(string))
}

/**
 * Extracts keys from object in @arguments
 * @return Array Array of keys
 */
function keysFromObjects () {
    var keys = []
    for (var i = 0, ii = arguments.length; i < ii; i++) {
        if (arguments[i] === undefined) {
            continue
        }
        for (var key in arguments[i]) {
            if (keys.indexOf(key) === -1) {
                keys.push(key)
            }
        }
    }
    return keys
}

/**
 * BEM node class
 *
 * @nodeName string Starts with capital for block else for elem
 * @attr     object List of attributes
 * @children array  Child nodes
 */
var BemNode = function (nodeName, attr, children) {
    this._selector = ''                     // BEM-name: 'block' or 'block__elem'
    this._nodeName = nodeName               // BML-node name
    this._attr = attr || {}                 // BML-node attributes
    this._isBlock = false                   // flag if node is block
    this._isElem = false                    // flag if node is elem
    this._mod = {}                          // modifiers list
    this._param = {}                        // parameters list
    this._domNode = undefined               // DOM-node reference
    this._domAttr = {}                      // DOM-attributes
    this._domNodeEventHandlers = undefined  // DOM event handlers
    this._windowEventHandlers = undefined   // window event handlers
    this._modHandlers = undefined           // handlers on modifiers change
    this._domInitHandlers = []              // Handlers called after DOM-node inited
    this._domInited = false                 // Flag if DOM-node inited
    this._parentBlock = undefined           // parent block bemNode reference
    this._parentNode = undefined            // parent bemNode reference
    this._prevParentNode = undefined        // previous parent node value when parent node redefined
    this._children = []                     // list of children
    this._expandedChildren = undefined      // list of expanded children (for expand method purposes)
    this._isExpanded = false                // if Bem-node was expanded
    this._isExpandContext = false           // when flag is true append modifies expandedChildren
    this._isReplaceContext = false          // when flag is true append don't renders children's DOM
    this._isDomInitContext = false          // when flag is true inside domInit functions
    this._mix = []                          // list of additional CSS classes
    this._tag = 'div'                       // DOM-node name
    this._noElems = false                   // Flag if block can have children
    this._implementedNode = undefined       // Node wich this node implements
    this._css = {}                          // CSS properties
    this._cssClasses = undefined            // cached string of CSS classes
    this._decl = undefined                  // declaration for component
    this._flattenInherits = undefined       // array of flattened inherited declarations
    this._flattenInheritsForDom = undefined // array of inherited declarations to add as DOM-classes
    this._renderedOnce = false              // flag if component was rendered at least once
    this._elems = []                        // array of elements (for block only)

    // Define if block or elem
    var firstLetter = nodeName.substr(0,1)
    this._isBlock = firstLetter === firstLetter.toUpperCase()
    this._isElem = !this._isBlock

    // Define mods, params and special params
    for (var key in this._attr) {
        var firstLetter = key.substr(0,1)

        if (key === '__context') {
            if (this._parentBlock === undefined) {
                this.parentBlock(this._attr.__context)
            }
        } else if (firstLetter === firstLetter.toUpperCase()) {
            this._mod[key.toLowerCase()] = this._attr[key]
        } else {
            this._param[key.toLowerCase()] = this._attr[key]
        }
    }

    // Initial operations for block
    if (this._isBlock) {
        this._parentBlock = this
        this._defineDeclarationBySelector(nodeName.toLowerCase())
    }

    // Append children
    this.append.apply(this, children)
}

BemNode.prototype = {

    /**
     * Defines declaraion
     */
    _defineDeclarationBySelector: function (selector) {

        // Rerset old mods, params and state when declaration redefined
        if (this._decl !== undefined) {
            if (this._decl.mod !== undefined) {
                var nameLC
                for (var name in this._decl.mod) {
                    nameLC = name.toLowerCase()
                    if (this._mod[nameLC] === this._decl.mod[name]) {
                        this._mod[nameLC] = undefined
                    }
                }
            }
            if (this._decl.param !== undefined) {
                var nameLC
                for (var name in this._decl.param) {
                    nameLC = name.toLowerCase()
                    if (this._param[nameLC] === this._decl.param[name]) {
                        this._param[nameLC] = undefined
                    }
                }
            }
        }

        this._selector = selector
        this._decl = Declaration[this._selector]
        this._flattenInherits = this._decl && this._decl.__flattenInherits // in case of temporary _decl change
        this._flattenInheritsForDom = undefined

        if (this._decl !== undefined) {

            if (this._decl.mod !== undefined) {
                this.defineMod(this._decl.mod)
            }
            if (this._decl.param !== undefined) {
                this.defineParam(this._decl.param)
            }
        }

        if (this._flattenInherits !== undefined) {
            for (var i = 0, ii = this._flattenInherits.length, decl; i < ii; i++) {
                decl = Declaration[this._flattenInherits[i]]
                if (decl === undefined || decl.abstract === undefined) {
                    if (this._flattenInheritsForDom === undefined) {
                        this._flattenInheritsForDom = []
                    }
                    this._flattenInheritsForDom.push(this._flattenInherits[i])
                }
                else if (decl !== undefined) {
                    if (decl.mod !== undefined) {
                        this.defineMod(decl.mod)
                    }
                    if (decl.param !== undefined) {
                        this.defineParam(decl.param)
                    }
                }
            }
        }

        this._defineUserMethods()
    },

    /**
     * Defines user's methods
     */
    _defineUserMethods: function (selector) {
        var decl = selector !== undefined ? Declaration[selector] : this._decl
        if (decl) {
            for (var methodName in decl.__userMethods) {
                this[methodName] = decl.__userMethods[methodName]
            }
        }
    },

    /**
     * Clears user's methods
     */
    _clearUserMethods: function () {
        if (this._selector === '' || !Declaration[this._selector]) return
        var userMethods = Declaration[this._selector].__userMethods
        for (var methodName in userMethods) {
            this[methodName] = undefined
        }
    },

    /**
     * Runs overwritten method's code
     *
     * @caller function ECMA6 claims caller function link
     */
    inherited: function (caller) {
        if (caller && caller._inheritedDeclFunction !== undefined) {
            caller._inheritedDeclFunction.apply(
                this,
                Array.prototype.splice.call(arguments, 1)
            )
        }

        return this
    },

    /**
     * Checks if component is @selctor was inherited from @selector
     *
     * @selector string
     * @return boolean
     */
    isKindOf: function (selector) {
        selector = selector.toLowerCase()
        var isKindOfSelector = this._selector === selector

        if (!isKindOfSelector && this._flattenInherits !== undefined) {
            isKindOfSelector = this._flattenInherits.indexOf(selector) > -1
        }

        return isKindOfSelector
    },

    /**
     * If node is block
     *
     * @return boolean
     */
    isBlock: function () {
        return this._isBlock
    },

    /**
     * If node is element
     *
     * @return boolean
     */
    isElem: function () {
        return this._isElem
    },

    /**
     * Gets block or element name: 'block' or 'block__element'
     *
     * @return string
     */
    selector: function () {
        return this._selector
    },

    /**
     * Gets or sets node's tag name
     *
     * @return string
     */
    tag: function (tag) {
        if (tag === undefined) {
            return this._tag
        } else {
            if (!this._domNode) {
                this._tag = tag
            }
            return this
        }
    },

    /**
     * Sets css
     *
     * @name  string        css-property name
     * @value string|number css-property value
     */
    css: function (name, value) {
        if (typeof name === 'object') {
            for (var key in name) this.css(key, name[key])
        } else if (value === undefined) {
            if (this._domNode !== undefined && this._css[name] === undefined) {
                return window.getComputedStyle(this._domNode).getPropertyValue(name)
            } else {
                return this._css[name]
            }
        } else {
            if (typeof value === 'number' && CssPxProperty[name]) {
                value += 'px'
            }

            this._css[name] = value

            if (this._domNode) {
                this._setDomNodeCSS(name)
            }
        }

        return this
    },

    /**
     * Sets _noElems flag true
     */
    noElems: function () {
        this._noElems = true

        var parentOfParentBlock = this._parentBlock._parentNode
        while (parentOfParentBlock._noElems === true) {
            parentOfParentBlock = parentOfParentBlock._parentBlock._parentNode
        }
        this._setParentBlockForChildren(this, parentOfParentBlock)

        return this
    },

    /**
     * Only for elements. Gets or sets parent block bemNode reference.
     * Also sets bemNode name adding 'blockName__' before element name.
     * [@bemNode, [@dontAffectChildren]]
     *
     * @bemNode            object  Parent block node
     * @dontAffectChildren boolean If true, children won't get this parent block reference
     */
    parentBlock: function (bemNode, dontAffectChildren) {
        if (bemNode !== undefined) {
            if (this._isElem
                && bemNode instanceof BemNode
                && bemNode !== this._parentBlock) {

                if (bemNode._parentBlock !== undefined && bemNode._parentBlock._noElems) {
                    return this.parentBlock(bemNode._parentNode, dontAffectChildren)
                }

                this._clearUserMethods()
                this._removeFromParentBlockElems()
                this._parentBlock = bemNode._parentBlock
                this._addToParentBlockElems()
                this._defineDeclarationBySelector(
                    this._parentBlock._selector + '__' + this._nodeName.toLowerCase()
                )

                if (!dontAffectChildren) {
                    this._setParentBlockForChildren(this, bemNode)
                }

            }
            return this
        } else {
            return this._implementedNode !== undefined
                ? this._implementedNode._parentBlock
                : this._parentBlock
        }
    },

    /**
     * Recursive parent block setting
     *
     * @bemNode     object current node with children
     * @parentBlock object paren block reference
     */
    _setParentBlockForChildren: function (bemNode, parentBlock) {
        for (var i = 0, ii = bemNode._children.length; i < ii; i++) {
            var child = bemNode._children[i]
            if (child instanceof BemNode) {
                if (child._isElem) {
                    child.parentBlock(parentBlock)
                } else if (child._implementedNode !== undefined && child._implementedNode._isElem) {
                    child._implementedNode.parentBlock(parentBlock, true)
                }
            }
        }
    },

    /**
     * Gets or sets parent bemNode reference
     * [@bemNode]
     *
     * @bemNode object parent node
     */
    parentNode: function (bemNode) {
        if (bemNode !== undefined) {
            if (this._renderedOnce) {
                this.detach()
            }
            if (bemNode !== this._parentNode) {
                this._prevParentNode = this._parentNode
                this._parentNode = bemNode
            }
            return this
        } else {
            return this._parentNode
        }
    },

    /**
     * Gets DOM-node reference
     */
    domNode: function () {
        return this._domNode
    },

    /**
     * Set or get dom attr
     * @name, [@value]
     *
     * @name  string Attribute name
     * @value string Attribute value
     */
    domAttr: function (name, value, domOnly) {
        if (typeof name === 'object') {
            for (var key in name) this.domAttr(key, name[key])
        } else if (value === undefined) {
            return this._domNode === undefined ? this._domAttr[name] : this._domNode[name]
        } else {
            if (!domOnly) {
                this._domAttr[name] = value
            }
            if (this._domNode) {
                if (value === false || value === '') {
                    this._domNode.removeAttribute(name)
                } else {
                    this._domNode.setAttribute(name, value)
                }
            }
        }

        return this
    },

    /**
     * Define modifiers and its default values
     */
    defineMod: function (defaults) {
        if (this._implementedNode) {
            this._implementedNode._extendProperty('_mod', defaults)
        }
        return this._extendProperty('_mod', defaults)
    },

    /**
     * Extends object property with default object
     *
     * @propertyName string
     * @defaults     object
     */
    _extendProperty: function (propertyName, defaults, force)
    {
        var actuals = this[propertyName]
        var keyLC

        for (var key in defaults) {
            keyLC = key.toLowerCase()
            if ((force === true && defaults[key] !== undefined) || actuals[keyLC] === undefined || actuals[keyLC] === '') {
                actuals[keyLC] = defaults[key]
            }
        }

        return this
    },

    /**
     * Define parameters and its default values
     */
    defineParam: function (defaults) {
        return this._extendProperty('_param', defaults)
    },

    /**
     * Sets or gets mod
     * @name, [@value, [@data]]
     *
     * @name  string         Modifier name
     * @value string|boolean Modifier value
     * @data  anything       Additional data
     */
    mod: function (name, value, data) {
        if (name === undefined) {
            return this._mod
        } else if (typeof name === 'string') {
            name = name.toLowerCase()
        } else {
            for (var key in name) this.mod(key, name[key])
            return this
        }

        if (value === undefined) {
            return this._mod[name]
        } else if (this._mod[name] !== value) {
            this._cssClasses = undefined
            this._mod[name] = value
            if (this._implementedNode !== undefined) {
                this._implementedNode._cssClasses = undefined
                this._implementedNode._mod[name] = value
            }
            if (this._domNode !== undefined) {
                this._setDomNodeClasses()
                this._callModHandlers(name, value, data)
            }
        }

        return this
    },

    /**
     * Adds additional CSS-classes
     */
    mix: function () {
        for (var i = 0, ii = arguments.length; i < ii; i++) {
            this._mix.push(arguments[i])
        }

        if (this._domNode !== undefined) {
            this._setDomNodeClasses()
        }

        return this
    },

    /**
     * Toggles mods.
     *
     * @name   string         Modifier name
     * @value1 string|boolean Modifier value 1
     * @value2 string|boolean Modifier value 2
     */
    toggleMod: function (name, value1, value2, flag) {
        if (!this.mod(name)) {
            this.mod(name, value1, flag)
        } else if (this.mod(name) === value2) {
            this.mod(name, value1, flag)
        } else {
            this.mod(name, value2, flag)
        }

        return this
    },

    /**
     * Sets or gets parameter.
     * @name, [@value]
     *
     * @name  string
     * @value anything
     */
    param: function (name, value) {
        if (name === undefined) {
            return this._param
        } else if (typeof name === 'string') {
            name = name.toLowerCase()
        } else {
            for (var key in name) this.param(key, name[key])
            return this
        }

        if (value === undefined) {
            return this._param[name]
        } else {
            this._param[name] = value
        }

        return this
    },

    /**
     * Sets events handler
     *
     * @events  string   Space splitted event list: 'click' or 'click keypress'
     * @handler function
     */
    on: function (event, handler, isSingleEvent, fromDecl, dontCache, preventable) {
        if (typeof handler !== 'function') {
            return this
        }

        if (preventable === undefined) {
            preventable = false
        }

        if (handler.isBoundToNode === undefined) {
            var handlerOrigin = handler
            var handlerWrap = function (e) {
                handlerOrigin.call(this, e, e.detail)
            }
            handler = handlerWrap.bind(this)
            handler.isBoundToNode = true
            handler.unbindedHandler = handlerWrap
        }

        // Used in toHtml() method to restore function links
        if (fromDecl && handler.beastDeclPath === undefined) {
            handler.beastDeclPath = 'Beast.declaration["' + this._selector + '"].on["' + event + '"]'
        }

        if (!isSingleEvent && event.indexOf(' ') > -1) {
            var events = event.split(' ')
            for (var i = 0, ii = events.length; i < ii; i++) {
                this.on(events[i], handler, true, fromDecl)
            }
        } else {
            if (this._domNode !== undefined) {
                this._domNode.addEventListener(event, handler, {passive: !preventable})
            }

            if (dontCache === undefined) {
                if (this._domNodeEventHandlers === undefined) {
                    this._domNodeEventHandlers = {}
                }
                if (this._domNodeEventHandlers[event] === undefined) {
                    this._domNodeEventHandlers[event] = []
                }
                this._domNodeEventHandlers[event].push(handler)
            }

            if (this._isExpandContext && fromDecl === undefined) {
                handler.isExpandContext = true
                this._hasExpandContextEventHandlers = true
            }

            if (this._isDomInitContext) {
                handler.isDomInitContext = true
                this._hasDomInitContextEventHandlers = true
            }
        }

        return this
    },

    /**
     * Sets modifier change handler
     *
     * @modName  string
     * @modValue string|boolean
     * @handler  function
     */
    onWin: function (event, handler, isSingleEvent, fromDecl, dontCache, preventable) {
        if (typeof handler !== 'function') {
            return this
        }

        if (preventable === undefined) {
            preventable = false
        }

        if (handler.isBoundToNode === undefined) {
            var handlerOrigin = handler
            handler = function (e) {
                handlerOrigin.call(this, e, e.detail)
            }.bind(this)
            handler.isBoundToNode = true
        }

        // Used in toHtml() method to restore function links
        if (fromDecl && handler.beastDeclPath === undefined) {
            handler.beastDeclPath = 'Beast.declaration["' + this._selector + '"].onWin["' + event + '"]'
        }

        if (!isSingleEvent && event.indexOf(' ') > -1) {
            var events = event.split(' ')
            for (var i = 0, ii = events.length; i < ii; i++) {
                this.onWin(events[i], handler, true, fromDecl)
            }
        } else {
            if (this._domNode !== undefined) {
                window.addEventListener(event, handler, {passive: !preventable})
            }

            if (!dontCache) {
                if (this._windowEventHandlers === undefined) {
                    this._windowEventHandlers = {}
                }
                if (this._windowEventHandlers[event] === undefined) {
                    this._windowEventHandlers[event] = []
                }
                this._windowEventHandlers[event].push(handler)
            }

            if (this._isExpandContext && !fromDecl) {
                handler.isExpandContext = true
                this._hasExpandContextWindowEventHandlers = true
            }
            if (this._isDomInitContext) {
                handler.isDomInitContext = true
                this._hasDomInitContextWindowEventHandlers = true
            }
        }

        return this
    },

    /**
     * Sets modifier change handler
     *
     * @modName  string
     * @modValue string|boolean
     * @handler  function
     * @fromDecl boolean Private param for cache
     */
    onMod: function (modName, modValue, handler, fromDecl) {

        if (this._isExpandContext && !fromDecl) {
            handler.isExpandContext = true
            this._hasExpandContextModHandlers = true
        }

        // Used in toHtml() method to restore function links
        if (fromDecl) {
            handler.beastDeclPath = 'Beast.declaration["' + this._selector + '"].onMod["' + modName + '"]["' + modValue + '"]'
        }

        modName = modName.toLowerCase()

        if (this._modHandlers === undefined) {
            this._modHandlers = {}
        }
        if (this._modHandlers[modName] === undefined) {
            this._modHandlers[modName] = {}
        }
        if (this._modHandlers[modName][modValue] === undefined) {
            this._modHandlers[modName][modValue] = []
        }
        this._modHandlers[modName][modValue].push(handler)

        return this
    },

    /**
     * Triggers event
     *
     * @eventName string
     * @data      anything Additional data
     */
    trigger: function (eventName, data) {
        if (this._domNode !== undefined) {
            this._domNode.dispatchEvent(
                data !== undefined
                    ? new CustomEvent(eventName, {detail:data})
                    : new Event(eventName)
            )
        }

        return this
    },

    /**
     * Triggers window event
     *
     * @eventName string
     * @data      anything Additional data
     */
    triggerWin: function (eventName, data) {
        if (this._domNode !== undefined) {
            eventName = this.parentBlock()._nodeName + ':' + eventName
            window.dispatchEvent(
                data !== undefined
                    ? new CustomEvent(eventName, {detail:data})
                    : new Event(eventName)
            )
        }

        return this
    },

    /**
     * Gets current node index among siblings
     *
     * @return number
     */
    index: function (allowStrings) {
        var siblings = this._parentNode._children
        var dec = 0
        for (var i = 0, ii = siblings.length; i < ii; i++) {
            if (typeof siblings[i] === 'string') dec++
            if (siblings[i] === this) return allowStrings ? i : i - dec
        }
    },

    /**
     * Empties children
     */
    empty: function () {
        var children

        if (this._isExpandContext) {
            children = this._expandedChildren
            this._expandedChildren = []
        } else {
            children = this._children
            this._children = []
        }

        if (children) {
            for (var i = 0, ii = children.length; i < ii; i++) {
                if (children[i] instanceof BemNode) {
                    children[i].remove()
                }
            }
        }

        if (this._domNode) {
            // Child text nodes could be left
            while (this._domNode.firstChild) {
                this._domNode.removeChild(this._domNode.firstChild)
            }
        }

        return this
    },

    /**
     * Removes itself from parent block elems array
     */
    _removeFromParentBlockElems: function () {
        var parentBlock

        if (this._isElem) {
            parentBlock = this._parentBlock
        } else if (this._isBlock && this._implementedNode !== undefined) {
            parentBlock = this._implementedNode._parentBlock
        }

        if (parentBlock !== undefined) {
            for (var i = 0, ii = parentBlock._elems.length; i < ii; i++) {
                if (parentBlock._elems[i] === this) {
                    parentBlock._elems.splice(i, 1)
                    break
                }
            }
        }
    },

    /**
     * Adds itself to parent block elems array
     */
    _addToParentBlockElems: function () {
        var parentBlock

        if (this._isElem) {
            parentBlock = this._parentBlock
        } else if (this._isBlock && this._implementedNode !== undefined) {
            parentBlock = this._implementedNode._parentBlock
        }

        if (parentBlock !== undefined) {
            parentBlock._elems.push(this)
        }
    },

    /**
     * Removes itself
     */
    remove: function () {
        this._onRemove()

        // Proper remove children
        for (var i = 0, ii = this._children.length; i < ii; i++) {
            if (this._children[i] instanceof BemNode) {
                this._children[i].remove()
                i--
            }
        }

        // Remove window handlers
        if (this._windowEventHandlers !== undefined) {
            for (var eventName in this._windowEventHandlers) {
                for (var i = 0, ii = this._windowEventHandlers[eventName].length; i < ii; i++) {
                    window.removeEventListener(
                        eventName, this._windowEventHandlers[eventName][i]
                    )
                }
            }
        }

        this.detach()
    },

    /**
     * Instructions before removing node
     */
    _onRemove: function () {
        if (this._decl !== undefined && this._decl.onRemove !== undefined) {
            this._decl.onRemove.call(this)
        }
    },

    /**
     * Detaches itself
     */
    detach: function () {

        // Remove DOM node
        if (this._domNode && this._domNode.parentNode) {
            this._domNode.parentNode.removeChild(this._domNode)
        }

        // Remove from parentNode's children
        if (this._parentNode) {
            this._parentNode._children.splice(
                this._parentNode._children.indexOf(this), 1
            )
            this._parentNode = undefined
        }

        this._removeFromParentBlockElems()

        return this
    },

    /**
     * Inserts new children by index. If there's no DOM yet,
     * appends to expandedChildren else appends to children
     * and renders its DOM.
     *
     * @children string|object Children to insert
     * @index    number        Index to insert
     */
    insertChild: function (children, index) {
        for (var i = 0, ii = children.length; i < ii; i++) {
            var child = children[i]

            if (child === false || child === null || child === undefined) {
                continue
            } else if (Array.isArray(child)) {
                this.insertChild(child, index)
                continue
            } else if (child instanceof BemNode) {
                child.parentNode(this)
                if (child._isElem) {
                    if (this._isBlock) {
                        child.parentBlock(this)
                    } else if (this._parentBlock !== undefined) {
                        child.parentBlock(this._parentBlock)
                    }
                }
            } else if (typeof child === 'number') {
                child = child.toString()
            }

            var childrenToChange = this._children

            if (this._isExpandContext) {
                if (this._expandedChildren === undefined) {
                    this._expandedChildren = []
                }
                childrenToChange = this._expandedChildren
            }

            if (index === 0) {
                childrenToChange.unshift(child)
            } else if (index === -1) {
                childrenToChange.push(child)
            } else {
                childrenToChange.splice(index, 0, child)
            }

            if (this._domNode && !this._isReplaceContext) {
                this._renderChildWithIndex(
                    index === -1 ? childrenToChange.length - 1 : index
                )
            }
        }

        return this
    },

    /**
     * Appends new children. If there's no DOM yet,
     * appends to expandedChildren else appends to children
     * and renders its DOM.
     *
     * @children string|object Multiple argument
     */
    append: function () {
        return this.insertChild(arguments, -1)
    },

    /**
     * Prepends new children. If there's no DOM yet,
     * appends to expandedChildren else appends to children
     * and renders its DOM.
     *
     * @children string|object Multiple argument
     */
    prepend: function () {
        return this.insertChild(arguments, 0)
    },

    /**
     * Appends node to the target. If current node belongs to another parent,
     * method removes it from the old context.
     *
     * @bemNode object Target
     */
    appendTo: function (bemNode) {
        bemNode.append(this)
        return this
    },

    /**
     * Prepends node to the target. If current node belongs to another parent,
     * method removes it from the old context.
     *
     * @bemNode object Target
     */
    prependTo: function (bemNode) {
        bemNode.prepend(this)
        return this
    },

    /**
     * Replaces current bemNode with the new
     * @bemNode   BemNode Node that replaces
     * @ignoreDom boolean Private flag - do not change DOM; used in toHtml() method
     */
    replaceWith: function (bemNode, ignoreDom) {
        this._completeExpand()

        var parentNode = this._parentNode
        var siblingsAfter

        if (parentNode !== undefined) {
            if (parentNode === bemNode) {
                parentNode = this._prevParentNode
            } else {
                siblingsAfter = parentNode._children.splice(this.index(true))
                siblingsAfter.shift()
            }
            parentNode._isReplaceContext = true
            parentNode.append(bemNode)
            parentNode._isReplaceContext = false
        }

        if (siblingsAfter !== undefined) {
            parentNode._children = parentNode._children.concat(siblingsAfter)
        }

        this._parentNode = undefined

        if (bemNode instanceof BemNode) {
            if (bemNode._isBlock) {
                bemNode._resetParentBlockForChildren()
            }

            if (ignoreDom === undefined) {
                bemNode.render()
            }
        }
    },

    /**
     * Recursive setting parentBlock as this for child elements
     */
    _resetParentBlockForChildren: function () {
        for (var i = 0, ii = this._children.length; i < ii; i++) {
            var child = this._children[i]
            if (child instanceof BemNode && child._isElem) {
                child.parentBlock(this._parentBlock)
                child._resetParentBlockForChildren(this._parentBlock)
            }
        }
    },

    /**
     * Replaces current bemNode with the new wich implemets its declaration
     * @bemNode   BemNode Node that implements
     * @ignoreDom boolean Private flag - do not change DOM; used in toHtml() method
     */
    implementWith: function (bemNode, ignoreDom) {
        this._cssClasses = undefined

        if (this._domNodeEventHandlers !== undefined) {
            bemNode._domNodeEventHandlers = this._domNodeEventHandlers

            for (var key in bemNode._domNodeEventHandlers) {
                for (var i = 0, ii = bemNode._domNodeEventHandlers[key].length, beastDeclPath; i < ii; i++) {
                    beastDeclPath = bemNode._domNodeEventHandlers[key][i].beastDeclPath
                    bemNode._domNodeEventHandlers[key][i] = bemNode._domNodeEventHandlers[key][i].unbindedHandler.bind(bemNode)
                    bemNode._domNodeEventHandlers[key][i].beastDeclPath = beastDeclPath
                }
            }
        }

        if (this._windowEventHandlers !== undefined) {
            bemNode._windowEventHandlers = this._windowEventHandlers
        }

        if (this._modHandlers !== undefined) {
            bemNode._modHandlers = this._modHandlers
        }

        bemNode._implementedNode = this
        this._implementedWith = bemNode

        bemNode._extendProperty('_mod', this._mod, true)
        bemNode._extendProperty('_param', this._param, true)
        this._extendProperty('_mod', bemNode._mod)

        bemNode._defineUserMethods(this._selector)

        if (this._parentBlock !== undefined && this._parentBlock._elems !== undefined) {
            for (var i = 0, ii = this._parentBlock._elems.length; i < ii; i++) {
                if (this._parentBlock._elems[i] === this) {
                    this._parentBlock._elems[i] = bemNode
                    break
                }
            }
        }

        this.replaceWith(bemNode, ignoreDom)
    },

    /**
     * Filters text in children
     *
     * @return string
     */
    text: function () {
        var text = ''
        for (var i = 0, ii = this._children.length; i < ii; i++) {
            if (typeof this._children[i] === 'string') {
                text += this._children[i]
            }
        }

        return text
    },

    /**
     * Gets elements by name
     */
    elem: function () {
        if (this._isElem) {
            return this.elem.apply(this._parentBlock, arguments)
        }

        if (arguments.length === 0) {
            return this._elems
        }

        var elems = []
        for (var i = 0, ii = this._elems.length, elem; i < ii; i++) {
            elem = this._elems[i]
            for (var j = 0, jj = arguments.length, elemName; j < jj; j++) {
                elemName = arguments[j]
                if (elem._nodeName === elemName ||
                    elem._implementedNode !== undefined && elem._implementedNode._nodeName === elemName
                ) {
                    elems.push(elem)
                }
            }
        }

        return elems
    },

    /**
     * Finds bemNodes by names:
     * @nodeName string Multiple argument: path to node or attribute
     * @return   array  bemNodes collection
     */
    get: function () {
        if (arguments.length === 0) {
            return this._children
        }

        var collections = []
        for (var i = 0, ii = arguments.length, collection; i < ii; i++) {
            if (arguments[i] === '/') {
                collection = this._filterChildNodes()
            } else if (arguments[i].indexOf('/') === -1) {
                collection = this._filterChildNodes(arguments[i])
            } else {
                var pathItems = arguments[i].split('/')

                for (var j = 0, jj = pathItems.length; j < jj; j++) {
                    var pathItem = pathItems[j]

                    if (j === 0) {
                        collection = this._filterChildNodes(pathItem)
                    } else {
                        var prevCollection = collection
                        collection = []
                        for (var k = 0, kk = prevCollection.length; k < kk; k++) {
                            collection = collection.concat(
                                this._filterChildNodes.call(prevCollection[k], pathItem)
                            )
                        }
                    }

                    if (collection.length === 0) {
                        break
                    }
                }
            }

            collections = ii === 1 ? collection : collections.concat(collection)
        }
        return collections
    },

    /**
     * Collects children by node name
     *
     * @name   string Child node name
     * @return array  Filtered children
     */
    _filterChildNodes: function (name) {
        var collection = [], child, childName, implementedChildName
        for (var i = 0, ii = this._children.length; i < ii; i++) {
            child = this._children[i]
            childName = child._nodeName
            implementedChildName = child._implementedNode !== undefined ? child._implementedNode._nodeName : ''

            if (
                child instanceof BemNode && (
                    name === undefined
                    || name === childName
                    || name === implementedChildName
                    || Array.isArray(name) && (
                        name.indexOf(childName) !== -1 || name.indexOf(implementedChildName) !== -1
                    )
                )
            ) {
                collection.push(child)
            }
        }

        return collection
    },

    /**
     * Checks if there are any children
     *
     * @path string Multiple argument: path to node or attribute
     */
    has: function () {
        return this.get.apply(this, arguments).length > 0
    },

    /**
     * Set handler to call afted DOM-node inited
     *
     * @callback function Handler to call
     */
    onDomInit: function (handler) {
        if (!this._domInited) {
            this._domInitHandlers.push(handler)
        } else {
            handler.call(this)
        }

        return this
    },

    /**
     * Clones itself
     */
    clone: function (parentNodeOfClone) {
        var clone = {}
        clone.__proto__ = this.__proto__

        for (var key in this) {
            if (key === '_children') {
                var cloneChildren = []
                for (var i = 0, ii = this._children.length; i < ii; i++) {
                    cloneChildren.push(
                        this._children[i] instanceof BemNode
                            ? this._children[i].clone(clone)
                            : this._children[i]
                    )
                }
                clone._children = cloneChildren
            } else {
                clone[key] = this[key]
            }
        }

        if (parentNodeOfClone !== undefined) {
            clone._parentNode = parentNodeOfClone
        }

        return clone
    },

    /**
     * Expands bemNode. Creates DOM-node and appends to the parent bemNode's DOM.
     * Also renders its children. Inits DOM declarations at the end.
     *
     * @parentDOMNode object Parent for the root node attaching
     */
    render: function (parentDOMNode) {

        // Call expand handler
        if (!this._isExpanded && this._decl !== undefined && this._decl.__commonExpand !== undefined) {
            this._isExpandContext = true
            this._decl.__commonExpand.call(this)
            this._completeExpand()
            this._isExpandContext = false
        }

        // Continue only if parent node is defined and document is defiend too
        if (parentDOMNode === undefined && this._parentNode === undefined || typeof document === 'undefined') {
            return this
        }

        // Create DOM element if there isn't
        if (this._domNode === undefined) {
            this._domNode = document.createElement(this._tag)
            this._domNode.bemNode = this

            this._setDomNodeClasses()
            this._setDomNodeCSS()

            for (var key in this._domAttr) {
                this.domAttr(key, this._domAttr[key], true)
            }
        }

        // Append to DOM tree
        if (parentDOMNode !== undefined) {
            parentDOMNode.appendChild(this._domNode)
        } else {
            this._parentNode._domNode.insertBefore(
                this._domNode,
                this._parentNode._domNode.childNodes[
                    this.index(true)
                ] || null
            )
        }

        var renderedOnce = this._renderedOnce

        // When first time render
        if (!this._renderedOnce) {

            // Render children
            for (var i = 0, ii = this._children.length; i < ii; i++) {
                this._renderChildWithIndex(i)
            }

            // For HTML-body remove previous body tag
            if (this._tag === 'body') {
                document.documentElement.replaceChild(this._domNode, document.body)
            }

            // Add event handlers
            if (this._domNodeEventHandlers !== undefined) {
                for (var eventName in this._domNodeEventHandlers) {
                    for (var i = 0, ii = this._domNodeEventHandlers[eventName].length; i < ii; i++) {
                        this.on(eventName, this._domNodeEventHandlers[eventName][i], true, false, true)
                    }
                }
            }
            if (this._windowEventHandlers !== undefined) {
                for (var eventName in this._windowEventHandlers) {
                    for (var i = 0, ii = this._windowEventHandlers[eventName].length; i < ii; i++) {
                        this.onWin(eventName, this._windowEventHandlers[eventName][i], true, false, true)
                    }
                }
            }

            // Call mod handlers
            for (var modName in this._mod) {
                this._callModHandlers(modName, this._mod[modName])
            }

            // Call DOM init handlers
            this._domInit()

            // Compontent rendered at least once
            this._renderedOnce = true
        }

        this._onAttach(!renderedOnce)

        return this
    },

    /**
     * Creates DOM-node for child with @index and appends to DOM tree
     *
     * @index number Child index
     */
    _renderChildWithIndex: function (index) {
        var child = this._children[index]

        if (child instanceof BemNode) {
            child.render()
        } else {
            this._domNode.insertBefore(
                document.createTextNode(child),
                this._domNode.childNodes[index] || null
            )
        }
    },

    /**
     * Change children array to expanded children array
     * after node expanding
     */
    _completeExpand: function () {
        if (this._isExpandContext && this._expandedChildren) {
            this._children = this._expandedChildren
            this._expandedChildren = undefined
        }
        this._isExpanded = true
    },

    /**
     * Initial instructions for the DOM-element
     */
    _domInit: function () {
        this._isDomInitContext = true

        var decl = this._decl

        if (decl !== undefined) {
            decl.domInit && decl.domInit.call(this)
        }

        if (this._implementedNode && (decl = this._implementedNode._decl)) {
            decl.domInit && decl.domInit.call(this)
        }

        this._isDomInitContext = false
        this._domInited = true

        if (this._domInitHandlers.length !== 0) {
            for (var i = 0, ii = this._domInitHandlers.length; i < ii; i++) {
                this._domInitHandlers[i].call(this)
            }
        }
    },

    /**
     * Instructions for the DOM-element after render in tree
     */
    _onAttach: function (firstTime) {
        if (this._decl !== undefined && this._decl.onAttach !== undefined) {
            this._decl.onAttach.call(this, firstTime)
        }
    },

    /**
     * Call modifier change handlers
     *
     * @modName  string
     * @modValue string
     * @data     object Additional data for handler
     */
    _callModHandlers: function (modName, modValue, data) {
        var handlers

        if (this._modHandlers !== undefined && this._modHandlers[modName] !== undefined) {
            if (this._modHandlers[modName][modValue] !== undefined) {
                handlers = this._modHandlers[modName][modValue]
            } else if (modValue === false && this._modHandlers[modName][''] !== undefined) {
                handlers = this._modHandlers[modName]['']
            } else if (modValue === '' && this._modHandlers[modName][false] !== undefined) {
                handlers = this._modHandlers[modName][false]
            }
            if (this._modHandlers[modName]['*'] !== undefined) {
                if (handlers !== undefined) {
                    handlers = handlers.concat(this._modHandlers[modName]['*'])
                } else {
                    handlers = this._modHandlers[modName]['*']
                }
            }
        }

        if (handlers !== undefined) {
            for (var i = 0, ii = handlers.length; i < ii; i++) {
                handlers[i].call(this, data)
            }
        }
    },

    /**
     * Sets DOM classes
     */
    _setDomNodeClasses: function (returnClassNameOnly, finalMod) {
        if (this._cssClasses === undefined) {
            var className = this._selector
            var value
            var tail

            if (finalMod === undefined && this._decl !== undefined) {
                finalMod = this._decl.__finalMod
            }

            if (this._flattenInheritsForDom !== undefined) {
                for (var i = 0, ii = this._flattenInheritsForDom.length; i < ii; i++) {
                    className += ' ' + this._flattenInheritsForDom[i]
                }
            }

            if (this._mix.length !== 0) {
                for (var i = 0, ii = this._mix.length; i < ii; i++) {
                    className += ' ' + this._mix[i]
                }
            }

            for (var key in this._mod) {
                value = this._mod[key]

                if (value === '' || value === false || value === undefined) {
                    continue
                }

                tail = value === true
                    ? '_' + key
                    : '_' + key + '_' + value

                if (
                    finalMod === undefined ||
                    finalMod[key] === undefined && finalMod._selector[this._selector] === undefined ||
                    finalMod[key] !== undefined && finalMod[key][this._selector] === true
                ) {
                    className += ' ' + this._selector + tail
                }

                if (this._flattenInheritsForDom) {
                    for (var i = 0, ii = this._flattenInheritsForDom.length, selector; i < ii; i++) {
                        selector = this._flattenInheritsForDom[i]
                        if (
                            finalMod === undefined ||
                            finalMod[key] === undefined && finalMod._selector[selector] === undefined ||
                            finalMod[key] !== undefined && finalMod[key][selector] === true
                        ) {
                            className += ' ' + selector + tail
                        }
                    }
                }
            }

            if (this._implementedNode !== undefined) {
                className += ' ' + this._implementedNode._setDomNodeClasses(true, finalMod)
            }

            this._cssClasses = className
        }

        if (returnClassNameOnly) {
            return this._cssClasses
        } else {
            if (this._domNode) {
                this._assignDomClasses.call(this)
            }
        }
    },

    _assignDomClasses: function () {
        this._domNode.className = this._cssClasses
    },

    /**
     * Sets DOM CSS
     */
    _setDomNodeCSS: function (propertyToChange, isAnimationFrame) {
        if (isAnimationFrame) {
            for (var name in this._css) {
                if (propertyToChange !== undefined && propertyToChange !== name) {
                    continue
                }
                if (this._css[name] || this._css[name] === 0 || this._css[name] === '') {
                    this._domNode.style[name] = this._css[name]
                }
            }
        } else {
            this._setDomNodeCSS.call(this, propertyToChange, true)
        }
    },

    /**
     * Converts BemNode with its children to string of Beast.node() functions
     * @return string
     */
    toStringOfFunctions: function () {
        var attr = '{'
        for (var key in this._mod) {
            attr += '"' + (key.substr(0,1).toUpperCase() + key.slice(1)) + '":'

            if (typeof this._mod[key] === 'string') {
                attr += '"' + this._mod[key] + '",'
            } else {
                attr += this._mod[key] + ','
            }
        }
        for (var key in this._param) {
            if (typeof this._param[key] === 'string' || typeof this._param[key] === 'number') {
                attr += '"'+ key +'":"'+ this._param[key] +'",'
            }
        }
        attr += '}'

        var children = ''
        for (var i = 0, ii = this._children.length; i < ii; i++) {
            if (this._children[i] instanceof BemNode) {
                children += this._children[i].toStringOfFunctions()
            } else {
                children += '"'+ escapeDoubleQuotes(this._children[i].toString()) +'"'
            }

            if (i < ii - 1) {
                children += ','
            }
        }

        return 'Beast.node(' +
            '"'+ this._nodeName + '",' +
            (attr === '{}' ? 'undefined' : attr) +
            (children ? ',' + children + ')' : ')')
    },

    /**
     * Converts BemNode to HTML
     * @return string HTML
     */
    toHtml: function () {
        var node = this

        // Call expand handler
        if (!node._isExpanded && node._decl !== undefined && node._decl.__commonExpand !== undefined) {
            node._isExpandContext = true
            node._decl.__commonExpand.call(node)
            node._completeExpand()
            node._isExpandContext = false

            for (var key in this._param) {
                if (this._param[key] instanceof BemNode) {
                    this._param[key] = {
                        string: this._param[key].toStringOfFunctions(),
                        __isStringifiedBemNode: true
                    }
                }
            }
        }

        if (node._implementedWith !== undefined) {
            node = node._implementedWith
        }

        // HTML attrs
        var attrs = ' data-node-name="' + node._nodeName + '"'

        for (var key in node._domAttr)  {
            attrs += ' ' + key + '="' + escapeDoubleQuotes(node._domAttr[key].toString()) + '"'
        }

        // Class attr
        attrs += ' class="' + node._setDomNodeClasses(true) + '"'

        // Style attr
        var style = ''
        for (var key in node._css) {
            if (node._css[key] || node._css[key] === 0) {
                style += camelCaseToDash(key) + ':' + escapeDoubleQuotes(node._css[key]) + ';'
            }
        }

        if (style !== '') {
            attrs += ' style="' + style + '"'
        }

        // Stringify _domNodeEventHandlers
        if (node._domNodeEventHandlers !== undefined) {
            attrs += ' data-event-handlers="' + encodeURIComponent(stringifyObject(node._domNodeEventHandlers)) + '"'
        }

        // Stringify _windowEventHandlers
        if (node._windowEventHandlers !== undefined) {
            attrs += ' data-window-event-handlers="' + encodeURIComponent(stringifyObject(node._windowEventHandlers)) + '"'
        }

        // Stringify _modHandlers
        if (node._modHandlers !== undefined) {
            attrs += ' data-mod-handlers="' + encodeURIComponent(stringifyObject(node._modHandlers)) + '"'
        }

        // Stringify properties
        if (!objectIsEmpty(node._mod)) {
            attrs += ' data-mod="' + encodeURIComponent(stringifyObject(node._mod)) + '"'
        }
        if (!objectIsEmpty(node._param)) {
            attrs += ' data-param="' + encodeURIComponent(stringifyObject(node._param)) + '"'
        }
        if (node._domInitHandlers.length !== 0) {
            attrs += ' data-dom-init-handlers="' + encodeURIComponent(stringifyObject(node._domInitHandlers)) + '"'
        }
        if (node._implementedNode !== undefined) {
            attrs += ' data-implemented-node-name="' + node._implementedNode._nodeName + '"'
        }
        if (node._noElems) {
            attrs += ' data-no-elems="1"'
        }

        // HTML tag
        if (SingleTag[node._tag] === 1) {
            return '<' + node._tag + attrs + '/>'
        } else {
            var content = ''
            for (var i = 0, ii = node._children.length; i < ii; i++) {
                if (node._children[i] instanceof BemNode) {
                    content += node._children[i].toHtml()
                } else {
                    content += escapeHtmlTags(node._children[i].toString())
                }
            }
            return '<' + node._tag + attrs + '>' + content + '</' + node._tag + '>'
        }
    },

    /**
     * Calls expand declaration in runtime
     */
    expand: function () {
        // Replace old children
        this.empty()

        // When call for unexpanded node
        if (this._isExpanded === false) {
            this.append.apply(this, arguments)
            return this
        }

        // Append new children without DOM-node creating (_isReplaceContext flag)
        this._isReplaceContext = true
        this.append.apply(this, arguments)

        // Call expand function
        if (this._decl && this._decl.expand !== undefined) {
            this._isExpandContext = true
            this._decl.expand.call(this)
            this._completeExpand()
            this._isExpandContext = false
        }

        this._isReplaceContext = false

        // Render children
        for (var i = 0, ii = this._children.length; i < ii; i++) {
            this._renderChildWithIndex(i)
        }

        // Call domInit function
        if (this._decl && this._decl.domInit !== undefined) {
            this._decl.domInit.call(this)
        }

        // Call implemented domInit function
        if (this._implementedNode !== undefined &&
            this._implementedNode._decl !== undefined &&
            this._implementedNode._decl.domInit !== undefined) {
            this._implementedNode._decl.domInit.call(this)
        }

        return this
    },
}

})();
Beast.decl({
    Action: {
        mod: {
            Size: 'M',
            Type: 'Red',
        },
        expand: function () {
            this.append(this.text())

            if (this.param('href')) {
                this.append(
                    Beast.node("Link",{__context:this,"href":"this.param(\'href\')"}," 1 ")
                )
            }
            
            // Add click handler to show form or validate form
            this.on('click', function () {
                // Check if this is a "send" button in a form
                if (this.text() === 'send') {
                    validateAndSubmitForm()
                } else if (typeof window.showForm === 'function') {
                    window.showForm()
                }
            })
            
            function validateAndSubmitForm() {
                // Find all inputs and textareas in the form
                const form = document.querySelector('.Form')
                if (!form) return
                
                const inputs = form.querySelectorAll('.Form__input, .Form__textarea')
                let hasEmptyFields = false
                
                // Check each input/textarea for empty values
                inputs.forEach(function(field) {
                    const value = field.value.trim()
                    
                    // Remove any existing shake class
                    field.classList.remove('Form__shake')
                    
                    if (!value) {
                        hasEmptyFields = true
                        // Add shake class for empty fields
                        field.classList.add('Form__shake')
                        
                        // Remove shake class after animation completes
                        setTimeout(function() {
                            field.classList.remove('Form__shake')
                        }, 500)
                    }
                })
                
                // If no empty fields, proceed with form submission
                if (!hasEmptyFields) {
                    submitToFormspree()
                }
            }
            
            function submitToFormspree() {
                const form = document.querySelector('.Form')
                if (!form) return
                
                const inputs = form.querySelectorAll('.Form__input, .Form__textarea')
                const formData = new FormData()
                
                // Add all field values
                inputs.forEach(function(field) {
                    if (field.name && field.value.trim()) {
                        formData.append(field.name, field.value.trim())
                    }
                })
                
                // Submit to Formspree
                fetch('https://formspree.io/f/xldwovnn', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(function(response) {
                    if (response.ok) {
                        showSuccessMessage()
                        // Clear form after delay
                        setTimeout(function() {
                            inputs.forEach(function(field) {
                                field.value = ''
                            })
                        }, 2000)
                    } else {
                        throw new Error('Form submission failed')
                    }
                })
                .catch(function(error) {
                    alert('Sorry, there was an error sending your message. Please try again.')
                    console.error('Error:', error)
                })
            }
            
            function showSuccessMessage() {
                const form = document.querySelector('.Form')
                if (!form) return
                
                // Create success message element
                const successMessage = document.createElement('div')
                successMessage.className = 'Form__success-message'
                successMessage.textContent = 'thank you, we\'ll get back shortly'
                
                // Add success state class and message
                form.classList.add('Form_submitted')
                form.appendChild(successMessage)
                
                // Remove success state and message after 8 seconds
                setTimeout(function() {
                    form.classList.remove('Form_submitted')
                    if (successMessage && successMessage.parentNode) {
                        successMessage.parentNode.removeChild(successMessage)
                    }
                }, 8000)
            }
        },
        domInit: function fn() {
            // Initialize shuffle animation for Action component
            if (typeof Shuffle !== 'undefined' && this.element && this.element.textContent) {
                Shuffle.animateLinkHover(
                    this.element, 
                    this.get('href'),
                    { charSet: 'latin' }
                )
            }
            
            // Handle hover effects programmatically
            const element = this.element
            const type = this.param('Type')
            
            if (element) {
                element.addEventListener('mouseenter', function() {
                    if (type === 'Red') {
                        element.style.background = 'red'
                        element.style.borderColor = 'red'
                        element.style.backdropFilter = 'blur(15px)'
                    } else if (type === 'White') {
                        element.style.background = 'rgba(255, 255, 255, 0.9)'
                        element.style.transform = 'scale(1.01)'
                        element.style.backdropFilter = 'blur(12px)'
                    }
                })
                
                element.addEventListener('mouseleave', function() {
                    if (type === 'Red') {
                        element.style.background = 'rgba(255, 255, 255, 0.01)'
                        element.style.borderColor = 'red'
                        element.style.backdropFilter = 'blur(10px)'
                    } else if (type === 'White') {
                        element.style.background = 'white'
                        element.style.transform = 'scale(1)'
                        element.style.backdropFilter = 'none'
                    }
                })
            }
        }       
    }
})



Beast.decl({
    App: {
        
        tag:'body',
        
        expand: function fn () {
            if (MissEvent.mobile) { this.mix('mobile') }
            this.append( Beast.node("Noise",{__context:this,"":true}), Beast.node("Form",{__context:this,"":true}), this.get() )
        },
        domInit: function fn() {
            // Add ASCII art for ARK studio
            console.log(`
          ++++++*+++++++=+==+==+=++=++=+=+======-=
        =+++++*+++*+++=+==+==+=++=++=++=+=====-=--
      =++++++++*++++++=+=+=+=+=+=+=+=++=+======-=---
    =+=++++++*+++++++=+=+===+=+=+++=+==+====-=----
  ==+=++++++*++*+++++=+==+=  =++=+=++=+====-=-----
===+=++++++*++*++++=+=+==    +=++++==+====-=------

MADE BY ΛRK / www.ark.studio/byld / 2025
            `);
            // Action elements shuffling animation using Shuffle helper
            if (typeof Shuffle !== 'undefined') {
                const actionElements = document.querySelectorAll('.Action, .Footer__action, .Button_Type_Action, .CaseAction')
                
                actionElements.forEach(element => {
                    Shuffle.animateHoverShuffle(element, {
                        charSet: Shuffle.charSets.latin,
                        swapsRemaining: element.textContent.length + 8,
                        interval: 30
                    })
                })
                

            } else {
                console.warn('Shuffle helper not found. Make sure shuffle.js is loaded.')
            }

            // Parallax scrolling for .Data, .Logo, .Case__head, .CaseMeta/.Divider_One, and .Case__image/.About/.Services elements with different speeds
            const caseHeadElements = document.querySelectorAll('.Case__head')
            const caseMetaElements = document.querySelectorAll('.CaseMeta')
            const dividerOneElements = document.querySelectorAll('.header.header_top')
            const caseImageElements = document.querySelectorAll('.Case__image')
            const aboutElements = document.querySelectorAll('.case__descr')
            const servicesElements = document.querySelectorAll('.Services')
            let ticking = false
            
            function updateParallax() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                const windowHeight = window.innerHeight
                
                // Data parallax effects moved to Data.bml domInit using ScrollFade helper
                
                // Logo parallax effects moved to Logo.bml domInit using ScrollFade helper
                
                // Case__head elements - same speed as Data elements with blur
                caseHeadElements.forEach(element => {
                    const parallaxSpeed = 0.7 // Same as Data - slower parallax with more lag effect
                    const yPos = -(scrollTop * (1 - parallaxSpeed))
                    
                    // Calculate blur based on element position relative to viewport
                    const elementRect = element.getBoundingClientRect()
                    const elementTop = elementRect.top
                    const elementBottom = elementRect.bottom
                    
                    let blurAmount = 0
                    
                    // Blur when element approaches or exits the top of viewport
                    if (elementTop < windowHeight * 0.20 && elementBottom > 0) {
                        // Element is in upper 20% of viewport or above
                        const triggerPoint = windowHeight * 0.15
                        const distanceFromTrigger = Math.max(0, triggerPoint - elementTop)
                        const maxDistance = triggerPoint + elementRect.height
                        const exitProgress = distanceFromTrigger / maxDistance
                        blurAmount = Math.min(exitProgress * 8, 8) // Max 8px blur (same as Data)
                    }
                    
                    element.style.transform = `translate3d(0, ${yPos}px, 0)`
                    element.style.filter = `blur(${blurAmount}px)`
                    element.style.willChange = 'transform, filter'
                })
                
                // CaseMeta and Divider_One elements - different speed than Case__head, move together
                const caseMetaGroupElements = [...caseMetaElements, ...dividerOneElements]
                caseMetaGroupElements.forEach(element => {
                    // Skip .header.header_top animation on mobile
                    if (MissEvent.mobile && element.classList.contains('header') && element.classList.contains('header_top')) {
                        return
                    }
                    
                    const parallaxSpeed = 0.8 // Faster than Data/Case__head (0.7) - less lag effect
                    const yPos = -(scrollTop * (1 - parallaxSpeed))
                    
                    // Calculate blur based on element position relative to viewport
                    const elementRect = element.getBoundingClientRect()
                    const elementTop = elementRect.top
                    const elementBottom = elementRect.bottom
                    
                    let blurAmount = 0
                    
                    // Blur when element approaches or exits the top of viewport
                    if (elementTop < windowHeight * 0.20 && elementBottom > 0) {
                        // Element is in upper 20% of viewport or above
                        const triggerPoint = windowHeight * 0.15
                        const distanceFromTrigger = Math.max(0, triggerPoint - elementTop)
                        const maxDistance = triggerPoint + elementRect.height
                        const exitProgress = distanceFromTrigger / maxDistance
                        blurAmount = Math.min(exitProgress * 8, 8) // Max 8px blur (same as other elements)
                    }
                    
                    element.style.transform = `translate3d(0, ${yPos}px, 0)`
                    element.style.filter = `blur(${blurAmount}px)`
                    element.style.willChange = 'transform, filter'
                })
                
                // Case__image, About, and Services elements - blur only (no parallax movement)
                const caseContentElements = [...caseImageElements, ...aboutElements, ...servicesElements]
                caseContentElements.forEach(element => {
                    // Calculate blur based on element position relative to viewport
                    const elementRect = element.getBoundingClientRect()
                    const elementTop = elementRect.top
                    const elementBottom = elementRect.bottom
                    
                    let blurAmount = 0
                    
                    // Blur when element approaches or exits the top of viewport
                    if (elementTop < windowHeight * 0.20 && elementBottom > 0) {
                        // Element is in upper 20% of viewport or above
                        const triggerPoint = windowHeight * 0.15
                        const distanceFromTrigger = Math.max(0, triggerPoint - elementTop)
                        const maxDistance = triggerPoint + elementRect.height
                        const exitProgress = distanceFromTrigger / maxDistance
                        blurAmount = Math.min(exitProgress * 8, 8) // Max 8px blur (same as other elements)
                    }
                    
                    // Only apply blur, no transform/movement
                    element.style.filter = `blur(${blurAmount}px)`
                    element.style.willChange = 'filter'
                })
                
                // Handle Text__item parallax blur
                const textItems = document.querySelectorAll('.Text__item')
                textItems.forEach(element => {
                    const elementRect = element.getBoundingClientRect()
                    const elementTop = elementRect.top
                    const elementBottom = elementRect.bottom
                    
                    let blurAmount = 0
                    
                    // Blur when element approaches or exits the top of viewport
                    if (elementTop < windowHeight * 0.20 && elementBottom > 0) {
                        // Element is in upper 20% of viewport or above
                        const triggerPoint = windowHeight * 0.15
                        const distanceFromTrigger = Math.max(0, triggerPoint - elementTop)
                        const maxDistance = triggerPoint + elementRect.height
                        const exitProgress = distanceFromTrigger / maxDistance
                        blurAmount = Math.min(exitProgress * 12, 12) // Max 12px blur (medium intensity)
                    }
                    
                    element.style.filter = `blur(${blurAmount}px)`
                    element.style.willChange = 'filter'
                })
                
                ticking = false
            }
            
            function requestParallaxUpdate() {
                if (!ticking) {
                    requestAnimationFrame(updateParallax)
                    ticking = true
                }
            }
            
            // Listen for scroll events
            window.addEventListener('scroll', requestParallaxUpdate, { passive: true })
            
            // Initial positioning
            updateParallax()

            // Text__item fade-in with character animation on page load
            const textItems = document.querySelectorAll('.Text__item')
            
            
            textItems.forEach((element, index) => {
                
                
                // Start animation after a delay based on index
                setTimeout(() => {
                    // Simple fade in and unblur
                    element.classList.add('Text__item_loaded')
                    
                    
                }, index * 1000) // 1 second delay between each item
            })









            // Services__item scroll-triggered fade/unblur animation moved to Services.bml domInit using helpers
            
            // Card scroll-triggered fade/unblur animation
            const cardItems = document.querySelectorAll('.Card')
            
            
            if (cardItems.length > 0) {
                const cardObserverOptions = {
                    root: null,
                    rootMargin: '0px 0px 0px 0px', // No margin - trigger exactly when entering/leaving
                    threshold: 0.1 // Very small threshold - almost completely out of view
                }
                
                let lastScrollY = window.scrollY
                
                const cardObserver = new IntersectionObserver((entries) => {
                    const currentScrollY = window.scrollY
                    const scrollingUp = currentScrollY < lastScrollY
                    lastScrollY = currentScrollY
                    
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Card is visible - animate if not already loaded
                            if (!entry.target.classList.contains('Card_loaded')) {
                                // Reset all cards first
                                cardItems.forEach(card => {
                                    card.classList.remove('Card_loaded')
                                })
                                
                                // Animate all cards in sequence
                                cardItems.forEach((card, index) => {
                                    setTimeout(() => {
                                        card.classList.add('Card_loaded')
                                        
                                    }, index * 150) // 150ms delay between each card
                                })
                            }
                        } else {
                            // Card is NOT visible
                            // Only reset when scrolling UP and card is out of viewport
                            if (scrollingUp) {
                                entry.target.classList.remove('Card_loaded')
                                
                            }
                            // Don't reset when scrolling down (card may be above viewport)
                        }
                    })
                }, cardObserverOptions)
                
                // Observe all card items
                cardItems.forEach(card => {
                    cardObserver.observe(card)
                })
            }
            

            // Scroll-triggered fade/unblur animation for Case__image, case__descr, case__solution, Review, and case__impact-bottom
            const scrollAnimationElements = [
                { selector: '.Case__image', className: 'Case__image_loaded' },
                { selector: '.Case__descr', className: 'Case__descr_loaded' },
                { selector: '.Case__solution', className: 'Case__solution_loaded' },
                { selector: '.Case__review', className: 'Case__review_loaded' },
                { selector: '.Case__impact-bottom', className: 'Case__impact-bottom_loaded' }
            ]
            
            scrollAnimationElements.forEach(({ selector, className }) => {
                const elements = document.querySelectorAll(selector)
                
                
                if (elements.length > 0) {
                    const observerOptions = {
                        root: null,
                        rootMargin: '0px 0px -20% 0px', // Trigger when 20% into viewport
                        threshold: 0.1
                    }
                    
                    const elementObserver = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                // Element is visible - animate
                                entry.target.classList.add(className)
                                
                            } else {
                                // Element is not visible - reset animation
                                entry.target.classList.remove(className)
                                
                            }
                        })
                    }, observerOptions)
                    
                    // Observe all elements of this type
                    elements.forEach(element => {
                        elementObserver.observe(element)
                    })
                }
            })

            // Scroll-triggered character shuffling animation for caseresult__item elements
            const scrollCaseresultItems = document.querySelectorAll('.caseresult__item')
            
            if (scrollCaseresultItems.length > 0) {
                const caseresultObserverOptions = {
                    root: null,
                    rootMargin: '0px 0px -20% 0px', // Trigger when 20% into viewport
                    threshold: 0.3
                }
                
                const caseresultObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // caseresult__item is visible - trigger character animation
                            const item = entry.target
                            
                            // Find title and text elements within this item
                            const titleElement = item.querySelector('.caseresult__title')
                            const textElement = item.querySelector('.caseresult__text')
                            
                            // Animate title first, then text
                            if (titleElement) {
                                setTimeout(() => {
                                    animateCaseresultText(titleElement)
                                }, 100)
                            }
                            
                            if (textElement) {
                                setTimeout(() => {
                                    animateCaseresultText(textElement)
                                }, 300) // Start text animation 200ms after title
                            }
                            
                        }
                    })
                }, caseresultObserverOptions)
                
                // Function to animate caseresult text with character shuffling
                function animateCaseresultText(element) {
                    const text = element.textContent.trim()
                    if (text.length === 0) return
                    
                    // Split text into individual character spans
                    element.innerHTML = text.split('').map(char => '<span>' + char + '</span>').join('')
                    
                    const spans = element.querySelectorAll('span')
                    const originalText = text.split('')
                    
                    spans.forEach((span, index) => {
                        const delay = index * 30 // 30ms delay between letters
                        setTimeout(() => {
                            let rollCount = 0
                            const maxRolls = 15 // More character swaps for longer rolling effect
                            
                            const rollInterval = setInterval(() => {
                                if (rollCount < maxRolls) {
                                    // Random character from ASCII 33-126 (visible characters)
                                    const randomChar = String.fromCharCode(33 + Math.floor(Math.random() * 94))
                                    span.textContent = randomChar
                                    rollCount++
                                } else {
                                    // Animation complete - restore original character
                                    span.textContent = originalText[index]
                                    clearInterval(rollInterval)
                                }
                            }, 50) // 50ms between character swaps
                        }, delay)
                    })
                }
                
                // Observe all caseresult items
                scrollCaseresultItems.forEach(item => {
                    caseresultObserver.observe(item)
                })
            }

            // Reviews dimming when footer comes into view
            const reviewsElement = document.querySelector('.Reviews')
            const footerElement = document.querySelector('.Footer')
            
            
            if (reviewsElement && footerElement) {
                const footerObserverOptions = {
                    root: null,
                    rootMargin: '0px 0px 0px 0px', // Trigger when footer starts entering viewport
                    threshold: 0.4 // Trigger when 40% of footer is visible
                }
                
                const footerObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Footer is entering viewport - dim reviews
                            reviewsElement.classList.add('Reviews_dimmed')
                            
                        } else {
                            // Footer is leaving viewport - restore reviews
                            reviewsElement.classList.remove('Reviews_dimmed')
                            
                        }
                    })
                }, footerObserverOptions)
                
                // Observe the footer
                footerObserver.observe(footerElement)
            }
            
            // Fallback: ensure all text items are visible after 5 seconds
            setTimeout(() => {
                textItems.forEach(element => {
                    if (!element.classList.contains('Text__item_loaded')) {
                        
                        element.classList.add('Text__item_loaded')
                    }
                })
            }, 5000)

            // Footer text animations moved to Footer.bml domInit using helper function

            // Process animations moved to Process.bml domInit using helper function

        }
    },  
})
Beast.decl({
    Ark: {
        expand: function () {
            this.append(
                Beast.node("Link",{__context:this,"href":"http://ark.studio/byld"}," \n                    ",Beast.node("glyph"),"\n                ")

            )
        },
        domInit: function fn() {
            
        }       
    }
})
Beast.decl({
    Box: {
        expand: function () {
            this.append(
                Beast.node("corner",{__context:this,"TL":true}),
                Beast.node("corner",{__context:this,"TR":true}),
                Beast.node("corner",{__context:this,"BR":true}),
                Beast.node("corner",{__context:this,"BL":true}),
                this.get('title'),
                Beast.node("wrap",{__context:this},"\n                    ",this.get('text'),"\n                    ",Beast.node("meta"),"\n                    ",this.get('hint'),"\n                    ",Beast.node("footer"),"\n                ")

            )
        },
        domInit: function fn() {
            
        }       
    }
})
Beast.decl({
    Button: {
        expand: function () {

            if (this.mod('Size')) {

                this.append(
                    Beast.node("text",{__context:this},this.text())
                )
                    
                if (this.param('icon')) {
                    this.append(Beast.node("Icon",{__context:this,"Name":this.param('icon')}))
                        .mod('Medium', true)
                }

            } else {

                if (this.param('icon')) {
                    this.append(Beast.node("Icon",{__context:this,"Name":this.param('icon')}))
                        .mod('Medium', true)
                }

                this.append(
                    Beast.node("text",{__context:this},this.text())
                )

                if (this.param('hint')) {
                    this.append(
                        Beast.node("hint",{__context:this},this.get('hint'))
                    )
                }
            }   
        }       
    }   
})
Beast.decl({
    Case: {
        expand: function () {
            this.append(
                Beast.node("head",{__context:this},"\n                    ",Beast.node("client-card",undefined,"\n                        ",Beast.node("tail",{"":true}),"\n                        ",Beast.node("wrap",undefined,"\n                            ",Beast.node("hint",undefined,"Client"),"\n                            ",this.get('client'),"\n                        "),"\n                    "),"\n                    ",this.get('title'),"\n                "),


                this.get('impact', 'image', 'descr'),

                Beast.node("descr",{__context:this},"\n                    \n                    ",Beast.node("descr-about",undefined,"\n                        ",Beast.node("Header",undefined,"\n                            ",Beast.node("title",undefined,"About",Beast.node("br")," the project"),"\n                            ",Beast.node("glyph",undefined,"プロジェクト"),"\n                        "),"\n                        ",this.get('description'),"\n                    "),"\n\n                    ",Beast.node("descr-plus",undefined,"\n                        ",Beast.node("descr-icon"),"\n                    "),"\n\n                    ",Beast.node("descr-challenge",undefined,"\n                        ",Beast.node("Header",undefined,"\n                            ",Beast.node("title",undefined,"The",Beast.node("br")," challenge"),"\n                            ",Beast.node("glyph",undefined,"挑戦"),"\n                        "),"\n                        ",Beast.node("Box",{"Type":"Challenge"},"\n                            ",Beast.node("title",undefined,"ID.5.001"),"\n                            ",Beast.node("text",{"Size":"L"},"\n                                ",this.get('challenge'),"\n                            "),"    \n                        "),"\n                        \n                    "),"\n                    \n                "),

                this.get('solution'),

                Beast.node("impact-bottom",{__context:this},"\n                    ",Beast.node("Header",undefined,"\n                        ",Beast.node("title",undefined,"Impact of",Beast.node("br")," our work"),"\n                        ",Beast.node("glyph",undefined,"プロジェクトについて"),"\n                    "),"\n                    ",Beast.node("impact-items",undefined,"\n                        ",this.get('impact-meta-item'),"\n                    "),"\n                "),

                this.get('review', 'link'),

                
            )
        },
        domInit: function fn() {
            // Mobile layout adjustment: move Header before CaseResult on mobile
            if (MissEvent.mobile) {
                // Find the case__impact container
                const caseImpact = document.querySelector('.case__impact')
                if (caseImpact) {
                    // Find the Header and CaseResult elements within case__impact
                    const header = caseImpact.querySelector('.Header')
                    const caseResult = caseImpact.querySelector('.CaseResult')
                    
                    if (header && caseResult) {
                        // Move the Header to appear before CaseResult
                        caseResult.parentNode.insertBefore(header, caseResult)
            
                    }
                }
                
                // Add header__line div before Case__impact on mobile
                const caseImpactElement = document.querySelector('.case__impact')
                if (caseImpactElement) {
                    // Create header__line div
                    const headerLine = document.createElement('div')
                    headerLine.className = 'header__line'
                    
                    // Insert header__line before case__impact
                    caseImpactElement.parentNode.insertBefore(headerLine, caseImpactElement)
        
                }
            }
            
            // Initialize all Case scroll effects and animations using the generic ScrollFade helper
            if (typeof ScrollFade !== 'undefined') {
                const caseEffects = ScrollFade.initScrollEffects({
                    animations: [
                        {
                            selector: '.Case__client-card',
                            className: 'Case__client-card_loaded',
                            delay: 300
                        },
                        {
                            selector: '.Case__title',
                            className: 'Case__title_loaded',
                            delay: 300,
                            offset: 200
                        },
                        {
                            selector: '.CaseMeta__item',
                            className: 'CaseMeta__item_loaded',
                            delay: 200,
                            offset: 200
                        },
                        {
                            selector: '.Caseresult__item',
                            className: 'Caseresult__item_loaded',
                            delay: 100,
                            offset: 200
                        }
                    ],
                    textShuffle: [
                        {
                            selector: '.caseresult__title, .caseresult__text',
                            afterSelector: '.Caseresult__item',
                            options: {
                                letterDelay: 30,
                                maxRolls: 15,
                                rollInterval: 50
                            },
                            offset: 100
                        }
                    ],
                    parallax: {
                        groups: [
                            {
                                selector: '.Case__head',
                                speed: 0.7,
                                blur: true,
                                movement: true,
                                blurTrigger: 0.40,
                                blurStart: 0.35,
                                mobileBlurTrigger: 1.3,
                                mobileBlurStart: 1.3,
                                maxBlur: 8
                            },
                            {
                                selector: '.CaseMeta',
                                speed: 0.8,
                                blur: true,
                                movement: true,
                                blurTrigger: 0.40,
                                blurStart: 0.35,
                                mobileBlurTrigger: 0.95,
                                mobileBlurStart: 0.90,
                                maxBlur: 8
                            },
                            {
                                selector: '.Case__image, .case__descr',
                                blur: true,
                                movement: false,
                                blurTrigger: 0.40,
                                blurStart: 0.35,
                                mobileBlurTrigger: 0.95,
                                mobileBlurStart: 0.90,
                                maxBlur: 8
                            }
                        ]
                    },
                    observers: [
                        {
                            selector: '.Case__head, .CaseMeta, .case__descr, .Case__image',
                            rootMargin: '-20% 0px -20% 0px',
                            threshold: 0.3,
                            onIntersect: function(element, entry) {
    
                                // Add a class to make the element visible
                                element.classList.add('visible')
                            }
                        }
                    ]
                })
                
                // Store reference for cleanup if needed
                this.caseEffects = caseEffects
                
    
            } else {
                console.warn('ScrollFade helper not found. Make sure scrollfade.js is loaded.')
            }
        }       
    },

    Case__link: {
        expand: function () {
            var text = this.text()
            var href = 'http://' + text
            this.append(
                Beast.node("action",{__context:this},"\n                    ",Beast.node("Link",{"New":true,"href":href},"\n                        ",Beast.node("Action",{"Size":"L","Wide":true,"Type":"Red"},text),"\n                    "),"\n                ")
            )
        },
    },

    Case__impact: {
        expand: function () {
            this.append(
                Beast.node("Header",{__context:this,"Top":true},"\n                    ",Beast.node("title",undefined,"Impact of",Beast.node("br")," our work"),"\n                    ",Beast.node("glyph",undefined,"プロジェクトについて"),"\n                "),

                Beast.node("CaseMeta",{__context:this},"\n                    ",this.get('item'),"\n                ")
            )
        },
    },

    Case__solution: {
        expand: function () {
            this.append(
                Beast.node("Header",{__context:this},"\n                    ",Beast.node("title",undefined,"The",Beast.node("br")," solution"),"\n                    ",Beast.node("glyph",undefined,"解決策"),"\n                "),
                Beast.node("Solution",{__context:this},"\n                    ",this.get('item','descr'),"\n                ")
            )
        },
    },

    Case__review: {
        expand: function () {
            this.append(
                Beast.node("Header",{__context:this},"\n                    ",Beast.node("title",undefined,"Client",Beast.node("br")," feedback"),"\n                    ",Beast.node("glyph",undefined,"人々が言うこと"),"\n                "),
                Beast.node("Review",{__context:this,"Size":"L"},"\n                    ",this.get('text'),"\n                    ",Beast.node("person",undefined,"\n                        ",this.get('photo', 'name'),"\n                    "),"\n                ") 
                
            )
        },
            
    },

    Case__image: {
        
        expand: function () {
            this.css({
                backgroundImage: 'url('+ this.param('src') +')'
            })
        },
            
    },

    

    

    'Case__impact-meta-item': {
        
        expand: function () {
            this.append(
                Beast.node("CaseResult",{__context:this},"\n                    ",Beast.node("item",undefined,"\n                        ",Beast.node("title",undefined,this.get('impact-meta-title')),"\n                        ",Beast.node("text",undefined,this.get('impact-meta-text')),"\n                    "),"\n                ")
            )
        }
            
    },
})
Beast.decl({
    Cassette: {
        domInit: function fn() {
            // Cassette pieces scroll detection for fixed positioning
            const cassettePieces = []
            
            // Configuration for viewport-relative positioning
            const config = {
                // Offset as percentage of viewport height (instead of fixed pixels)
                triggerOffset: 0.15,  // 15% of viewport height
                // Minimum scroll delta to prevent micro-movements
                minScrollDelta: 0.02, // 2% of viewport height (increased for smoother movement)

                // Mobile breakpoint
                mobileBreakpoint: 768,

                // Debounce resize events
                resizeDebounce: 250,

                // Mobile and Desktop configurations
                mobile: {
                    triggerOffset: 360, // Reduced from 360 to make pieces fix earlier
                    minScrollDelta: 0 // 2% of viewport height
                },
                desktop: {
                    triggerOffset: 0.14, // Increased to 25% to fix pieces earlier on desktop
                    minScrollDelta: 0.02 // 2% of viewport height
                }
            }
            
            // Get all cassette pieces
            for (let i = 1; i <= 5; i++) {
                const piece = document.querySelector(`.Cassette_piece_${i}`)
                if (piece) {
                    cassettePieces.push({
                        element: piece,
                        index: i,
                        isFixed: false,
                        triggerPoint: 0, // Will be calculated dynamically
                        lastPosition: 0 // Track last position to prevent jiggle
                    })
                }
            }
            
            if (cassettePieces.length > 0) {
                
                // MOBILE ONLY: DOM reorganization for better mobile layout
                function setupMobileLayout() {
                    if (!MissEvent.mobile) return // Desktop: do nothing
                    
                    const processElement = document.querySelector('.Process')
                    if (!processElement) return
                    
                    // Create mobile container inside .Process (mobile only)
                    let mobileContainer = document.querySelector('.mobile-cassette-container')
                    if (!mobileContainer) {
                        mobileContainer = document.createElement('div')
                        mobileContainer.className = 'mobile-cassette-container'
                        processElement.appendChild(mobileContainer)
                    }
                    
                    // Move cassette pieces to mobile container (mobile only)
                    cassettePieces.forEach(piece => {
                        mobileContainer.appendChild(piece.element)
                    })
                    
                    console.log('Mobile cassette layout setup complete')
                }
                
                // Initialize mobile layout
                setupMobileLayout()
                
                // Function to calculate trigger points dynamically with mobile/desktop support
                function calculateTriggerPoints() {
                    const windowHeight = window.innerHeight
                    
                    cassettePieces.forEach(piece => {
                        const rect = piece.element.getBoundingClientRect()
                        
                        if (MissEvent.mobile) {
                            // MOBILE ONLY: Enhanced cascading animation with process-based timing
                            const processSection = document.querySelector('#process')
                            const processRect = processSection ? processSection.getBoundingClientRect() : rect
                            const processTop = processRect.top + window.scrollY
                            
                            // Mobile: Align each piece with its corresponding process step
                            const correspondingStep = document.querySelector(`.Process__step_0${piece.index}`)
                            if (correspondingStep) {
                                const stepRect = correspondingStep.getBoundingClientRect()
                                const stepTop = stepRect.top + window.scrollY
                                
                                // All pieces appear before their corresponding step
                                // Piece 1 appears earliest, others appear progressively closer to their steps
                                const offsetMultiplier = piece.index === 1 ? 1.2 : 0.9
                                piece.triggerPoint = stepTop - (windowHeight * offsetMultiplier)
                            } else {
                                // Fallback: Use spread timing if step not found
                                const baseTrigger = processTop + (windowHeight * 0.1)
                                const cascadeInterval = windowHeight * 0.4 // Even longer fallback
                                piece.triggerPoint = baseTrigger + (piece.index - 1) * cascadeInterval
                            }
                        } else {
                            // Desktop: Use viewport-relative offset
                            const offsetVh = windowHeight * config.desktop.triggerOffset
                            piece.triggerPoint = rect.top + window.scrollY - offsetVh
                        }
                        
                        // Only update if the change is significant (prevents micro-adjustments)
                        if (Math.abs(piece.triggerPoint - piece.lastPosition) > 10) {
                            piece.lastPosition = piece.triggerPoint
                        }
                    })
                }
                
                // Calculate initial trigger points
                calculateTriggerPoints()
                
                // Optimized scroll handler with viewport-relative positioning
                let lastScrollY = 0
                let ticking = false
                let lastWindowHeight = window.innerHeight
                
                function checkCassettePositions() {
                    const scrollY = window.scrollY
                    const windowHeight = window.innerHeight
                    const scrollDelta = Math.abs(scrollY - lastScrollY)
                    const minDelta = windowHeight * config.minScrollDelta
                    
                    // Only process if scroll amount is significant (prevents micro-movements)
                    if (scrollDelta < minDelta) return
                    
                    // Check if viewport height changed significantly (only recalculate when needed)
                    if (Math.abs(windowHeight - lastWindowHeight) > 50) {
                        calculateTriggerPoints()
                        lastWindowHeight = windowHeight
                    }
                    
                    lastScrollY = scrollY
                    
                    // Get piece 5 trigger point for unfixing pieces 1-4
                    const piece5 = cassettePieces[4] // piece 5 is at index 4
                    const reachedPiece5 = piece5 && scrollY >= piece5.triggerPoint
                    
                    // Debug: Log scroll state on mobile
                    if (MissEvent.mobile) {
                        console.log(`=== SCROLL CHECK: scrollY=${scrollY} ===`)
                    }
                    
                    // Process each piece for cascading effect
                    cassettePieces.forEach(piece => {
                        const shouldBeFixed = scrollY >= piece.triggerPoint
                        
                        // MOBILE: Include all pieces (including piece 5) in cascade
                        // DESKTOP: Exclude piece 5 (preserve original behavior)
                        const includePiece5 = MissEvent.mobile
                        const shouldIncludePiece = includePiece5 || piece.index !== 5
                        
                        // Debug: Log state for ALL pieces on mobile
                        if (MissEvent.mobile) {
                            console.log(`Piece ${piece.index}: triggerPoint=${piece.triggerPoint}, shouldBeFixed=${shouldBeFixed}, isFixed=${piece.isFixed}, shouldIncludePiece=${shouldIncludePiece}`)
                        }
                        
                        // Add fixed class when scrolling past trigger point
                        if (shouldBeFixed && !piece.isFixed && shouldIncludePiece) {
                            piece.element.classList.add('Cassette_fixed')
                            piece.isFixed = true
                            
                            // MOBILE ONLY: Add animation effect
                            if (MissEvent.mobile) {
                                piece.element.classList.add('Cassette_animating')
                                setTimeout(() => {
                                    piece.element.classList.remove('Cassette_animating')
                                }, 300)
                            }
                        }
                        
                        // Remove fixed class if scrolling back up
                        // MOBILE: Allow full reverse animation - just use normal trigger points
                        // DESKTOP: Original behavior with piece 5 unfixing
                        const shouldBeUnfixed = MissEvent.mobile 
                            ? !shouldBeFixed 
                            : (!shouldBeFixed || (reachedPiece5 && piece.index !== 5))
                        
                        // Debug logging for all pieces on mobile
                        if (MissEvent.mobile && piece.isFixed) {
                            console.log(`Piece ${piece.index}: scrollY=${scrollY}, triggerPoint=${piece.triggerPoint}, shouldBeFixed=${shouldBeFixed}, shouldBeUnfixed=${shouldBeUnfixed}, isFixed=${piece.isFixed}`)
                        }
                        
                        if (shouldBeUnfixed && piece.isFixed) {
                            console.log(`Piece ${piece.index}: Starting reverse animation (mobile: ${MissEvent.mobile})`)
                            piece.element.classList.remove('Cassette_fixed')
                            piece.isFixed = false
                            console.log(`Piece ${piece.index}: Removed Cassette_fixed class`)
                            
                            // MOBILE ONLY: Add animation effect after unfixing
                            if (MissEvent.mobile) {
                                piece.element.classList.add('Cassette_animating')
                                console.log(`Piece ${piece.index}: Added Cassette_animating class`)
                                setTimeout(() => {
                                    piece.element.classList.remove('Cassette_animating')
                                    console.log(`Piece ${piece.index}: Removed Cassette_animating class - animation complete`)
                                }, 300)
                            }
                        }
                    })
                }
                
                function throttledCheckCassettePositions() {
                    if (!ticking) {
                        requestAnimationFrame(() => {
                            checkCassettePositions()
                            ticking = false
                        })
                        ticking = true
                    }
                }
                
                // Add scroll event listener for immediate response
                window.addEventListener('scroll', checkCassettePositions, { passive: true })
                
                // Debounced resize listener to prevent excessive recalculations
                let resizeTimeout
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimeout)
                    resizeTimeout = setTimeout(() => {
                        // Recalculate trigger points after resize
                        calculateTriggerPoints()
                        lastWindowHeight = window.innerHeight
                        // Force a check after resize
                        checkCassettePositions()
                    }, config.resizeDebounce)
                })
                
                // Cleanup function to reset all pieces
                function resetAllCassettePieces() {
                    cassettePieces.forEach(piece => {
                        piece.element.classList.remove('Cassette_fixed')
                        piece.isFixed = false
                        piece.element.style.transform = ''
                    })
                }
                
                // Expose reset function globally for debugging
                window.resetCassettePieces = resetAllCassettePieces
                
                // Initial check
                checkCassettePositions()
    
            } else {
                // No cassette pieces found
            }
        }       
    }
})
Beast.decl({
    Case__meta: {
        expand: function () {
            this.append(
                
            )
        },
        domInit: function fn() {
            
        }       
    },

    
    
})
Beast.decl({
    Card: {
        expand: function () {

            
        },
        domInit: function fn() {
            // Card text hover animation - same rolling effect as Menu
            // Debug: log what elements we find
            const cardElements = document.querySelectorAll('.Card')
            
            
            const cardTextElements = []
            cardElements.forEach(card => {
                // Try multiple selectors to find text elements
                const titles = card.querySelectorAll('title, .Card__title')
                const texts = card.querySelectorAll('text, .Card__text')
                cardTextElements.push(...titles, ...texts)
            })
            
            
            
            // Fallback: if no elements found, try broader search
            if (cardTextElements.length === 0) {
                const allElements = document.querySelectorAll('title, text, .Card__title, .Card__text')
                cardTextElements.push(...allElements)
                
            }
            
            cardTextElements.forEach(element => {
                
                element.animationInterval = null
                
                // Store original font properties to prevent jumping
                const originalFontFamily = window.getComputedStyle(element).fontFamily
                const originalFontSize = window.getComputedStyle(element).fontSize
                const originalFontWeight = window.getComputedStyle(element).fontWeight
                
                element.addEventListener('mouseenter', () => {
                    if (element.isAnimating) return
                    
                    const originalText = element.textContent
                    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                    let swapsRemaining = originalText.length  // Animate all characters
                    let currentDisplayText = ''
                    
                    element.isAnimating = true
                    element.classList.add('rolling-animation')
                    
                    // Preserve original font properties during animation
                    element.style.fontFamily = originalFontFamily
                    element.style.fontSize = originalFontSize
                    element.style.fontWeight = originalFontWeight
                    
                    element.animationInterval = setInterval(() => {
                        currentDisplayText = ''
                        
                        for (let i = 0; i < originalText.length; i++) {
                            if (i < swapsRemaining) {
                                const randomChar = randomChars.charAt(Math.floor(Math.random() * randomChars.length))
                                currentDisplayText += randomChar
                            } else {
                                currentDisplayText += originalText[i]
                            }
                        }
                        
                        element.textContent = currentDisplayText
                        swapsRemaining--
                        
                        if (swapsRemaining <= 0) {
                            clearInterval(element.animationInterval)
                            element.textContent = originalText
                            element.classList.remove('rolling-animation')
                            element.isAnimating = false
                            
                            // Restore original styles
                            element.style.fontFamily = ''
                            element.style.fontSize = ''
                            element.style.fontWeight = ''
                        }
                    }, 40)  // Slower interval for longer effect
                })
            })

        }      
    }   
})
Beast.decl({
    Data: {
        
        domInit: function fn() {
            // Initialize Data parallax effects using the ScrollFade helper
            if (typeof ScrollFade !== 'undefined') {
                const dataEffects = ScrollFade.initScrollEffects({
                    parallax: {
                        groups: [
                            {
                                selector: '.Data',
                                speed: 0.7,
                                blur: true,
                                movement: true,
                                blurTrigger: 0.20,
                                blurStart: 0.15,
                                mobileBlurTrigger: 1.95,
                                mobileBlurStart: 1.90,
                                maxBlur: 8
                            }
                        ]
                    }
                })
                
                // Store reference for cleanup if needed
                this.dataEffects = dataEffects
                
    
            } else {
                console.warn('ScrollFade helper not found. Make sure scrollfade.js is loaded.')
            }
            
            // Data__jp and Data__ch letter-by-letter rolling animation helper
            function setupDataTextAnimation() {
                const dataJpElements = document.querySelectorAll('.Data__jp:not(.Data__jp_Hide)')
                const dataChElements = document.querySelectorAll('.Data__ch')
                const allTextElements = [...dataJpElements, ...dataChElements]
                
                allTextElements.forEach(element => {
                    const originalText = element.textContent
                    const isJapanese = element.classList.contains('Data__jp')
                    const randomChars = isJapanese ? 
                        'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' :
                        '信頼安全技術開発软件程序代码数据系统网络服务器客户端界面设计测试部署维护更新版本管理'
                    
                    // Split text into individual letters
                    element.innerHTML = ''
                    const letterSpans = []
                    
                    for (let i = 0; i < originalText.length; i++) {
                        const span = document.createElement('span')
                        span.textContent = originalText[i]
                        span.style.display = 'inline-block'
                        
                        span.style.width = 'auto'
                        element.appendChild(span)
                        letterSpans.push(span)
                        
                        // Measure the width of the original character and lock it
                        setTimeout(() => {
                            const charWidth = span.offsetWidth
                            span.style.width = charWidth + 'px'
                            span.style.textAlign = 'center'
                        }, 10)
                    }
                    
                    // Function to animate all letters
                    function animateLetters() {
                        letterSpans.forEach((span, index) => {
                            const targetLetter = originalText[index]
                            let rollCount = 0
                            const maxRolls = 6 + Math.floor(Math.random() * 4) // 6-9 rolls per letter
                            
                            setTimeout(() => {
                                span.classList.add('rolling-animation')
                                
                                const letterInterval = setInterval(() => {
                                    if (rollCount < maxRolls) {
                                        // Show random character
                                        const randomChar = randomChars.charAt(Math.floor(Math.random() * randomChars.length))
                                        span.textContent = randomChar
                                        rollCount++
                                    } else {
                                        // Show final character
                                        span.textContent = targetLetter
                                        span.classList.remove('rolling-animation')
                                        clearInterval(letterInterval)
                                    }
                                }, 80) // 80ms per roll
                                
                            }, index * 100) // 100ms delay between each letter
                        })
                    }
                    
                    // Function to schedule next animation
                    function scheduleNextAnimation() {
                        const randomDelay = 2000 + Math.random() * 2000 // 2-4 seconds
                        setTimeout(() => {
                            animateLetters()
                            scheduleNextAnimation() // Schedule the next one
                        }, randomDelay)
                    }
                    
                    // Start initial animation
                    animateLetters()
                    
                    // Schedule repeating animations after initial completes
                    // Wait for initial animation to finish (longest possible: 4 letters * 100ms + 9 rolls * 80ms = 1120ms)
                    setTimeout(() => {
                        scheduleNextAnimation()
                    }, 1500) // 1.5 seconds buffer
                })
            }
            
            // Initialize Data text animations
            setupDataTextAnimation()
            

        }       
    }
})
Beast.decl({
    Form: {
        expand: function fn() {
            this.append(
                Beast.node("close",{__context:this,"":true}),
                Beast.node("logo",{__context:this,"":true}),
                Beast.node("content",{__context:this},"\n                    ",Beast.node("title",undefined,"tell us about your project"),"\n                    ",Beast.node("item",undefined,"\n                        ",Beast.node("input",{"title":"name"},"company name / individual"),"\n                    "),"\n                    ",Beast.node("item",undefined,"\n                        ",Beast.node("textarea",{"title":"brief","placeholder":"brief project description"}),"\n                    "),"\n                    ",Beast.node("item",undefined,"\n                        ",Beast.node("input",{"title":"contacts"},"contacts (phone, e-mail, links, etc.)"),"\n                    "),"\n                    ",Beast.node("item",undefined,"\n                        ",Beast.node("Action",undefined,"send"),"\n                    "),"\n                    ",Beast.node("footer",undefined,"\n                        ",Beast.node("left",{"":true}),"\n                        ",Beast.node("right",{"":true}),"\n                    "),"\n                ")

            )
        },
        domInit: function fn() {
            // Initially hide the form using Beast.js css method
            this.css({
                visibility: 'hidden',
                transform: 'translateX(100%)'
            })
            
            // Add close functionality
            const closeBtn = this.domNode().querySelector('.Form__close')
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Close button clicked')
                    this.hideForm()
                })
            } else {
                console.warn('Close button not found')
            }
            
            // Close on escape key
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    this.hideForm()
                }
            }
            document.addEventListener('keydown', escapeHandler)
            
            // Close when clicking outside the form
            const outsideClickHandler = (e) => {
                const formElement = this.domNode()
                // Only close if click is outside the form AND not on the close button
                if (formElement && !formElement.contains(e.target) && !e.target.classList.contains('Form__close')) {
                    this.hideForm()
                }
            }
            // Don't add the outside click handler immediately - wait for form to be shown
            this.outsideClickHandler = outsideClickHandler
            
            // Store handlers for cleanup
            this.escapeHandler = escapeHandler
            this.outsideClickHandler = outsideClickHandler
            
            // Expose show/hide methods globally
            window.showForm = () => this.showForm()
            window.hideForm = () => this.hideForm()
        },
        
        showForm: function() {
            console.log('showForm called')
            
            // Block page scrolling
            document.body.style.overflow = 'hidden'
            
            // Show form using Beast.js css method
            this.css({
                visibility: 'visible'
            })
            
            // Trigger slide animation
            requestAnimationFrame(() => {
                this.css({
                    transform: 'translateX(0)'
                })
            })
            
            // Re-add event listeners if they were removed
            if (this.escapeHandler && !this.listenersActive) {
                document.addEventListener('keydown', this.escapeHandler)
                this.listenersActive = true
            }
            
            // Add outside click handler with a delay to prevent immediate closing
            setTimeout(() => {
                if (this.outsideClickHandler && !this.outsideClickActive) {
                    document.addEventListener('click', this.outsideClickHandler)
                    this.outsideClickActive = true
                }
            }, 100) // Small delay to prevent immediate triggering
        },
        
        hideForm: function() {
            console.log('hideForm called')
            
            // Slide out using Beast.js css method
            this.css({
                transform: 'translateX(100%)'
            })
            
            // Wait for animation to complete, then hide
            setTimeout(() => {
                console.log('Animation complete, hiding form')
                this.css({
                    visibility: 'hidden'
                })
                // Restore page scrolling
                document.body.style.overflow = ''
                
                // Remove event listeners when form is hidden
                if (this.escapeHandler) {
                    document.removeEventListener('keydown', this.escapeHandler)
                }
                if (this.outsideClickHandler) {
                    document.removeEventListener('click', this.outsideClickHandler)
                }
                this.listenersActive = false
                this.outsideClickActive = false
            }, 300) // Match CSS transition duration
        }
    },
    Form__input: {
        tag:'input',
        expand: function () {
            this.domAttr('placeholder', this.text())
            this.domAttr('type', this.param('type'))
            this.domAttr('value', '')
            this.domAttr('autocomplete', 'off')
            this.domAttr('id', this.param('title'))
            this.domAttr('name', this.param('title'))
            this.append()
        },
    },
    Form__textarea: {
        tag:'textarea',
        expand: function () {
            this.domAttr('rows', '4')
            this.domAttr('cols', '4')
            this.domAttr('placeholder', this.param('placeholder'))
            this.domAttr('id', this.param('title'))
            this.domAttr('name', this.param('title'))
            this.append()
        },
    },
})

/**
 * @block Grid Динамическая сетка
 * @tag base
 */
Beast.decl({
    Grid: {
        // finalMod: true,
        mod: {
            Col: '',                // @mod Col {number} Ширина в колонках
            Wrap: false,            // @mod Wrap {boolean} Основной контейнер сетки
            Margin: false,          // @mod Margin {boolean} Поля
            MarginX: false,         // @mod MarginX {boolean} Горизонтальные поля
            MarginY: false,         // @mod MarginY {boolean} Вертикальные поля
            Unmargin: false,        // @mod Unmargin {boolean} Отрицательные поля
            UnmarginX: false,       // @mod UnmarginX {boolean} Отрицательные горизоантальные поля
            UnmarginY: false,       // @mod UnmarginY {boolean} Отрацательные вертикальные поля
            MarginRightGap: false,  // @mod MarginRightGap {boolean} Правый отступ равен — горизоантальное поле
            MarginLeftGap: false,   // @mod MarginLeftGap {boolean} Левый отступ равен — горизоантальное поле
            Cell: false,            // @mod Cell {boolean} Горизонтальный отступ между соседями — межколонник
            Row: false,             // @mod Row {boolean} Вертикальынй отступ между соседями — межколонник
            Rows: false,            // @mod Rows {boolean} Дочерние компоненты отступают на горизонтальное поле
            Tile: false,            // @mod Tile {boolean} Модификатор дочернего компонента (для модификатора Tiles)
            Tiles: false,           // @mod Tiles {boolean} Дочерние компоненты плиткой с отступами в поле
            Center: false,          // @mod Center {boolean} Выравнивание по центру
            Hidden: false,          // @mod Hidden {boolean} Спрятать компонент
            ColCheck: false,        // @mod ColCheck {boolean} Считать ширину в колонках
            Ratio: '',              // @mod Ratio {1x1 1x2 3x4 ...} Пропорция
        },
        param: {
            isMaxCol: false,
        },
        onMod: {
            Col: {
                '*': function (fromParentGrid) {
                    if (fromParentGrid === undefined) {
                        this.param('isMaxCol', this.mod('col') === 'max')
                    }
                }
            }
        },
        onCol: undefined,
        domInit: function () {
            this.param('isMaxCol', this.mod('col') === 'max')

            if (this.mod('ColCheck')) {
                this.onWin('resize', this.checkColWidth)
                requestAnimationFrame(function () {
                    this.checkColWidth()
                }.bind(this))
            }
        },
        onAttach: function (firstTime) {
            this.setParentGrid(!firstTime)
        },
        checkColWidth: function () {
            var prop = this.css('content').slice(1,-1).split(' ')
            var col = parseInt(prop[0])
            var gap = parseInt(prop[1])
            var maxCol = parseInt(prop[2])
            var marginX = parseInt(prop[3])
            var marginY = parseFloat(prop[4])

            if (isNaN(col)) {
                return
            }

            var width = this.domNode().offsetWidth
            var colNum = Math.floor((width + gap) / (col + gap))

            if (colNum > maxCol) {
                colNum = maxCol
            }

            this.trigger('Col', {
                num: colNum,
                edge: window.innerWidth === (colNum * col + (colNum-1) * gap + marginX * 2),
                col: col,
                gap: gap,
                marginX: marginX,
                marginY: marginY,
            })
        },
        setParentGrid: function (recursive, parentGrid) {
            if (this.onCol !== undefined || this.onEdge !== undefined || this.param('isMaxCol')) {
                var that = this

                if (parentGrid === undefined) {
                    parentGrid = this._parentNode
                    while (parentGrid !== undefined && !(parentGrid.isKindOf('Grid') && parentGrid.mod('ColCheck'))) {
                        parentGrid = parentGrid._parentNode
                    }
                }

                if (parentGrid !== undefined) {
                    if (this.onCol || this.param('isMaxCol')) {
                        parentGrid.on('Col', function (e, data) {
                            that.onCol && that.onCol(data.num, data.edge, data)
                            that.param('isMaxCol') && that.mod('Col', data.num, true)
                        })
                    }
                }
            }

            if (recursive !== undefined) {
                var children = this.get('/')
                for (var i = 0, ii = children.length; i < ii; i++) {
                    if (children[i].isKindOf('grid') && !children[i].mod('ColCheck')) {
                        children[i].setParentGrid(recursive, parentGrid)
                    }
                }
            }
        }
    }
})

function grid (num, col, gap, margin) {
    var gridWidth = col * num + gap * (num - 1) + margin * 2
    return gridWidth
}
Beast.decl({
    Footer: {
        expand: function () {
            
            this.append(

                Beast.node("level",{__context:this},"\n                    ",Beast.node("left",undefined,"\n                        ",Beast.node("jp",undefined,"ソフトウェア"),"\n                    "),"\n                    \n                    ",Beast.node("right",undefined,"\n                        ",Beast.node("mid",undefined,"\n                            ",Beast.node("text",undefined,"//////////////////////////// ",Beast.node("br",{"":true}),"+++++++++++++++"),"\n                        "),"\n                        ",Beast.node("ch",undefined,"信頼"),"\n                    "),"\n                "),

                Beast.node("level",{__context:this},"\n                    ",Beast.node("left",undefined,"\n                        ",Beast.node("text",undefined,"PN: 2483-AX9 ",Beast.node("br",{"":true})," DO NOT REMOVE DURING OPERATION"),"\n                    "),"\n\n                    ",Beast.node("right",undefined,"\n                        ",Beast.node("mid",undefined,"\n                        ",Beast.node("text",undefined,"BATCH: 07/2025-A1 ",Beast.node("br",{"":true})," TOL: ±0.02mm"),"\n                    "),"\n                        ",Beast.node("text",{"R":true},"SN: 002194-C ",Beast.node("br",{"":true})," MAT: AL6061-T6"),"\n                    "),"\n                "),

                Beast.node("items",{__context:this},"\n                    ",Beast.node("text",{"Motto":true},"We build software that builds trust"),"\n                    ",Beast.node("Action",{"Type":"White","Size":"XL"},"Tell us about your project"),"\n                "),
                
                Beast.node("copy",{__context:this},"\n                    ",Beast.node("text",{"Copyright":true},"© 2025 Byld. ",Beast.node("l")," All Rights Reserved."),"\n                    ",Beast.node("ark",undefined,"\n                        ",Beast.node("Ark"),"\n                    "),"\n                ")
                
            )

            
        },
        domInit: function fn() {
            // Footer__jp and Footer__ch letter-by-letter rolling animation using Shuffle helper
            if (typeof Shuffle !== 'undefined') {
                const footerJpElements = document.querySelectorAll('.Footer__jp')
                const footerChElements = document.querySelectorAll('.Footer__ch:not(.Footer__ch_Hide)')
                const allFooterTextElements = [...footerJpElements, ...footerChElements]
                
                allFooterTextElements.forEach(element => {
                    Shuffle.animateFooterTextRolling(element, {
                        maxRolls: 6 + Math.floor(Math.random() * 4), // 6-9 rolls per letter
                        rollInterval: 80, // 80ms per roll
                        letterDelay: 100, // 100ms delay between each letter
                        minDelay: 2000, // 2 seconds minimum between animations
                        maxDelay: 2000, // 4 seconds maximum between animations
                        initialDelay: 1500 // 1.5 seconds buffer before repeating
                    })
                })
                
    
            } else {
                console.warn('Shuffle helper not found. Make sure shuffle.js is loaded.')
            }
        }
            
    }   
})

Beast.decl({
    Head: {
        expand: function () {
            this.append(

                Beast.node("CaseData",{__context:this},"\n                    ",Beast.node("left",undefined,"\n                        ",Beast.node("item",{"Logo":true},"\n                            ",Beast.node("Logos",{"":true}),"\n                        "),"\n                        ",Beast.node("item",{"Two":true},"\n                            ",Beast.node("jp",undefined,"ソフトウェア"),"\n                            ",Beast.node("text",undefined,"PN: 2483-AX9 ",Beast.node("br",{"":true})," DO NOT REMOVE DURING OPERATION"),"\n                        "),"\n                    "),"\n\n                    ",Beast.node("mid",undefined,"\n                        ",Beast.node("jp",{"Hide":true},"ソフトウェア"),"\n                        ",Beast.node("text",undefined,"BATCH: 07/2025-A1 ",Beast.node("br",{"":true})," TOL: ±0.02mm"),"\n                    "),"\n                    \n                    ",Beast.node("right",undefined,"\n                        ",Beast.node("text",undefined,"SN: 002194-C ",Beast.node("br",{"":true})," MAT: AL6061-T6"),"\n                        ",Beast.node("ch",undefined,"信頼"),"\n                    "),"\n                "),

                Beast.node("item",{__context:this,"LogoMobile":true},"\n                    ",Beast.node("Logos",{"":true}),"\n                "),

                Beast.node("action",{__context:this},"\n                    ",Beast.node("Action",undefined,"Tell us about your project"),"\n                "),

                Beast.node("menu",{__context:this},"\n                    ",Beast.node("Menu"),"\n                ")

                
            )
        },
        domInit: function fn() {
            // CaseData__jp and CaseData__ch letter-by-letter rolling animation using Shuffle helper
            
            const caseDataJpElements = document.querySelectorAll('.CaseData__jp:not(.CaseData__jp_Hide)')
            const caseDataChElements = document.querySelectorAll('.CaseData__ch')
            const allCaseDataTextElements = [...caseDataJpElements, ...caseDataChElements]
            
            allCaseDataTextElements.forEach(element => {
                Shuffle.animateLetterByLetter(element, {
                    letterDelay: 100,
                    rollInterval: 80,
                    maxRolls: 6 + Math.floor(Math.random() * 4), // 6-9 rolls per letter
                    repeatDelay: 2000 + Math.random() * 2000 // 2-4 seconds
                })
            })
            
        }       
    }
})


/**
 * @block Icon Иконка
 * @tag icon
 */

Beast.decl({
    Icon: {
        mod: {
            Name: '',   // @mod Name {string} Имя глифа
            Size: '24',  // @mod Size {S M! L} Размер
            Color: '',  // @mod Color {string} Имя цвета
        },
        param: {
            color: '', // @param Color {string} hex-код цвета иконки
        },
        expand: function () {
            if (this.param('color')) {
                this.setColor(this.param('color'))
            }
        },
        setColor: function (color) {
            if (color[0] === '#') {
                this.css('background-color', color)
            } else {
                this.mod('color', color)
            }
        },
    }
})

// @example <Icon Name="Attention"/>

Beast.decl({
    Header: {
        expand: function () {
            this.append(
                this.get('title'),
                Beast.node("line",{__context:this}),
                this.get('glyph')
            )
        },
        domInit: function fn() {
            
        }       
    }
})
Beast
.decl('Link', {
    tag:'a',
    
    noElems:true,
    expand: function () {
        this.domAttr('href', this.param('href'))
        if (this.mod('New')) {
            this.domAttr('target', '_blank')
        }
    }
})
Beast
.decl('logo', {
    expand: function() {
        this.append(
			
			Beast.node("image",{__context:this,"":true})
        );
    },
    
    domInit: function fn() {
        // Initialize Logo parallax effects using the ScrollFade helper
        if (typeof ScrollFade !== 'undefined') {
            const logoEffects = ScrollFade.initScrollEffects({
                parallax: {
                    groups: [
                        {
                            selector: '.Logo',
                            speed: 0.85,
                            blur: true,
                            movement: true,
                            blurTrigger: 0.15,
                            blurStart: 0.15,
                            mobileBlurTrigger: 999,
                            mobileBlurStart: 999,
                            maxBlur: 20
                        }
                    ]
                }
            })
            
            // Store reference for cleanup if needed
            this.logoEffects = logoEffects
            
            
        } else {
            console.warn('ScrollFade helper not found. Make sure scrollfade.js is loaded.')
        }
    }
});


Beast.decl({
    Menu: {
        

        expand: function () {
            this.append(
                
                Beast.node("item",{__context:this},"\n                    ",Beast.node("Link",{"href":"#about"},"\n                        ",Beast.node("digit",undefined,"[01]"),"\n                        ",Beast.node("text",undefined,"About"),"\n                    "),"\n                "),
                Beast.node("item",{__context:this},"\n                    ",Beast.node("Link",{"href":"#services"},"\n                        ",Beast.node("digit",undefined,"[02]"),"\n                        ",Beast.node("text",undefined,"What we do"),"\n                    "),"\n                "),
                Beast.node("item",{__context:this},"\n                    ",Beast.node("Link",{"href":"#work"},"\n                        ",Beast.node("digit",undefined,"[03]"),"\n                        ",Beast.node("text",undefined,"What we've built"),"\n                    "),"\n                "),
                Beast.node("item",{__context:this},"\n                    ",Beast.node("Link",{"href":"#process"},"\n                        ",Beast.node("digit",undefined,"[04]"),"\n                        ",Beast.node("text",undefined,"How we build"),"\n                    "),"\n                "),
                Beast.node("item",{__context:this},"\n                    ",Beast.node("Link",{"href":"#reviews"},"\n                        ",Beast.node("digit",undefined,"[05]"),"\n                        ",Beast.node("text",undefined,"What people say"),"\n                    "),"\n                ")
            )
        },
            
        domInit: function fn() {
            // Menu text hover animation using the existing helper function
            const menuTextElements = document.querySelectorAll('.Menu__text')
            
            menuTextElements.forEach(element => {
                Shuffle.animateMenuText(element, {
                    swapsRemaining: 20,
                    interval: 40
                })
            })
            
            // Smooth scroll for anchor links
            const menuLinks = document.querySelectorAll('.Menu a[href^="#"]')
            
            menuLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault()
                    
                    const targetId = this.getAttribute('href').substring(1)
                    const targetElement = document.getElementById(targetId)
                    
                    if (targetElement) {
                        const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY
                        const offsetPosition = elementPosition - 180 // Stop 100px before the element
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        })
                    }
                })
            })
        }
    },
    
     
})


Beast.decl({
    Box: {
        expand: function () {
            this.append(
                Beast.node("corner",{__context:this,"TL":true}),
                Beast.node("corner",{__context:this,"TR":true}),
                Beast.node("corner",{__context:this,"BR":true}),
                Beast.node("corner",{__context:this,"BL":true}),
                this.get('title'),
                Beast.node("wrap",{__context:this},"\n                    ",this.get('text'),"\n                    ",Beast.node("meta"),"\n                    ",this.get('hint'),"\n                    ",Beast.node("footer"),"\n                ")

            )
        },
        domInit: function fn() {
            
        }       
    }
})
/**
 * @block Overlay Интерфейс модальных окон
 * @dep UINavigation grid Typo Control
 * @tag base
 * @ext UINavigation grid
 */
Beast.decl({
    Overlay: {
        inherits: ['UINavigation', 'Grid'],
        mod: {
            Type: 'side', // modal, partsideleft, bottom, top, expand, custom
        },
        onMod: {
            State: {
                active: function (callback) {
                    if (this.mod('Type') === 'expand') {
                        this.moveContextInside()
                    }

                    this.param('activeCallback', callback)
                },
                release: function (callback) {
                    if (this.mod('Type') === 'expand') {
                        this.moveContextOutside()
                    }

                    this.param('releaseCallback', callback)
                },
            }
        },
        param: {
            activeCallback: function () {},
            releaseCallback: function () {},
            title: '',
            subtitle: '',
            theme: {
                backgroundColor: '',
                titleColor: '',
                textColor: '',
                content: false,
            },
            topBar: true,
            background: true,
            margin: true,
        },
        expand: function () {
            if (this.param('topBar')) {
                this.append(Beast.node("topBar",{__context:this}))
                    .mod('HasTopBar', true)
            }

            if (this.param('background')) {
                this.append(Beast.node("background",{__context:this}))
            }

            if (this.mod('Type') === 'partsideleft') {
                this.mod('Col', '1LeftMargins')
            }

            this.append(
                Beast.node("content",{__context:this},this.get())
            )
        },
        on: {
            animationstart: function () {
                if (this.mod('Type') === 'modal') {
                    var overlayHeight = this.domNode().offsetHeight
                    var parentHeight = this.parentNode().domNode().offsetHeight
                    var marginTop = overlayHeight < (parentHeight - 200)
                        ? this.domNode().offsetHeight / -2
                        : undefined

                    this.css({
                        marginLeft: this.domNode().offsetWidth / -2
                    })

                    if (marginTop !== undefined) {
                        this.css({
                            marginTop: marginTop,
                            marginBottom: 0,
                            top: '50%',
                        })
                    }
                }
            },
            animationend: function () {
                if (this.mod('Type') === 'expand' && this.param('scrollContent')) {
                    requestAnimationFrame(function () {
                        if (this.elem('content')[0].domNode().scrollTop === 0) {
                            this.param('options').context.css('transform', 'translate3d(0px,0px,0px)')
                            this.elem('content')[0].domNode().scrollTop = -this.param('scrollContent')
                            this.param('scrollContent', false)
                        }
                    }.bind(this))
                }

                if (this.mod('State') === 'release') {
                    this.param('releaseCallback')()
                } else {
                    this.param('activeCallback')()
                }
            }
        },
        moveContextInside: function () {
            var context = this.param('options').context

            // Calculate Global Offset
            var offsetParent = context.domNode()
            var offsetTop = offsetParent.offsetTop
            while (offsetParent = offsetParent.offsetParent) {
                offsetTop += offsetParent.offsetTop
            }

            // Placeholder
            var placeholder = Beast.node("OverlayPlaceholder",{__context:this})
            this.param('placeholder', placeholder)
            context.parentNode().insertChild([placeholder], context.index(true))
            placeholder
                .css('height', context.domNode().offsetHeight)
                .domNode().className = context.domNode().className

            context.appendTo(
                this.elem('content')[0]
            )

            offsetTop -= 44
            context.css({
                transform: 'translate3d(0px,' + offsetTop + 'px, 0px)'
            })

            // Context is under of the screen top
            if (offsetTop > 0) {
                requestAnimationFrame(function () {
                    context.css({
                        transition: 'transform 300ms',
                        transform: 'translate3d(0px,0px,0px)',
                    })
                })
            }
            // Context is above of the screen top
            else {
                this.param({
                    scrollContent: offsetTop
                })
            }
        },
        moveContextOutside: function () {
            this.param('placeholder').parentNode().insertChild(
                [this.param('options').context], this.param('placeholder').index(true)
            )
            this.param('placeholder').remove()

            this.param('options').context.css({
                transition: ''
            })
        },
        pushToStackNavigation: function fn (options) {
            if (this.mod('Type') === 'expand') {
                options.fog = false
            }

            // Ensure proper initialization before calling inherited method
            if (this.inherited && typeof this.inherited === 'function') {
                this.inherited(fn, options)
            } else {
                // Fallback if inherited method is not available
                console.warn('UINavigation methods not available, using fallback navigation')
                this.show()
            }
        }
    },
    Overlay__topBar: {
        expand: function () {
            this.css({
                backgroundColor: this.parentBlock().param('theme').backgroundColor,
                color: this.parentBlock().param('theme').titleColor,
                boxShadow: this.parentBlock().param('theme').titleColor && 'none',
            })

            var layerIndex = this.parentBlock().parentNode().index()

            this.append(
                Beast.node("topBarActionBack",{__context:this}),
                layerIndex > 1 && Beast.node("topBarActionClose",{__context:this})
            )

            var title = this.parentBlock().param('title')
            var subtitle = this.parentBlock().param('subtitle')

            if (title) {
                var titles = Beast.node("topBarTitles",{__context:this}).append(
                    Beast.node("topBarTitle",{__context:this},title)
                )

                if (subtitle) {
                    titles.append(
                        Beast.node("topBarSubtitle",{__context:this},subtitle)
                    )
                }

                this.append(titles)
            }
        }
    },
    Overlay__topBarTitle: {
        inherits: 'Typo',
        mod: {
            Text: 'M',
            Line: 'M',
            Bold: true,
        },
        expand: function () {
            this.css({
                color: this.parentBlock().param('theme').titleColor
            })
        }
    },
    Overlay__topBarSubtitle: {
        inherits: 'Typo',
        mod: {
            Text: 'S',
        },
        expand: function () {
            this.css({
                color: this.parentBlock().param('theme').textColor
            })
        }
    },
    Overlay__topBarAction: {
        inherits: ['Control', 'Typo'],
        mod: {
            Text: 'M',
            Medium: true,
        },
        expand: function () {
            this.css({
                color: this.parentBlock().param('theme').titleColor
            })
        }
    },
    Overlay__topBarActionBack: {
        inherits: 'Overlay__topBarAction',
        expand: function fn () {
            this.inherited(fn)

            this.append(
                Beast.node("Icon",{__context:this,"Name":"CornerArrowLeft"}).param({
                    color: this.parentBlock().param('theme').titleColor
                }),
                Beast.node("topBarActionLabel",{__context:this},"Назад")
            )
        },
        on: {
            Release: function () {
                this.parentBlock().popFromStackNavigation()
            }
        }
    },
    Overlay__topBarActionClose: {
        inherits: 'Overlay__topBarAction',
        expand: function fn () {
            this.inherited(fn)

            this.append(
                Beast.node("Icon",{__context:this,"Name":"Cross"}).param({
                    color: this.parentBlock().param('theme').titleColor
                })
            )
        },
        on: {
            Release: function () {
                this.parentBlock().popAllFromStackNavigation()
            }
        }
    },
    Overlay__content: {
        inherits: 'Grid',
        expand: function () {
            if (this.parentBlock().param('theme').content) {
                this.css({
                    backgroundColor: this.parentBlock().param('theme').backgroundColor,
                    color: this.parentBlock().param('theme').titleColor,
                    boxShadow: this.parentBlock().param('theme').titleColor && 'none',
                })
            }

            if (this.parentBlock().param('margin')) {
                this.mod({
                    MarginX: true,
                    Wrap: !this.parentBlock().mod('Col'),
                })
            }
        }
    }
})

Beast.decl({
    Process: {
        expand: function () {
            
        },
        domInit: function fn() {
            // Check if mobile - disable animations on mobile for now
            const isMobile = window.innerWidth <= 768
            if (isMobile) {
                return // Exit early on mobile, no animations
            }
            
            // Process step background image fade-in animation
            
            // Configuration object for easy editing of timing values
            const config = {
                // Desktop timing values
                desktop: {
                    triggerPoint: 0.5,        // When first step starts fading (50% of viewport)
                    fadeDistance: 0.3,        // Fade over 30% of viewport height
                    glowTriggerZone: 0.6      // Glow when title is within 60% of viewport
                },
                // Mobile timing values
                mobile: {
                    triggerPoint: 0.3,        // When first step starts fading (70% of viewport)
                    fadeDistance: 0.1,        // Fade over 40% of viewport height
                    glowTriggerZone: 0.3      // Glow when title is within 80% of viewport
                },
                // Mobile breakpoint
                mobileBreakpoint: 768
            }
            
            // Wait for DOM to be fully loaded
            setTimeout(() => {
                const processSteps = document.querySelectorAll('.Process__step')
                
                // Initialize all process steps with opacity 0 for background images
                processSteps.forEach(step => {
                    step.style.position = 'relative'
                    step.style.setProperty('--bg-opacity', '0')
                })
                
                let fadeAnimationTriggered = false
                
                if (processSteps.length > 0) {
                    // Get all process titles for glow effect
                    const processTitles = document.querySelectorAll('.Process__title')
                    
                    // Check if mobile
                    const isMobile = window.innerWidth <= config.mobileBreakpoint
                    
                    function updateProcessAnimations() {
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                        const windowHeight = window.innerHeight
                        
                        // Get timing values based on device
                        const timing = isMobile ? config.mobile : config.desktop
                        const triggerPoint = windowHeight * timing.triggerPoint
                        const fadeDistance = windowHeight * timing.fadeDistance
                        const glowTriggerZone = windowHeight * timing.glowTriggerZone
                        
                        // Check if first process step is in trigger range
                        const firstStep = processSteps[0]
                        if (firstStep) {
                            const stepRect = firstStep.getBoundingClientRect()
                            const stepTop = stepRect.top
                            
                            if (stepTop <= triggerPoint && stepTop > triggerPoint - fadeDistance) {
                                // First step is in fade-in range - apply to all steps
                                const progress = 1 - ((stepTop - (triggerPoint - fadeDistance)) / fadeDistance)
                                const opacity = Math.max(0, Math.min(1, progress))
                                
                                processSteps.forEach(step => {
                                    step.style.setProperty('--bg-opacity', opacity.toString())
                                })
                                
                            } else if (stepTop <= triggerPoint - fadeDistance) {
                                // First step is fully visible - all backgrounds fully visible
                                processSteps.forEach(step => {
                                    step.style.setProperty('--bg-opacity', '1')
                                })
                            } else {
                                // First step hasn't entered fade range yet - all backgrounds hidden
                                processSteps.forEach(step => {
                                    step.style.setProperty('--bg-opacity', '0')
                                })
                            }
                        }
                        
                        // Check each process title for glow effect and track active step
                        let activeStepIndex = -1
                        
                        processTitles.forEach((title, index) => {
                            const rect = title.getBoundingClientRect()
                            const titleCenter = rect.top + rect.height / 2
                            const viewportCenter = windowHeight / 2
                            
                            // Calculate distance from viewport center
                            const distanceFromCenter = Math.abs(titleCenter - viewportCenter)
                            const maxDistance = glowTriggerZone / 2
                            
                            if (distanceFromCenter <= maxDistance) {
                                // Title is in glow zone - add glow class
                                title.classList.add('Process__title_glow')
                                activeStepIndex = index
                                
                                // Also make the corresponding process text fully visible
                                const processStep = title.closest('.Process__step')
                                if (processStep) {
                                    const processText = processStep.querySelector('.Process__text')
                                    if (processText) {
                                        processText.style.opacity = '1'
                                    }
                                }
                            } else {
                                // Title is out of glow zone - remove glow class
                                title.classList.remove('Process__title_glow')
                                
                                // Reset process text opacity to default
                                const processStep = title.closest('.Process__step')
                                if (processStep) {
                                    const processText = processStep.querySelector('.Process__text')
                                    if (processText) {
                                        processText.style.opacity = ''
                                    }
                                }
                            }
                        })
                        
                        // Fade previous steps based on active step
                        processSteps.forEach((step, index) => {
                            if (activeStepIndex >= 0 && index < activeStepIndex) {
                                // This is a previous step - fade it out
                                step.classList.add('Process__step_faded')
                            } else {
                                // This is current or future step - remove fade
                                step.classList.remove('Process__step_faded')
                            }
                        })
                    }
                    
                    // Add scroll event listener for process animations
                    window.addEventListener('scroll', updateProcessAnimations)
                    
                    // Initial call
                    updateProcessAnimations()
                    
                    // Store cleanup function for potential use
                    this.cleanupProcessAnimations = function() {
                        window.removeEventListener('scroll', updateProcessAnimations)
                    }
                }
            }, 1000) // Wait 1 second for DOM to be ready
        }       
    }
})
Beast.decl({
    Review: {
        expand: function () {
            this.append(
                
            )
        },
        domInit: function fn() {
            
        }       
    },
    Review__photo: {
        
        expand: function () {
            this.css({
                backgroundImage: 'url('+ this.param('src') +')'
            })
        }
            
    },
})
Beast.decl({
    Section: {
        expand: function () {
            this.domAttr('id', this.param('id'))
        },
        domInit: function fn() {
            
        }       
    }
})
Beast.decl({
    Services: {
        tag: 'div',
        mod: {
            Size: 'M'
        },
        expand: function fn() {
            this.append(
                Beast.node("item",{__context:this},"End-to-end product development"),
                Beast.node("item",{__context:this},"Engineering support for early-stage teams"),
                Beast.node("item",{__context:this},"Rescue missions for broken products or missed deadlines"),
                Beast.node("item",{__context:this},"Long-term technical partnerships")
            )
        },
        domInit: function fn() {
            // Services__item scroll-triggered fade/unblur animation using helpers
            const servicesItems = document.querySelectorAll('.Services__item')
            
            if (servicesItems.length > 0) {
                const observerOptions = {
                    root: null,
                    rootMargin: '-20% 0px -20% 0px', // Trigger when 20% into viewport
                    threshold: 0.3
                }
                
                const servicesObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Reset and start animation when entering viewport
                            if (!entry.target.classList.contains('Services__item_loaded')) {
                                let animatedItemsCount = 0
                                
                                // Reset all services items first
                                servicesItems.forEach(item => {
                                    item.classList.remove('Services__item_loaded')
                                })
                                
                                // Animate all services items in sequence
                                servicesItems.forEach((item, index) => {
                                    setTimeout(() => {
                                        item.classList.add('Services__item_loaded')
                                        
                                        // Animate the digit (::before element content) after fade-in starts
                                        setTimeout(() => {
                                            if (typeof Shuffle !== 'undefined') {
                                                Shuffle.animateServiceDigit(item, index + 1)
                                            }
                                        }, 200) // Start digit animation 200ms after fade begins
                                        
                                    }, index * 200) // 200ms delay between each item
                                })
                            }
                        } else {
                            // Reset when leaving viewport (scrolling away)
                            entry.target.classList.remove('Services__item_loaded')
                        }
                    })
                }, observerOptions)
                
                // Observe all services items
                servicesItems.forEach(item => {
                    servicesObserver.observe(item)
                })
            }
        }
    }
})

Beast.decl({
    Solution: {
        expand: function () {
            this.append(
                Beast.node("solutions",{__context:this},"\n                    ",Beast.node("plus",undefined,"\n                        ",Beast.node("icon"),"\n                    "),"\n                    ",this.get('item'),"\n                "),
                Beast.node("description",{__context:this},"\n                    ",Beast.node("Box",{"Type":"Solution"},"\n                        ",Beast.node("title",undefined,"ID.1.000"),"\n                        ",Beast.node("hint",undefined,this.get('descr')),"\n                    "),"\n                ")
            )
        },
        domInit: function fn() {
            
        }       
    },

    'Solution__item': {
        
        expand: function () {
            // Use a global counter to track solution items
            if (!window.solutionItemCounter) {
                window.solutionItemCounter = 0
            }
            window.solutionItemCounter++
            
            const idNumber = window.solutionItemCounter.toString().padStart(3, '0')
            
            this.append(
                Beast.node("Box",{__context:this,"Size":"Small"},"\n                    ",Beast.node("title",undefined,"ID.1.",idNumber),"\n                    ",Beast.node("text",{"Type":"Red"},this.get('text')),"\n                    ",Beast.node("hint",{"Type":"Red"},this.get('hint')),"\n                ")
            )
        }
            
    },
    
})
Beast.decl({
    Reviews: {
        expand: function fn() {
            
        },
        domInit: function fn() {
            
        }
    }
})

Beast.decl({

    /**
     * @block UINavigation Компонент паттерна навигации
     * @tag base
     */
    UINavigation: {
        mod: {
            State: '', // active, release
        },
        onMod: {
            State: {
                active: function (callback) {
                    callback && callback()
                },
                release: function (callback) {
                    callback && callback()
                }
            }
        },
        activate: function(callback) {
            this.mod('state', 'active', callback)
        },
        release: function(callback) {
            this.mod('state', 'release', callback)
        },

        /**
         * Pushes itself to StackNavigation
         * @options {context:BemNode, onDidPush:function, onDidPop:function, onWillPush:function, onWillPop:function, fog:boolean}
         */
        pushToStackNavigation: function(options) {
            if (options.fog === undefined) {
                options.fog = true
            }

            this.param('options', options)
            this._parentContextOfKind('UIStackNavigation', options.context).push(this)
            return this
        },

        /**
         * Pops itself from StackNavigation
         */
        popFromStackNavigation: function() {
            this._parentContextOfKind('UIStackNavigation', this).pop()
            return this
        },

        /**
         * Pops all NavigationItems from StackNavigation
         */
        popAllFromStackNavigation: function() {
            this._parentContextOfKind('UIStackNavigation', this).popAll()
            return this
        },

        /**
         * Gets parent node for @context of @kind
         */
        _parentContextOfKind: function(kind, context) {
            var node = context._parentNode
            while (!node.isKindOf(kind)) node = node._parentNode
            return node
        },
    },

    /**
     * @block UIStackNavigation Паттерн стэковой навигации
     * @tag base
     */
    UIStackNavigation: {
        inherits: 'UINavigation',
        param: {
            storedScrollPosition: 0,
        },
        expand: function() {
            this.append(Beast.node("layer",{__context:this},this.get('/')))
            this.topLayer().mod('Root', true)
            
            // Apply any pending scroll position that was stored before the layer was ready
            var pendingScrollPosition = this.param('pendingScrollPosition')
            if (pendingScrollPosition !== undefined) {
                this.topLayer().css('margin-top', -pendingScrollPosition)
                this.param('pendingScrollPosition', undefined) // Clear pending position
            }
        },
        onMod: {
            Pushing: {
                true: function () {
                    this.mod('HasFog', this.topNavigationItem().param('options').fog)
                }
            },
            Popping: {
                false: function () {
                    var topItemOptions = this.topNavigationItem().param('options')
                    if (topItemOptions) {
                        this.mod('HasFog', topItemOptions.fog)
                    }
                }
            }
        },
        onWin: {
            popstate: function (e) {
                var item = this.topNavigationItem()
                item && item.popFromStackNavigation && item.popFromStackNavigation()
            }
        },

        /**
         * Pushes @navigationItem to stack
         */
        push: function(navigationItem) {
            this.storeRootScrollPosition()

            this.append(Beast.node("layer",{__context:this},navigationItem))

            this.mod('Pushed', !this.topLayer().mod('Root'))
                .mod('Pushing', true)

            var onDidPush = this.topNavigationItem().param('options').onDidPush
            var onWillPush = this.topNavigationItem().param('options').onWillPush

            this.topNavigationItem().activate(function() {
                this.mod('Pushing', false)
                onDidPush && onDidPush()
            }.bind(this))

            // history.pushState({UIStackNavigation: true}, '', '#')
            this.updateFogSize(navigationItem)

            onWillPush && onWillPush()
        },

        /**
         * Pops @navigationItem from stack
         */
        pop: function(index) {
            this.mod('Popping', true)

            var navigationItem = index === undefined
                ? this.topNavigationItem()
                : this.navigationItemByIndex(index)

            var onWillPop = navigationItem.param('options').onWillPop
            var onDidPop = navigationItem.param('options').onDidPop

            var onRelease = function() {
                onDidPop && onDidPop()
                this.topLayer().remove()
                this.mod('Pushed', !this.topLayer().mod('Root'))
                this.restoreRootScrollPosition()
                this.mod('Popping', false)
            }.bind(this)

            navigationItem.release(onRelease)

            onWillPop && onWillPop()
        },

        /**
         * Pops all @navigationItem's from stack
         */
        popAll: function () {
            this.elem('layer').forEach(function(layer, index) {
                if (index !== 0) {
                    layer.parentBlock().pop(index)
                }
            })
        },

        /**
         * Gets top layer from stack
         */
        topLayer: function() {
            return this.elem('layer').pop()
        },

        /**
         * Gets NavigationItem of top layer
         */
        topNavigationItem: function() {
            return this.topLayer().get('/')[0]
        },

        /**
         * Gets NavigationItem by layer index
         */
        navigationItemByIndex: function (index) {
            return this.elem('layer')[index].get('/')[0]
        },

        /**
         * Stores scroll position
         */
        storeRootScrollPosition: function() {
            // Always store the current scroll position
            var currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop
            this.param('scrollPosition', currentScrollPosition)
            
            // Try to apply margin to root layer if it exists
            var topLayer = this.topLayer()
            if (topLayer && topLayer.mod && topLayer.mod('Root')) {
                topLayer.css('margin-top', -currentScrollPosition)
            } else {
                // If no root layer yet, store the position for later use
                this.param('pendingScrollPosition', currentScrollPosition)
            }
        },

        /**
         * Resores scroll position
         */
        restoreRootScrollPosition: function() {
            var topLayer = this.topLayer()
            if (topLayer && topLayer.mod && topLayer.mod('Root')) {
                topLayer.css('margin-top', '')
                
                // Restore scroll position if we have one stored
                var scrollPosition = this.param('scrollPosition')
                if (scrollPosition !== undefined) {
                    window.scrollTo(0, scrollPosition)
                }
            }
        },

        /**
         * Set fog size by navigationItem size
         */
        updateFogSize: function (navigationItem) {
            var topLayer = this.topLayer()
            if (topLayer && navigationItem && navigationItem.domNode) {
                var itemHeight = navigationItem.domNode().offsetHeight + 200
                var parentHeight = this.domNode().offsetHeight

                if (itemHeight > parentHeight && topLayer.get('fog')[0]) {
                    topLayer.get('fog')[0].css('height', itemHeight)
                }
            }
        },
    },

    UIStackNavigation__layer: {
        expand: function () {
            this.append(
                this.get('/'), Beast.node("fog",{__context:this,"Active":true})
            )

            if (!this.mod('root')) {
                this.on('mousedown', function (e) {
                    var PointedDom = document.elementFromPoint(e.clientX, e.clientY)
                    if (PointedDom === this.domNode()) {
                        this.parentBlock().popAll()
                    }
                })
            }
        }
    },

    UIStackNavigation__fog: {
        inherits: 'Control',
        mod: {
            Active: false,
        },
        on: {
            Release: function () {
                this.parentBlock().popAll()
            }
        }
    },

    /**
     * @block UISwitchNavigation Паттерн табовой навигации
     * @tag base
     */
    UISwitchNavigation: {
        inherits: 'UINavigation',
        expand: function() {
            this.append(
                this.get('/').map(function(item, index) {
                    return Beast.node("layer",{__context:this},item)
                })
            )
        },

        /**
         * Switches to item element with @index
         */
        switchToIndex: function (index) {
            if (this.elem('layer').length !== 0) {
                this.elem('layer').forEach(function(layer, layerIndex) {
                    var navigationItem = layer.get('/')[0]
                    if (layerIndex === index) {
                        layer.activate()
                    } else {
                        layer.release()
                    }
                })
            } else {
                this.param('switchToIndex', index)
            }
        }
    },
    UISwitchNavigation__layer: {
        inherits: 'UINavigation',
        noElems: true,
        mod: {
            State: 'release'
        },
        expand: function () {
            if (this.parentBlock().param('switchToIndex') === this.index()) {
                this.activate()
            }

            this.append(this.get('/'))
        }
    }
})

/**
 * @block Thumb Тумбнеил
 * @dep grid link
 * @tag thumb video oo snippet
 * @ext link grid
 */
Beast.decl({
    Thumb: {
        inherits: ['Grid'],
        mod: {
            Ratio:'',               // @mod Ratio {1x1 1x2 2x1 2x3 3x2 3x4 4x3 16x10} Пропорция
            Fit:'cover',            // @mod Fit {cover! contain} Растягивание картинки по контейнеру
            Theme:'',               // @mod Theme {app userpic video} Предустановки для разного типа картинок
            Shade: false,           // @mod Shade {boolean} Затенить (для белых границ)
            Grid: false,            // @mod Grid {boolean} Покрыть мелкой сеткой (для картинок плохого качества)
            Parallax: false,        // @mod Parallax {boolean} Параллакс при скролле
            Visibility: 'visible',
            ColorWiz: false,        // @mod ColorWiz {boolean} Отправлять гамму картинки с событием ColorWizMagic
            Shadow: false,          // @mod Shadow {boolean} Тень
            Rounded: false,         // @mod Rounded {boolean} Скругленные углы
        },
        param: {
            src:'',     // @param src {string} Адрес изображения
            width:'',   // @param width {number} Ширина в px
            height:'',  // @param height {number} Высота в px
            title: '',  // @param title {string} Надпись поверх картинки
            ColorWiz: {
                background: '',
                title: '',
                text: '',
                button: '',
            },
        },
        expand: function () {
            var width = this.param('width')
            var height = this.param('height')
            var images = this.elem('image')

            if (this.text()) {
                this.param('src', this.text())
            }

            this.empty()

            if (this.mod('theme') === 'app') {
                this.mod({
                    Ratio:'1x1',
                    Fit:'cover',
                })
            }

            if (this.mod('theme') === 'userpic') {
                this.mod({
                    Ratio:'1x1',
                    Fit:'cover',
                })
            }

            if (this.mod('theme') === 'video') {
                this.mod({
                    Ratio:'16x10',
                    Fit:'cover',
                })
            }

            if (this.mod('Ratio') || (this.param('width') && this.param('height')) || this.mod('Parallax') || this.has('image')) {
                if (this.has('image')) {
                    this.append(
                        Beast.node("images",{__context:this},this.get('image'))
                    )
                } else {
                    if (this.mod('Parallax')) {
                        this.append(
                            Beast.node("image",{__context:this},this.param('src'))
                        )
                    } else {
                        this.css({
                            backgroundImage: 'url('+ this.param('src') +')',
                            width: this.param('width'),
                            height: this.param('height'),
                        })
                    }
                }

                if (this.param('title')) {
                    this.append(
                        Beast.node("title",{__context:this},this.param('title'))
                    )
                }
            } else {
                this.tag('img')
                    .domAttr('src', this.param('src'))

                if (this.param('width')) {
                    this.css('width', width)
                }
                if (this.param('height')) {
                    this.css('height', height)
                }
            }
        },
        domInit: function fn () {
            this.inherited(fn)

            var that = this

            // var width = this.domNode().offsetWidth
            // var height = this.domNode().offsetHeight
            // var img = document.createElement('img')

            // img.setAttribute('src', this.param('src'))
            // img.onload = function () {
            //     if (width && width * window.devicePixelRatio > this.width  ||
            //         height && height * window.devicePixelRatio > this.height ) {
            //         that.mod('Grid', true)
            //     }
            //     img = null
            // }

            if (this.mod('Parallax') || this.mod('Slideshow')) {
                this.checkVisibility()

                if (this.mod('Parallax')) {
                    this.param(
                        'image', this.elem('images')[0] || this.elem('image')[0]
                    )
                }

                var calcOffsetOnScroll = false

                this.onWin('scroll', function () {
                    this.checkVisibility()

                    // Browser gets wrong offset values before window scroll
                    if (!calcOffsetOnScroll) {
                        this.calcOffset(true)
                        calcOffsetOnScroll = true
                    }

                    if (this.mod('Parallax')) {
                        requestAnimationFrame(this.parallaxTranslate.bind(this))
                    }
                }.bind(this))
            }

            if (this.mod('ColorWiz')) {
                requestAnimationFrame(function () {
                    ColorWiz.magic(this.param('src'), function (color) {
                        this.trigger('ColorWizMagic', color)
                    }.bind(this))
                }.bind(this))
            }

            if (this.mod('Theme') === 'app') {
                ColorWiz.isFilled(this.param('src'), function (isFilled) {
                    if (!isFilled) {
                        this.mod('Border', true)
                    }
                }.bind(this))
            }
        },
        calcOffset: function (force) {
            // domNode.offsetParent is null when domNode is not displayed in DOM
            if (this.domNode().offsetParent === null) {
                this.param('display', false)
            }
            else if (!this.param('display') || force) {
                var offset = MissEvent.offset(this.domNode())
                var windowHeight = window.innerHeight
                var offsetHeight = this.domNode().offsetHeight
                var halfOffsetHeight = Math.round(offsetHeight / 2)

                this.param({
                    display: true,
                    offsetleft: offset.left,
                    offsetTop: offset.top,
                    offsetHeight: offsetHeight,
                    halfOffsetHeight: halfOffsetHeight,
                    offsetTopMiddle: offset.top + halfOffsetHeight,
                    offsetBottom: offset.top + offsetHeight,
                    windowHeight: windowHeight,
                    windowHalfHeight: Math.round(windowHeight / 2),
                })
            }
        },
        checkVisibility: function () {
            this.calcOffset()

            if (!this.param('display')) {
                this.mod('Visibility', 'hidden')
                return
            }

            var scrollTop = document.body.scrollTop
            var scrollBottom = scrollTop + this.param('windowHeight')

            if (scrollBottom > this.param('offsetTop') && scrollTop < this.param('offsetBottom')) {
                this.mod('Visibility', 'visible')
            } else {
                this.mod('Visibility', 'hidden')
            }
        },
        parallaxTranslate: function () {
            var middleHeightPoint = window.pageYOffset + this.param('windowHalfHeight')
            var diff = (
                (middleHeightPoint - this.param('offsetTopMiddle')) /
                (this.param('windowHalfHeight') + this.param('halfOffsetHeight')) *
                10
            )

            if (diff > 10) diff = 10
            if (diff < -10) diff = -10

            if (this.param('prevDiff') !== diff) {
                this.param('image').css('transform', 'translateY('+ diff +'px)')
                this.param('prevDiff', diff)
            }
        }
    },

    Thumb__image: {
        mod: {
            State: 'release'
        },
        expand: function () {
            this.empty()
                .css({
                    backgroundImage: 'url('+ this.text() +')',
                    width: this.parentBlock().param('width'),
                    height: this.parentBlock().param('height'),
                })
        }
    },

    Thumb__images: {
        param: {
            timeoutTimer: undefined,
            intervalTimer: undefined,
            timeout: 5000,
        },
        expand: function () {
            this.get('image')[0].mod('State', 'active')
        },
        domInit: function () {
            if (this.parentBlock().mod('Slideshow')) {
                this.parentBlock().onMod('Visibility', 'visible', this.startAnimation.bind(this))
                this.parentBlock().onMod('Visibility', 'hidden', this.stopAnimation.bind(this))
            }
        },
        startAnimation: function () {
            var images = this.get('image')
            var activeIndex
            var activeImage

            this.param(
                'timeoutTimer',
                setTimeout(function () {
                    this.param(
                        'intervalTimer',
                        setInterval(
                            function () {
                                for (var i = 0, ii = images.length; i < ii; i++) {
                                    if (images[i].mod('State') === 'active') {
                                        activeImage = images[i]
                                        activeIndex = i
                                        break
                                    }
                                }

                                if (activeIndex === images.length - 1) {
                                    activeIndex = 0
                                } else {
                                    activeIndex++
                                }

                                activeImage.mod('State', 'release')
                                images[activeIndex].mod('State', 'active')
                            }.bind(this),
                            this.param('timeout')
                        )
                    )
                }.bind(this), 1000 * Math.random())
            )
        },
        stopAnimation: function () {
            if (this.param('timeoutTimer')) {
                clearTimeout(this.param('timeoutTimer'))
            }
            if (this.param('intervalTimer')) {
                clearTimeout(this.param('intervalTimer'))
            }
        },
    },

    Thumb__title: {
        inherits: 'Typo',
        mod: {
            Text: 'S',
            Medium: true,
        }
    },
})

// @example <Thumb Ratio="1x1" Col="3" src="https://jing.yandex-team.ru/files/kovchiy/2017-03-23_02-14-26.png"/>
// @example <Thumb Ratio="1x1" Col="3" Shadow src="https://jing.yandex-team.ru/files/kovchiy/2017-03-23_02-14-26.png"/>
// @example <Thumb Ratio="1x1" Col="3" Grid src="https://jing.yandex-team.ru/files/kovchiy/2017-03-23_02-14-26.png"/>
// @example <Thumb Ratio="1x1" Col="3" Rounded src="https://jing.yandex-team.ru/files/kovchiy/2017-03-23_02-14-26.png"/>