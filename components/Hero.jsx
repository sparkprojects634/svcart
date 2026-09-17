'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ArrowRight, Pause, Play } from 'lucide-react'

import { heroData } from "../utils/data"

const SETTLE_RATIO = 1.8
const COVER_SCALE = 3.0 // flower core must exceed half the viewport diagonal

const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect

const PETAL_COUNT = 0

const Flower = ({ color, className = '', style }) => (
    <svg
        viewBox="0 0 200 200"
        aria-hidden="true"
        focusable="false"
        className={className}
        style={style}
    >
        <g fill={color}>
            {Array.from({ length: PETAL_COUNT }).map((_, i) => (
                <ellipse
                    key={i}
                    cx="100"
                    cy="58"
                    rx="21"
                    ry="42"
                    transform={`rotate(${(360 / PETAL_COUNT) * i} 100 100)`}
                />
            ))}
            <circle cx="100" cy="100" r="46" />
        </g>
    </svg>
)

const Star = ({ color, size }) => {
    const px = { small: 14, medium: 22, large: 32 }[size] || 22

    return (
        <svg
            width={px}
            height={px}
            viewBox="0 0 24 24"
            fill={color}
            aria-hidden="true"
            focusable="false"
        >
            {/* four-pointed sparkle */}
            <path d="M12 0c.6 5.6 6.4 11.4 12 12-5.6.6-11.4 6.4-12 12-.6-5.6-6.4-11.4-12-12C5.6 11.4 11.4 5.6 12 0Z" />
        </svg>
    )
}

const HeroSlider = () => {
    const { settings, common, slides } = heroData

    const revealMs = settings.transitionDuration
    const settleMs = Math.round(revealMs * SETTLE_RATIO)
    const holdMs = Math.max(settings.slideDuration - revealMs, 600)

    const [index, setIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(settings.autoplay)
    const [reducedMotion, setReducedMotion] = useState(false)

    const rootRef = useRef(null)
    const baseBgRef = useRef(null)
    const flowerRef = useRef(null)
    const outgoingRef = useRef(null)
    const incomingRef = useRef(null)

    // index the DOM is currently *showing*; lags `index` during a transition
    const paintedRef = useRef(0)
    const busyRef = useRef(false)
    const timerRef = useRef(null)

    const count = slides.length
    const slide = slides[index]
    const painted = slides[paintedRef.current]

    /* -------------------------------------------------------------- *
     * reduced motion
     * -------------------------------------------------------------- */
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        const update = () => setReducedMotion(mq.matches)

        update()
        mq.addEventListener('change', update)

        return () => mq.removeEventListener('change', update)
    }, [])

    /* -------------------------------------------------------------- *
     * the transition itself
     * -------------------------------------------------------------- */
    useIsomorphicLayoutEffect(() => {
        if (index === paintedRef.current) return

        const base = baseBgRef.current
        const flower = flowerRef.current
        const outgoing = outgoingRef.current
        const incoming = incomingRef.current

        if (!base || !flower || !incoming) return

        const next = slides[index]

        if (reducedMotion) {
            gsap.set(base, { backgroundColor: next.theme.background })
            gsap.set([incoming, outgoing], { clearProps: 'all' })
            paintedRef.current = index
            busyRef.current = false
            return
        }

        busyRef.current = true

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => {
                    busyRef.current = false
                },
            })

            // 1. flower blooms out of the centre in the incoming colour
            tl.fromTo(
                flower,
                { scale: 0, rotate: -35, autoAlpha: 1 },
                {
                    scale: COVER_SCALE,
                    rotate: 0,
                    duration: revealMs / 1000,
                    ease: 'power1.out',
                },
                0
            )

            // 2. old content drifts left and fades while the bloom covers it
            if (outgoing) {
                tl.to(
                    outgoing,
                    {
                        xPercent: -14,
                        autoAlpha: 0,
                        duration: (revealMs * 0.8) / 1000,
                        ease: 'power2.in',
                    },
                    0
                )
            }

            // 3. once covered, commit the flat background and hide the flower
            tl.set(base, { backgroundColor: next.theme.background }, revealMs / 1000)
            tl.set(flower, { autoAlpha: 0 }, revealMs / 1000)

            // 4. new content settles in from the right — the long ease-out tail
            tl.fromTo(
                incoming,
                { xPercent: 18, autoAlpha: 0 },
                {
                    xPercent: 0,
                    autoAlpha: 1,
                    duration: settleMs / 1000,
                    ease: 'power3.out',
                },
                (revealMs * 0.55) / 1000
            )

            tl.fromTo(
                incoming.querySelectorAll('[data-settle]'),
                { y: 26, autoAlpha: 0 },
                {
                    y: 0,
                    autoAlpha: 1,
                    duration: settleMs / 1000,
                    ease: 'power3.out',
                    stagger: 0.05,
                },
                (revealMs * 0.7) / 1000
            )

            paintedRef.current = index
        }, rootRef)

        return () => ctx.revert()
    }, [index, reducedMotion, revealMs, settleMs, slides])

    /* -------------------------------------------------------------- *
     * floating stars
     * -------------------------------------------------------------- */
    useIsomorphicLayoutEffect(() => {
        if (reducedMotion || !common.stars.enabled || !common.stars.animation.enabled) {
            return
        }

        const ctx = gsap.context(() => {
            gsap.to('[data-star]', {
                y: -14,
                rotate: 12,
                duration: common.stars.animation.duration,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
                stagger: { each: 0.35, from: 'random' },
            })
        }, rootRef)

        return () => ctx.revert()
    }, [reducedMotion, common.stars])

    /* -------------------------------------------------------------- *
     * navigation + autoplay
     * -------------------------------------------------------------- */
    const goTo = useCallback(
        (next) => {
            if (busyRef.current) return

            const target = settings.loop
                ? (next + count) % count
                : Math.min(Math.max(next, 0), count - 1)

            setIndex(target)
        },
        [count, settings.loop]
    )

    useEffect(() => {
        if (!isPlaying || reducedMotion || count < 2) return

        timerRef.current = window.setTimeout(() => {
            goTo(index + 1)
        }, holdMs)

        return () => window.clearTimeout(timerRef.current)
    }, [index, isPlaying, reducedMotion, holdMs, count, goTo])

    const onKeyDown = (event) => {
        if (event.key === 'ArrowRight') {
            event.preventDefault()
            goTo(index + 1)
        }

        if (event.key === 'ArrowLeft') {
            event.preventDefault()
            goTo(index - 1)
        }
    }

    /* -------------------------------------------------------------- *
     * one slide's content — rendered twice (outgoing + incoming)
     * -------------------------------------------------------------- */
    const renderContent = (data, refObject, isLive) => (
        <div
            ref={refObject}
            aria-hidden={!isLive}
            className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center md:px-10"
        >
            <h2
                data-settle
                className="max-w-[16ch] font-extrabold uppercase leading-[0.92] tracking-tight text-[clamp(2rem,7.5vw,5.5rem)]"
                style={{ color: data.theme.text }}
            >
                {data.content.title}
            </h2>

            {data.content.subtitle && (
                <p
                    data-settle
                    className="mt-3 text-[clamp(0.9rem,1.6vw,1.25rem)] font-medium opacity-90"
                    style={{ color: data.theme.text }}
                >
                    {data.content.subtitle}
                </p>
            )}

            {/* product + badges */}
            <div
                data-settle
                className="relative mt-5 flex w-full max-w-[min(90vw,620px)] items-center justify-center"
            >
                <div className="relative h-[min(38vh,320px)] w-full">
                    <Image
                        src={data.variants?.[0]?.image || data.image.src}
                        alt={data.variants?.[0]?.alt || data.image.alt}
                        fill
                        sizes="(max-width: 768px) 90vw, 620px"
                        className="object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.28)]"
                        priority={data.id === 1}
                    />
                </div>

                {data.badges?.slice(0, 2).map((badge, i) => (
                    <div
                        key={badge.type}
                        className={`
                            absolute hidden aspect-square w-[clamp(74px,9vw,118px)]
                            flex-col items-center justify-center gap-0.5 rounded-full
                            border-2 px-2 text-center leading-[1.1] sm:flex
                            ${i === 0 ? '-left-2 top-6 md:left-0' : '-right-2 bottom-4 md:right-0'}
                        `}
                        style={{
                            borderColor: data.theme.buttonBorder,
                            color: data.theme.text,
                            backgroundColor: 'rgba(0,0,0,0.12)',
                        }}
                    >
                        <span className="text-[clamp(6px,0.62vw,9px)] font-semibold uppercase tracking-wider opacity-90">
                            {badge.label}
                        </span>

                        {badge.value && (
                            <span className="text-[clamp(14px,1.7vw,26px)] font-extrabold leading-none">
                                {badge.value}
                            </span>
                        )}

                        {badge.subLabel && (
                            <span className="text-[clamp(6px,0.62vw,9px)] font-semibold uppercase tracking-wider opacity-90">
                                {badge.subLabel}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* CTAs */}
            <div
                data-settle
                className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-4"
            >
                <Link
                    href={common.cta.primary.href}
                    tabIndex={isLive ? 0 : -1}
                    className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-[13px] font-bold uppercase tracking-wider transition-transform duration-300 hover:-translate-y-0.5"
                    style={{
                        backgroundColor: data.theme.buttonPrimary,
                        color: data.theme.buttonPrimaryText,
                    }}
                >
                    {common.cta.primary.label}
                    <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                    href={common.cta.secondary.href}
                    tabIndex={isLive ? 0 : -1}
                    className="group inline-flex items-center justify-center gap-2 rounded-full border-2 px-7 py-3 text-[13px] font-bold uppercase tracking-wider transition-transform duration-300 hover:-translate-y-0.5"
                    style={{
                        backgroundColor: data.theme.buttonSecondary,
                        color: data.theme.buttonSecondaryText,
                        borderColor: data.theme.buttonBorder,
                    }}
                >
                    {common.cta.secondary.label}
                    <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    )

    const prev = slides[(index - 1 + count) % count]
    const next = slides[(index + 1) % count]

    return (
        <section
            ref={rootRef}
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured products"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onMouseEnter={() => settings.pauseOnHover && setIsPlaying(false)}
            onMouseLeave={() => settings.pauseOnHover && setIsPlaying(settings.autoplay)}
            className="relative isolate w-full overflow-hidden outline-none h-[clamp(520px,100svh,900px)]"
        >
            {/* 1. flat background — swapped mid-transition */}
            <div
                ref={baseBgRef}
                className="absolute inset-0 -z-30"
                style={{ backgroundColor: painted.theme.background }}
            />

            {/* 2. optional artwork layer from image.src */}
            {/* {painted.image?.src && (
                <div className="absolute inset-0 -z-20 opacity-25 mix-blend-luminosity">
                    <Image
                        src={painted.image.src}
                        alt=""
                        fill
                        sizes="100vw"
                        className={painted.image.objectFit === 'cover' ? 'object-cover' : 'object-contain'}
                        priority
                    />
                </div>
            )} */}

            {/* 3. faint resting pattern */}
            {painted.decorative?.backgroundPattern && (
                <Flower
                    color={painted.theme.text}
                    className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[125vmin] w-[125vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
                />
            )}

            {/* 4. the reveal bloom — outer div centres, inner div is GSAP's
                   alone so the transform utilities can't be overwritten */}
            <div className="pointer-events-none absolute inset-0 -z-[5] grid place-items-center overflow-hidden">
                <div
                    ref={flowerRef}
                    className="h-[100vmax] w-[100vmax] opacity-0 will-change-transform"
                >
                    <Flower
                        color={slide.theme.background}
                        className="h-full w-full"
                    />
                </div>
            </div>

            {/* 5. edge peeks — previous / next product */}
            {painted.decorative?.leftProduct && (
                <div className="pointer-events-none absolute left-0 top-1/2 hidden h-[34vh] w-[14vw] -translate-x-1/3 -translate-y-1/2 opacity-40 blur-[1px] lg:block">
                    <Image
                        src={prev.variants?.[0]?.image || prev.image.src}
                        alt=""
                        fill
                        sizes="14vw"
                        className="object-contain"
                    />
                </div>
            )}

            {painted.decorative?.rightProduct && (
                <div className="pointer-events-none absolute right-0 top-1/2 hidden h-[34vh] w-[14vw] translate-x-1/3 -translate-y-1/2 opacity-40 blur-[1px] lg:block">
                    <Image
                        src={next.variants?.[0]?.image || next.image.src}
                        alt=""
                        fill
                        sizes="14vw"
                        className="object-contain"
                    />
                </div>
            )}

            {/* 6. sparkles */}
            {common.stars.enabled &&
                common.stars.positions.slice(0, common.stars.count).map((pos, i) => (
                    <span
                        key={i}
                        data-star
                        aria-hidden="true"
                        className="pointer-events-none absolute hidden md:block"
                        style={pos}
                    >
                        <Star color={common.stars.color} size={common.stars.size} />
                    </span>
                ))}

            {/* 7. content — outgoing stays mounted until the bloom covers it */}
            {paintedRef.current !== index && renderContent(painted, outgoingRef, false)}
            {renderContent(slide, incomingRef, true)}

            {/* 8. controls */}
            <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4">
                <div className="flex items-center gap-2" role="tablist" aria-label="Choose slide">
                    {slides.map((item, i) => (
                        <button
                            key={item.id}
                            type="button"
                            role="tab"
                            aria-selected={i === index}
                            aria-label={item.product.name}
                            onClick={() => goTo(i)}
                            className="h-2.5 rounded-full transition-all duration-300"
                            style={{
                                width: i === index ? 30 : 10,
                                backgroundColor: slide.theme.text,
                                opacity: i === index ? 1 : 0.4,
                            }}
                        />
                    ))}
                </div>

                {settings.autoplay && (
                    <button
                        type="button"
                        onClick={() => setIsPlaying((v) => !v)}
                        aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                        className="grid h-8 w-8 place-items-center rounded-full border transition-opacity hover:opacity-70"
                        style={{ borderColor: slide.theme.text, color: slide.theme.text }}
                    >
                        {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                    </button>
                )}
            </div>
        </section>
    )
}

export default HeroSlider