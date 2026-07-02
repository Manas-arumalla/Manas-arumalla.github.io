// Live canvas simulations used as flagship-project art.
// All sims share a lifecycle (start/stop/destroy + optional action()) and are
// started/stopped by SimCanvas via IntersectionObserver — never run offscreen.

const C = {
  bg: '#0c0e11',
  line: 'rgba(235,240,245,0.08)',
  lineStrong: 'rgba(235,240,245,0.16)',
  text: '#f2f3f5',
  muted: '#9aa3ab',
  faint: '#5c646b',
  accent: '#ff4d00',
  accentSoft: 'rgba(255,77,0,0.25)',
  ok: '#3ddc97',
  cyan: '#59d4e8',
  cyanSoft: 'rgba(89,212,232,0.16)',
}

class BaseSim {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.running = false
    this.t = 0
    this._last = 0
    this._loop = (time) => {
      if (!this.running) return
      const dt = Math.min((time - this._last) / 1000 || 0.016, 0.05)
      this._last = time
      this.fit()
      this.t += dt
      this.frame(dt)
      this._raf = requestAnimationFrame(this._loop)
    }
  }
  fit() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const r = this.canvas.getBoundingClientRect()
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr)
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
    }
    this.w = w / dpr
    this.h = h / dpr
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  start() {
    if (this.running) return
    this.running = true
    this._last = performance.now()
    this._raf = requestAnimationFrame(this._loop)
  }
  stop() {
    this.running = false
    if (this._raf) cancelAnimationFrame(this._raf)
  }
  destroy() { this.stop() }
  renderOnce() { this.fit(); this.frame(0.016) }
  action() {}

  // shared helpers
  clear() {
    const { ctx } = this
    ctx.fillStyle = C.bg
    ctx.fillRect(0, 0, this.w, this.h)
    ctx.strokeStyle = C.line
    ctx.lineWidth = 1
    const step = 36
    ctx.beginPath()
    for (let x = step; x < this.w; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, this.h) }
    for (let y = step; y < this.h; y += step) { ctx.moveTo(0, y); ctx.lineTo(this.w, y) }
    ctx.stroke()
  }
  hud(lines) {
    const { ctx } = this
    ctx.font = '10px "JetBrains Mono", monospace'
    ctx.textAlign = 'right'
    lines.forEach(([k, v, color], i) => {
      const y = 22 + i * 15
      ctx.fillStyle = C.faint
      ctx.fillText(k, this.w - 104, y)
      ctx.fillStyle = color || C.text
      ctx.fillText(v, this.w - 14, y)
    })
    ctx.textAlign = 'left'
  }
}

/* ================= 1. DRONE LANDING ON HEAVING DECK ================= */
export class DroneSim extends BaseSim {
  constructor(canvas) {
    super(canvas)
    this.reset()

    // --- interaction: drag to fling; F = manual flight, A = autopilot ---
    this.manual = false
    this.grabbed = false
    this.hover = false
    this.keys = new Set()
    this._enter = () => { this.hover = true }
    this._leave = () => { this.hover = false }
    canvas.addEventListener('mouseenter', this._enter)
    canvas.addEventListener('mouseleave', this._leave)
    this._down = (e) => {
      const r = canvas.getBoundingClientRect()
      const x = e.clientX - r.left, y = e.clientY - r.top
      if (Math.hypot(x - this.drone.x, y - this.drone.y) < 30) {
        this.grabbed = true
        this._flingV = null
        this._lastP = { x, y, t: performance.now() }
        e.preventDefault()
      }
    }
    this._move = (e) => {
      if (!this.grabbed) return
      const r = canvas.getBoundingClientRect()
      const x = e.clientX - r.left, y = e.clientY - r.top
      const now = performance.now()
      const dtm = Math.max(now - this._lastP.t, 1) / 1000
      this._flingV = { vx: (x - this._lastP.x) / dtm / 9.6, vy: (y - this._lastP.y) / dtm / 9.6 }
      this.drone.x = x
      this.drone.y = y
      this._lastP = { x, y, t: now }
    }
    this._up = () => {
      if (!this.grabbed) return
      this.grabbed = false
      // release with the throw velocity — the controller has to recover
      if (this._flingV) { this.drone.vx = this._flingV.vx; this.drone.vy = this._flingV.vy }
      if (this.phase === 'LANDED') { this.phase = 'TRACK'; this.phaseT = 0; this.landedOffset = null }
    }
    canvas.addEventListener('pointerdown', this._down)
    window.addEventListener('pointermove', this._move, { passive: true })
    window.addEventListener('pointerup', this._up)
    this._key = (e) => {
      const k = e.key.toLowerCase()
      if (e.type === 'keydown' && this.hover && k === 'f') { this.manual = true; this.keys.clear() }
      if (e.type === 'keydown' && k === 'a' && this.manual) {
        this.manual = false
        this.phase = 'APPROACH'
        this.phaseT = 0
      }
      if (this.manual && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        if (e.type === 'keydown') this.keys.add(e.key)
        else this.keys.delete(e.key)
      }
    }
    window.addEventListener('keydown', this._key)
    window.addEventListener('keyup', this._key)
  }
  destroy() {
    super.destroy()
    this.canvas.removeEventListener('mouseenter', this._enter)
    this.canvas.removeEventListener('mouseleave', this._leave)
    this.canvas.removeEventListener('pointerdown', this._down)
    window.removeEventListener('pointermove', this._move)
    window.removeEventListener('pointerup', this._up)
    window.removeEventListener('keydown', this._key)
    window.removeEventListener('keyup', this._key)
  }
  reset() {
    this.phase = 'APPROACH'
    this.phaseT = 0
    this.drone = { x: 60, y: 70, vx: 0, vy: 0, tilt: 0 }
    this.landedOffset = null
  }
  deckState() {
    // 2-DOF seakeeping: heave + pitch
    const cx = this.w * 0.62 + Math.sin(this.t * 0.21) * this.w * 0.16
    const cy = this.h * 0.72 + Math.sin(this.t * 0.9) * 9 + Math.sin(this.t * 0.53 + 1) * 5
    const pitch = Math.sin(this.t * 0.7 + 0.6) * 0.09
    return { cx, cy, pitch }
  }
  frame(dt) {
    const { ctx } = this
    this.clear()
    const deck = this.deckState()
    this.phaseT += dt

    // sea
    ctx.strokeStyle = C.cyan
    ctx.globalAlpha = 0.35
    ctx.beginPath()
    const seaY = this.h * 0.82
    for (let x = 0; x <= this.w; x += 6) {
      const y = seaY + Math.sin(x * 0.035 + this.t * 1.6) * 4 + Math.sin(x * 0.013 - this.t * 0.7) * 3
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.globalAlpha = 1

    // ship + deck
    const dw = 120
    ctx.save()
    ctx.translate(deck.cx, deck.cy)
    ctx.rotate(deck.pitch)
    ctx.fillStyle = '#14181d'
    ctx.strokeStyle = C.lineStrong
    ctx.beginPath()
    ctx.moveTo(-dw / 2 - 14, 0); ctx.lineTo(dw / 2 + 14, 0); ctx.lineTo(dw / 2 - 4, 26); ctx.lineTo(-dw / 2 + 4, 26)
    ctx.closePath(); ctx.fill(); ctx.stroke()
    ctx.strokeStyle = C.accent
    ctx.lineWidth = 2
    ctx.strokeRect(-dw / 2, -2, dw, 2)
    ctx.lineWidth = 1
    // helipad H
    ctx.strokeStyle = C.muted
    ctx.beginPath(); ctx.arc(0, -2, 14, 0, Math.PI * 2); ctx.stroke()
    ctx.font = 'bold 13px "JetBrains Mono", monospace'
    ctx.fillStyle = C.muted
    ctx.textAlign = 'center'
    ctx.fillText('H', 0, 2.5)
    ctx.textAlign = 'left'
    ctx.restore()

    // pad world position (top of deck center)
    const padX = deck.cx, padY = deck.cy - 4

    // controller: PD tracking of phase-dependent setpoint
    const d = this.drone
    if (this.grabbed) {
      // visitor is holding the drone — position follows the pointer (in _move)
      d.tilt *= 0.9
    } else if (this.manual) {
      // manual flight: gravity is on, you have a throttle and lateral thrust
      const g = 70, thrust = 150, lat = 110
      d.vy += (g - (this.keys.has('ArrowUp') ? thrust : 0) + (this.keys.has('ArrowDown') ? 60 : 0)) * dt
      d.vx += ((this.keys.has('ArrowRight') ? lat : 0) - (this.keys.has('ArrowLeft') ? lat : 0)) * dt
      d.vx *= 1 - 0.6 * dt
      d.vy *= 1 - 0.4 * dt
      d.x += d.vx * dt
      d.y += d.vy * dt
      d.tilt += (d.vx * 0.004 - d.tilt) * 0.1
      // walls + sea are unforgiving
      if (d.x < 14) { d.x = 14; d.vx = Math.abs(d.vx) * 0.4 }
      if (d.x > this.w - 14) { d.x = this.w - 14; d.vx = -Math.abs(d.vx) * 0.4 }
      if (d.y < 12) { d.y = 12; d.vy = Math.abs(d.vy) * 0.3 }
      if (d.y > this.h * 0.86) { d.y = this.h * 0.86; d.vy = -Math.abs(d.vy) * 0.5 }
    } else if (this.phase !== 'LANDED') {
      let tx = padX, ty = padY - 36
      if (this.phase === 'APPROACH') {
        ty = padY - 70
        if (Math.abs(d.x - padX) < 26 && this.phaseT > 1.5) { this.phase = 'TRACK'; this.phaseT = 0 }
      } else if (this.phase === 'TRACK') {
        ty = padY - 36
        if (this.phaseT > 2.2) { this.phase = 'DESCEND'; this.phaseT = 0 }
      } else if (this.phase === 'DESCEND') {
        ty = padY - 8 + this.phaseT * 2
      }
      const kp = 2.6, kd = 2.4
      const ax = kp * (tx - d.x) * 0.06 + kd * (0 - d.vx) * 0.55
      const ay = kp * (ty - d.y) * 0.075 + kd * (0 - d.vy) * 0.55
      d.vx += ax * dt * 60 * 0.16
      d.vy += ay * dt * 60 * 0.16
      d.x += d.vx * dt * 60 * 0.16
      d.y += d.vy * dt * 60 * 0.16
      d.tilt += ((tx - d.x) * 0.004 - d.tilt) * 0.12
      // touchdown check
      if (this.phase === 'DESCEND' && d.y >= padY - 9) {
        this.phase = 'LANDED'
        this.phaseT = 0
        this.landedOffset = d.x - padX
      }
    } else {
      // ride the deck
      d.x = padX + this.landedOffset
      d.y = padY - 9
      d.tilt = deck.pitch
      if (this.phaseT > 2.4) this.reset()
    }

    // vision cone drone → pad
    ctx.save()
    ctx.fillStyle = 'rgba(255,77,0,0.07)'
    ctx.strokeStyle = 'rgba(255,77,0,0.35)'
    ctx.beginPath()
    ctx.moveTo(d.x, d.y + 4)
    ctx.lineTo(padX - 26, padY)
    ctx.lineTo(padX + 26, padY)
    ctx.closePath()
    ctx.fill(); ctx.stroke()
    ctx.restore()

    // predicted touchdown marker
    ctx.strokeStyle = C.ok
    ctx.setLineDash([3, 4])
    ctx.beginPath(); ctx.moveTo(padX, padY - 1); ctx.arc(padX, padY - 1, 7, 0, Math.PI * 2); ctx.stroke()
    ctx.setLineDash([])

    // drone
    ctx.save()
    ctx.translate(d.x, d.y)
    ctx.rotate(d.tilt)
    ctx.strokeStyle = C.text
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, 0); ctx.stroke()
    ctx.fillStyle = C.accent
    ctx.fillRect(-5, -4, 10, 6)
    // rotors
    const spin = Math.sin(this.t * 40) * 0.6 + 0.4
    ctx.strokeStyle = `rgba(242,243,245,${0.35 + spin * 0.3})`
    ctx.lineWidth = 1.5
    ;[-16, 16].forEach((rx) => {
      ctx.beginPath()
      ctx.ellipse(rx, -3, 9, 2.2, 0, 0, Math.PI * 2)
      ctx.stroke()
    })
    ctx.restore()

    // interaction hint (y=41: below the DOM panel label)
    ctx.font = '9px "JetBrains Mono", monospace'
    ctx.fillStyle = this.manual ? C.accent : C.faint
    ctx.fillText(this.manual ? '↑ ← → THRUST · A = AUTOPILOT' : 'DRAG TO FLING · F = YOU FLY IT', 16, 41)

    const relV = Math.hypot(d.vx, d.vy).toFixed(1)
    const phaseLabel = this.grabbed ? 'GRABBED' : this.manual ? 'MANUAL' : this.phase
    this.hud([
      ['PHASE', phaseLabel, this.manual ? C.accent : this.phase === 'LANDED' ? C.ok : C.accent],
      ['REL ALT', `${Math.max(0, (padY - 9 - d.y) | 0)} px`],
      ['VEL', `${relV}`],
      ['EST', this.manual ? 'HUMAN PILOT' : 'EKF·ARUCO', C.cyan],
    ])
  }
}

/* ================= 2. CART-POLE UNDER LQR ================= */
export class CartPoleSim extends BaseSim {
  constructor(canvas) {
    super(canvas)
    // state: [x, xd, th, thd], th = 0 upright
    this.s = [0, 0, 0.18, 0]
    this.u = 0
    this.trace = []
    this.pushFlash = 0
    // u = -K·s. Gains minimize the quadratic cost Q=diag(2,1,12,2), R=0.02 via
    // policy search on the full nonlinear plant — see docs/lqr_design.js.
    this.K = [-8, -12, -84.5, -20.5]
    this.params = { M: 1.2, m: 0.35, l: 0.6, g: 9.81 }

    // --- interaction: drag the pole tip, or play against the controller ---
    this.mode = 'AUTO' // AUTO | GAME | FELL
    this.drag = null
    this.keys = new Set()
    this.gameT = 0
    this.fellT = 0
    this.best = parseFloat(localStorage.getItem('mra-lqr-best') || '0')
    this.geom = { cx: 0, cy: 0, poleLen: 1 }
    this._down = (e) => {
      const r = canvas.getBoundingClientRect()
      const x = e.clientX - r.left, y = e.clientY - r.top
      const tipX = this.geom.cx + Math.sin(this.s[2]) * this.geom.poleLen
      const tipY = this.geom.cy - Math.cos(this.s[2]) * this.geom.poleLen
      if (Math.hypot(x - tipX, y - tipY) < 38) { this.drag = { x, y }; e.preventDefault() }
    }
    this._move = (e) => {
      if (!this.drag) return
      const r = canvas.getBoundingClientRect()
      this.drag = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    this._up = () => { this.drag = null }
    canvas.addEventListener('pointerdown', this._down)
    window.addEventListener('pointermove', this._move, { passive: true })
    window.addEventListener('pointerup', this._up)
    this._key = (e) => {
      if (this.mode !== 'GAME') return
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        if (e.type === 'keydown') this.keys.add(e.key)
        else this.keys.delete(e.key)
      }
    }
    window.addEventListener('keydown', this._key)
    window.addEventListener('keyup', this._key)
  }
  destroy() {
    super.destroy()
    this.canvas.removeEventListener('pointerdown', this._down)
    window.removeEventListener('pointermove', this._move)
    window.removeEventListener('pointerup', this._up)
    window.removeEventListener('keydown', this._key)
    window.removeEventListener('keyup', this._key)
  }
  startGame() {
    this.mode = 'GAME'
    this.s = [0, 0, (Math.random() > 0.5 ? 1 : -1) * 0.05, 0]
    this.gameT = 0
    this.trace = []
    this.keys.clear()
  }
  endGame() {
    this.best = Math.max(this.best, this.gameT)
    localStorage.setItem('mra-lqr-best', this.best.toFixed(1))
    this.mode = 'FELL'
    this.fellT = 0
  }
  deriv(s, F) {
    const { M, m, l, g } = this.params
    const [/*x*/, xd, th, thd] = s
    const sin = Math.sin(th), cos = Math.cos(th)
    const den = M + m * sin * sin
    const xdd = (F + m * l * thd * thd * sin - m * g * sin * cos) / den
    const thdd = (-F * cos - m * l * thd * thd * sin * cos + (M + m) * g * sin) / (l * den)
    return [xd, xdd, thd, thdd]
  }
  rk4(s, F, h) {
    const add = (a, b, k) => a.map((v, i) => v + b[i] * k)
    const k1 = this.deriv(s, F)
    const k2 = this.deriv(add(s, k1, h / 2), F)
    const k3 = this.deriv(add(s, k2, h / 2), F)
    const k4 = this.deriv(add(s, k3, h), F)
    return s.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]))
  }
  action(name) {
    if (name === 'game') {
      this.mode === 'GAME' ? (this.mode = 'AUTO', this.s = [0, 0, 0.18, 0]) : this.startGame()
      return
    }
    // disturbance: whack the pole
    this.s[3] += (Math.random() > 0.5 ? 1 : -1) * (1.6 + Math.random() * 1.2)
    this.pushFlash = 1
  }
  frame(dt) {
    const { ctx } = this
    if (this.drag) {
      // visitor is holding the pole: kinematic, physics paused
      const dx = this.drag.x - this.geom.cx
      const dy = this.geom.cy - this.drag.y
      this.s[2] = Math.atan2(dx, dy)
      this.s[1] = 0
      this.s[3] = 0
      this.u = 0
    } else if (this.mode === 'FELL') {
      this.fellT += dt
      if (this.fellT > 3) { this.mode = 'AUTO'; this.s = [0, 0, 0.18, 0]; this.trace = [] }
    } else {
      // physics at fixed substeps
      const sub = 4, h = Math.min(dt, 0.033) / sub
      for (let i = 0; i < sub; i++) {
        const [x, xd, th, thd] = this.s
        if (this.mode === 'GAME') {
          this.u = (this.keys.has('ArrowRight') ? 26 : 0) - (this.keys.has('ArrowLeft') ? 26 : 0)
        } else {
          this.u = -(this.K[0] * x + this.K[1] * xd + this.K[2] * th + this.K[3] * thd)
          this.u = Math.max(-60, Math.min(60, this.u))
        }
        this.s = this.rk4(this.s, this.u, h)
      }
      if (this.mode === 'GAME') {
        this.gameT += dt
        if (Math.abs(this.s[2]) > 1.25 || Math.abs(this.s[0]) > 2.15) this.endGame()
      }
    }
    // keep cart in view
    this.s[0] = Math.max(-2.2, Math.min(2.2, this.s[0]))

    this.clear()
    const scale = Math.min(this.w / 6.2, 110)
    const cx = this.w / 2 + this.s[0] * scale
    const cy = this.h * 0.62
    const poleLen = this.params.l * 2 * scale * 0.85
    this.geom = { cx, cy, poleLen }

    // rail
    ctx.strokeStyle = C.lineStrong
    ctx.beginPath(); ctx.moveTo(20, cy + 14); ctx.lineTo(this.w - 20, cy + 14); ctx.stroke()
    ctx.fillStyle = C.faint
    for (let x = 30; x < this.w - 20; x += 46) ctx.fillRect(x, cy + 17, 12, 2)

    // force arrow
    if (Math.abs(this.u) > 1.5) {
      const dir = Math.sign(this.u)
      ctx.strokeStyle = C.cyan
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx - dir * 34, cy)
      ctx.lineTo(cx - dir * (34 + Math.min(34, Math.abs(this.u) * 1.1)), cy)
      ctx.stroke()
      ctx.lineWidth = 1
    }

    // cart
    ctx.fillStyle = '#1a1f24'
    ctx.strokeStyle = C.lineStrong
    ctx.beginPath()
    ctx.roundRect(cx - 30, cy - 14, 60, 28, 6)
    ctx.fill(); ctx.stroke()
    ;[-16, 16].forEach((wx) => {
      ctx.fillStyle = '#22272d'
      ctx.beginPath(); ctx.arc(cx + wx, cy + 15, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    })

    // pole
    const px = cx + Math.sin(this.s[2]) * poleLen
    const py = cy - Math.cos(this.s[2]) * poleLen
    ctx.strokeStyle = C.text
    ctx.lineWidth = 4
    ctx.beginPath(); ctx.moveTo(cx, cy - 4); ctx.lineTo(px, py); ctx.stroke()
    ctx.lineWidth = 1
    const flash = this.pushFlash
    ctx.fillStyle = flash > 0.05 ? `rgba(255,77,0,${0.6 + flash * 0.4})` : C.accent
    ctx.beginPath(); ctx.arc(px, py, 9 + flash * 5, 0, Math.PI * 2); ctx.fill()
    this.pushFlash *= 0.9

    // θ trace strip
    this.trace.push(this.s[2])
    if (this.trace.length > 260) this.trace.shift()
    const ty0 = this.h - 34
    ctx.strokeStyle = C.line
    ctx.beginPath(); ctx.moveTo(16, ty0); ctx.lineTo(this.w - 16, ty0); ctx.stroke()
    ctx.strokeStyle = C.accent
    ctx.beginPath()
    this.trace.forEach((th, i) => {
      const x = 16 + (i / 259) * (this.w - 32)
      const y = ty0 - Math.max(-26, Math.min(26, th * 60))
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()
    ctx.font = '9px "JetBrains Mono", monospace'
    ctx.fillStyle = C.faint
    ctx.fillText('θ(t)', 16, ty0 - 30)

    // interaction hint (y=41: below the DOM panel label)
    ctx.font = '9px "JetBrains Mono", monospace'
    ctx.fillStyle = this.mode === 'GAME' ? C.accent : C.faint
    ctx.fillText(this.mode === 'GAME' ? '← → TO BALANCE' : 'DRAG THE POLE TIP', 16, 41)

    if (this.mode === 'FELL') {
      ctx.font = 'bold 15px "JetBrains Mono", monospace'
      ctx.fillStyle = C.text
      ctx.textAlign = 'center'
      ctx.fillText(`YOU: ${this.gameT.toFixed(1)}s   ·   LQR: ∞`, this.w / 2, this.h * 0.3)
      ctx.font = '10px "JetBrains Mono", monospace'
      ctx.fillStyle = C.muted
      ctx.fillText(`BEST: ${this.best.toFixed(1)}s — control is harder than it looks`, this.w / 2, this.h * 0.3 + 20)
      ctx.textAlign = 'left'
    }

    if (this.mode === 'GAME') {
      this.hud([
        ['CTRL', 'YOU', C.accent],
        ['TIME', `${this.gameT.toFixed(1)} s`],
        ['BEST', `${this.best.toFixed(1)} s`],
        ['LQR', '∞', C.ok],
      ])
    } else {
      this.hud([
        ['CTRL', this.drag ? 'HUMAN HOLD' : 'LQR', this.drag ? C.accent : C.ok],
        ['θ', `${((this.s[2] * 180) / Math.PI).toFixed(1)}°`],
        ['u', `${this.u.toFixed(1)} N`],
        ['x', `${this.s[0].toFixed(2)} m`],
      ])
    }
  }
}

/* ================= 3. A* PATH PLANNER ================= */
export class PlannerSim extends BaseSim {
  constructor(canvas) {
    super(canvas)
    this.cols = 38
    this.rows = 22
    this.newMap()

    // --- interaction: paint/erase obstacles, watch the planner replan live ---
    this.noPath = false
    this.painting = null // 1 = drawing walls, 0 = erasing
    this._cellAt = (e) => {
      const r = canvas.getBoundingClientRect()
      const cx = Math.floor(((e.clientX - r.left) / r.width) * this.cols)
      const cy = Math.floor(((e.clientY - r.top) / r.height) * this.rows)
      if (cx < 0 || cy < 0 || cx >= this.cols || cy >= this.rows) return null
      return [cx, cy]
    }
    this._protected = (x, y) =>
      (Math.abs(x - this.startCell[0]) < 2 && Math.abs(y - this.startCell[1]) < 2) ||
      (Math.abs(x - this.goalCell[0]) < 2 && Math.abs(y - this.goalCell[1]) < 2)
    this._paint = (e) => {
      const c = this._cellAt(e)
      if (!c || this._protected(...c)) return
      const [x, y] = c
      if (this.grid[y][x] !== this.painting) {
        this.grid[y][x] = this.painting
        this.replanLive()
      }
    }
    this._down = (e) => {
      const c = this._cellAt(e)
      if (!c) return
      e.preventDefault()
      this.painting = this.grid[c[1]][c[0]] ? 0 : 1
      this._paint(e)
    }
    this._move = (e) => { if (this.painting !== null) this._paint(e) }
    this._up = () => { this.painting = null }
    canvas.addEventListener('pointerdown', this._down)
    window.addEventListener('pointermove', this._move, { passive: true })
    window.addEventListener('pointerup', this._up)
  }
  destroy() {
    super.destroy()
    this.canvas.removeEventListener('pointerdown', this._down)
    window.removeEventListener('pointermove', this._move)
    window.removeEventListener('pointerup', this._up)
  }
  replanLive() {
    if (this.solve()) {
      this.noPath = false
      this.step = this.closedOrder.length // skip the expansion animation — replan feels instant
      this.pathProgress = 0
      this.robotI = 0
      this.donePause = 0
    } else {
      this.noPath = true
      this.path = null
      this.closedOrder = []
      this.step = 0
    }
  }
  newMap() {
    const { cols, rows } = this
    for (let attempt = 0; attempt < 30; attempt++) {
      this.grid = Array.from({ length: rows }, () => new Array(cols).fill(0))
      // random blocks
      const nBlocks = 14 + (Math.random() * 8) | 0
      for (let b = 0; b < nBlocks; b++) {
        const bw = 1 + (Math.random() * 4) | 0
        const bh = 1 + (Math.random() * 5) | 0
        const bx = (Math.random() * (cols - bw)) | 0
        const by = (Math.random() * (rows - bh)) | 0
        for (let y = by; y < by + bh; y++) for (let x = bx; x < bx + bw; x++) this.grid[y][x] = 1
      }
      // NB: named startCell (not `start`) to avoid shadowing BaseSim.start()
      this.startCell = [1, (rows / 2 + (Math.random() * 8 - 4)) | 0]
      this.goalCell = [cols - 2, (rows / 2 + (Math.random() * 10 - 5)) | 0]
      this.grid[this.startCell[1]][this.startCell[0]] = 0
      this.grid[this.goalCell[1]][this.goalCell[0]] = 0
      if (this.solve()) break
    }
    // animation state
    this.step = 0
    this.pathProgress = 0
    this.robotI = 0
    this.donePause = 0
    this.noPath = false
  }
  solve() {
    // full A* up-front; we animate the expansion order afterwards
    const { cols, rows, grid } = this
    const key = (x, y) => y * cols + x
    const h = (x, y) => Math.hypot(x - this.goalCell[0], y - this.goalCell[1])
    const open = [{ x: this.startCell[0], y: this.startCell[1], g: 0, f: h(...this.startCell) }]
    const came = new Map()
    const gScore = new Map([[key(...this.startCell), 0]])
    const closedOrder = []
    const seen = new Set()
    while (open.length) {
      open.sort((a, b) => a.f - b.f)
      const cur = open.shift()
      const ck = key(cur.x, cur.y)
      if (seen.has(ck)) continue
      seen.add(ck)
      closedOrder.push([cur.x, cur.y])
      if (cur.x === this.goalCell[0] && cur.y === this.goalCell[1]) {
        const path = [[cur.x, cur.y]]
        let k = ck
        while (came.has(k)) { k = came.get(k); path.push([k % cols, (k / cols) | 0]) }
        this.closedOrder = closedOrder
        this.path = path.reverse()
        return true
      }
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
      for (const [dx, dy] of dirs) {
        const nx = cur.x + dx, ny = cur.y + dy
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || grid[ny][nx]) continue
        if (dx && dy && (grid[cur.y][nx] || grid[ny][cur.x])) continue // no corner cutting
        const ng = cur.g + Math.hypot(dx, dy)
        const nk = key(nx, ny)
        if (ng < (gScore.get(nk) ?? Infinity)) {
          gScore.set(nk, ng)
          came.set(nk, ck)
          open.push({ x: nx, y: ny, g: ng, f: ng + h(nx, ny) })
        }
      }
    }
    return false
  }
  action() { this.newMap() }
  frame(dt) {
    const { ctx, cols, rows } = this
    this.clear()
    const cw = this.w / cols, ch = this.h / rows
    const cell = (x, y, pad = 1) => [x * cw + pad, y * ch + pad, cw - pad * 2, ch - pad * 2]

    // obstacles
    ctx.fillStyle = '#181d22'
    ctx.strokeStyle = C.line
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      if (this.grid[y][x]) { const r = cell(x, y); ctx.fillRect(...r); ctx.strokeRect(...r) }
    }

    // animated expansion
    const speed = 5
    this.step = Math.min(this.step + speed, this.closedOrder.length)
    for (let i = 0; i < this.step; i++) {
      const [x, y] = this.closedOrder[i]
      const age = (this.step - i) / this.closedOrder.length
      ctx.fillStyle = `rgba(89,212,232,${Math.max(0.05, 0.3 - age * 0.25)})`
      ctx.fillRect(...cell(x, y, 2))
    }

    const expansionDone = this.step >= this.closedOrder.length
    if (expansionDone && this.path) {
      this.pathProgress = Math.min(this.pathProgress + dt * 1.4, 1)
      const n = Math.max(2, Math.floor(this.path.length * this.pathProgress))
      ctx.strokeStyle = C.accent
      ctx.lineWidth = 3
      ctx.lineJoin = 'round'
      ctx.shadowColor = C.accent
      ctx.shadowBlur = 10
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const [x, y] = this.path[i]
        const px = x * cw + cw / 2, py = y * ch + ch / 2
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      }
      ctx.stroke()
      ctx.shadowBlur = 0
      ctx.lineWidth = 1

      // robot follows once path fully drawn
      if (this.pathProgress >= 1) {
        this.robotI = Math.min(this.robotI + dt * 14, this.path.length - 1)
        const i0 = Math.floor(this.robotI)
        const i1 = Math.min(i0 + 1, this.path.length - 1)
        const f = this.robotI - i0
        const rx = (this.path[i0][0] * (1 - f) + this.path[i1][0] * f) * cw + cw / 2
        const ry = (this.path[i0][1] * (1 - f) + this.path[i1][1] * f) * ch + ch / 2
        ctx.fillStyle = C.text
        ctx.beginPath(); ctx.arc(rx, ry, 5, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = C.accent
        ctx.beginPath(); ctx.arc(rx, ry, 8.5, 0, Math.PI * 2); ctx.stroke()
        if (this.robotI >= this.path.length - 1) {
          this.donePause += dt
          if (this.donePause > 1.4) this.newMap()
        }
      }
    }

    // start / goal
    const [sx, sy] = this.startCell, [gx, gy] = this.goalCell
    ctx.fillStyle = C.ok
    ctx.beginPath(); ctx.arc(sx * cw + cw / 2, sy * ch + ch / 2, 5, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = C.accent
    ctx.lineWidth = 2
    const g = cell(gx, gy, 3)
    ctx.strokeRect(...g)
    ctx.lineWidth = 1

    // interaction hint / no-path warning (y=41: below the DOM panel label)
    ctx.font = '9px "JetBrains Mono", monospace'
    if (this.noPath) {
      ctx.fillStyle = C.accent
      ctx.fillText('NO PATH — ERASE A WALL (CLICK IT)', 16, 41)
    } else {
      ctx.fillStyle = C.faint
      ctx.fillText('DRAW WALLS WITH YOUR MOUSE', 16, 41)
    }

    this.hud([
      ['ALGO', 'A* (8-conn)', C.cyan],
      ['EXPANDED', `${this.step}`],
      ['PATH', this.path ? `${this.path.length} cells` : 'NONE', this.noPath ? C.accent : C.accent],
    ])
  }
}

/* ================= 4. BIMANUAL HANDOVER (2D CCD IK) ================= */
class PlanarArm {
  constructor(baseX, baseY, lengths, mirror = false) {
    this.base = [baseX, baseY]
    this.L = lengths
    this.q = mirror ? [2.4, -0.9, -0.5] : [0.7, 0.9, 0.5]
  }
  fk() {
    const pts = [[...this.base]]
    let a = 0, x = this.base[0], y = this.base[1]
    for (let i = 0; i < this.L.length; i++) {
      a += this.q[i]
      x += Math.cos(a) * this.L[i]
      y += Math.sin(a) * this.L[i]
      pts.push([x, y])
    }
    return pts
  }
  ee() { const p = this.fk(); return p[p.length - 1] }
  ccd(target, iters = 6, gain = 0.6) {
    for (let it = 0; it < iters; it++) {
      for (let i = this.L.length - 1; i >= 0; i--) {
        const pts = this.fk()
        const j = pts[i]
        const e = pts[pts.length - 1]
        const a1 = Math.atan2(e[1] - j[1], e[0] - j[0])
        const a2 = Math.atan2(target[1] - j[1], target[0] - j[0])
        let da = a2 - a1
        while (da > Math.PI) da -= 2 * Math.PI
        while (da < -Math.PI) da += 2 * Math.PI
        this.q[i] += da * gain
      }
    }
  }
}

// Bimanual ball catching, matching openarm-control's demo: the two arms stand
// side by side like a pair of human arms; balls are thrown AT them from off
// screen on ballistic arcs, and whichever arm is nearest to the predicted
// intercept point reaches out and makes the catch.
export class BimanualSim extends BaseSim {
  constructor(canvas) {
    super(canvas)
    this.inited = false
    this.G = 250 // px/s² gravity
    this.catches = 0
    this.attempts = 0
  }
  init() {
    const u = Math.min(this.w, this.h) / 100
    const L = [36 * u / 3, 30 * u / 3, 20 * u / 3] // total reach ~1.15·min(w,h)/4 — covers the catch zone
    this.armL = new PlanarArm(this.w * 0.42, this.h * 0.84, L)
    this.armR = new PlanarArm(this.w * 0.58, this.h * 0.84, L, true)
    this.phase = 'READY'
    this.phaseT = 0
    this.ball = null // {p:[x,y], v:[vx,vy]}
    this.flash = 0
    this.predict = []
    this.catchPt = null
    this.catcher = 'L'
    this.inited = true
  }
  readyPose(side) {
    const base = side === 'L' ? this.armL.base : this.armR.base
    const dir = side === 'L' ? -1 : 1
    return [base[0] + dir * this.w * 0.05, this.h * 0.6]
  }
  launch() {
    // pick an intercept point inside the arms' shared workspace,
    // then lob a ball at it from off-screen
    const cx = this.w * (0.36 + Math.random() * 0.28)
    const cy = this.h * (0.55 + Math.random() * 0.12) // inside both arms' reach from the 0.84h shoulder line
    this.catchPt = [cx, cy]
    const fromLeft = Math.random() < 0.5
    const x0 = fromLeft ? -16 : this.w + 16
    const y0 = this.h * (0.08 + Math.random() * 0.28)
    const T = 1.0 + Math.random() * 0.4
    const vx = (cx - x0) / T
    const vy = (cy - y0 - 0.5 * this.G * T * T) / T
    this.ball = { p: [x0, y0], v: [vx, vy] }
    this.attempts++
    this.predict = []
    for (let t = 0; t <= T + 0.1; t += 0.06) {
      this.predict.push([x0 + vx * t, y0 + vy * t + 0.5 * this.G * t * t])
    }
    // nearest arm takes the catch — like a person picking a hand
    this.catcher = Math.abs(cx - this.armL.base[0]) <= Math.abs(cx - this.armR.base[0]) ? 'L' : 'R'
    this.phase = 'FLIGHT'
    this.phaseT = 0
  }
  frame(dt) {
    const { ctx } = this
    this.clear()
    if (!this.inited || Math.abs(this.armL.base[0] - this.w * 0.42) > 4) this.init()
    this.phaseT += dt

    const cArm = this.catcher === 'L' ? this.armL : this.armR
    const iArm = this.catcher === 'L' ? this.armR : this.armL
    let cTarget = this.readyPose(this.catcher)
    const iTarget = this.readyPose(this.catcher === 'L' ? 'R' : 'L')

    if (this.phase === 'READY') {
      if (this.phaseT > 0.6) this.launch()
    } else if (this.phase === 'FLIGHT') {
      const b = this.ball
      b.v[1] += this.G * dt
      b.p[0] += b.v[0] * dt
      b.p[1] += b.v[1] * dt
      // catcher reaches for the predicted intercept, then tracks the ball itself
      const dist = Math.hypot(b.p[0] - cArm.ee()[0], b.p[1] - cArm.ee()[1])
      cTarget = dist < this.w * 0.14 ? b.p : this.catchPt
      if (dist < 14) {
        this.catches++
        this.flash = 1
        this.phase = 'CAUGHT'
        this.phaseT = 0
      } else if (b.p[1] > this.h * 0.96 || b.p[0] < -60 || b.p[0] > this.w + 60) {
        this.ball = null
        this.phase = 'READY'
        this.phaseT = 0
      }
    } else if (this.phase === 'CAUGHT') {
      this.ball.p = [...cArm.ee()]
      cTarget = this.readyPose(this.catcher)
      if (this.phaseT > 0.65) { this.phase = 'DROP'; this.phaseT = 0; this.ball.v = [0, 30] }
    } else if (this.phase === 'DROP') {
      // place the ball down and reset for the next throw
      const b = this.ball
      b.v[1] += this.G * dt
      b.p[0] += b.v[0] * dt
      b.p[1] += b.v[1] * dt
      if (b.p[1] > this.h * 0.92) { this.ball = null; this.phase = 'READY'; this.phaseT = 0 }
    }

    cArm.ccd(cTarget, 6, this.phase === 'FLIGHT' ? 0.85 : 0.5)
    iArm.ccd(iTarget, 6, 0.4)

    // shoulder girdle connecting the two arms (humanoid torso hint)
    const bL = this.armL.base, bR = this.armR.base
    ctx.strokeStyle = C.lineStrong
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(bL[0], bL[1]); ctx.lineTo(bR[0], bR[1]); ctx.stroke()
    ctx.lineWidth = 1
    ctx.fillStyle = '#14181d'
    const midX = (bL[0] + bR[0]) / 2
    ctx.beginPath(); ctx.roundRect(midX - 14, bL[1] - 4, 28, this.h * 0.16, 5); ctx.fill()
    ctx.strokeStyle = C.line
    ctx.stroke()

    // predicted trajectory + intercept marker (estimator view)
    if (this.phase === 'FLIGHT' && this.predict.length) {
      ctx.strokeStyle = 'rgba(89,212,232,0.35)'
      ctx.setLineDash([3, 5])
      ctx.beginPath()
      this.predict.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])))
      ctx.stroke()
      ctx.setLineDash([])
      ctx.strokeStyle = C.ok
      ctx.beginPath(); ctx.arc(this.catchPt[0], this.catchPt[1], 8, 0, Math.PI * 2); ctx.stroke()
    }

    // arms (active = the one assigned to catch)
    const drawArm = (arm, active) => {
      const pts = arm.fk()
      ctx.lineCap = 'round'
      for (let i = 0; i < pts.length - 1; i++) {
        ctx.strokeStyle = active ? C.text : C.muted
        ctx.lineWidth = 7 - i * 2
        ctx.beginPath()
        ctx.moveTo(pts[i][0], pts[i][1])
        ctx.lineTo(pts[i + 1][0], pts[i + 1][1])
        ctx.stroke()
      }
      ctx.lineWidth = 1
      pts.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? '#1a1f24' : C.accent
        ctx.beginPath(); ctx.arc(p[0], p[1], i === 0 ? 8 : 4.5 - i * 0.6, 0, Math.PI * 2); ctx.fill()
        if (i === 0) { ctx.strokeStyle = C.lineStrong; ctx.stroke() }
      })
    }
    drawArm(this.armL, this.catcher === 'L' && this.phase !== 'READY')
    drawArm(this.armR, this.catcher === 'R' && this.phase !== 'READY')

    // ball
    if (this.ball) {
      ctx.fillStyle = C.cyan
      ctx.shadowColor = C.cyan
      ctx.shadowBlur = 12
      ctx.beginPath(); ctx.arc(this.ball.p[0], this.ball.p[1], 6.5, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0
    }

    // catch flash
    if (this.flash > 0.04) {
      const fp = this.ball ? this.ball.p : cArm.ee()
      ctx.strokeStyle = `rgba(61,220,151,${this.flash})`
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(fp[0], fp[1], 10 + (1 - this.flash) * 26, 0, Math.PI * 2); ctx.stroke()
      ctx.lineWidth = 1
      this.flash *= 0.92
    }

    const v = this.ball && this.phase === 'FLIGHT' ? Math.hypot(this.ball.v[0], this.ball.v[1]) : 0
    this.hud([
      ['TASK', 'BALL CATCH', C.accent],
      ['ARM', this.phase === 'READY' ? '—' : this.catcher, C.cyan],
      ['BALL', this.phase === 'FLIGHT' ? `${(v / 100).toFixed(1)} m/s` : this.phase],
      ['CAUGHT', `${this.catches}/${this.attempts}`, C.ok],
    ])
  }
}

export const SIM_REGISTRY = {
  drone: DroneSim,
  cartpole: CartPoleSim,
  planner: PlannerSim,
  bimanual: BimanualSim,
}
