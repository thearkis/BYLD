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
